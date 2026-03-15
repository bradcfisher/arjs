
import { EventDispatcher } from "./EventDispatcher.js";
import { AudioNotification } from "./AudioNotification.js";
import { AudioClip } from "./AudioClip.js";


/**
 * Represents an audio instance prepared for playback by an AudioManager.
 *
 * Events:
 * @event start			Sent when a clip begins playing
 * @event stop			Sent when a clip stops playing
 * @event loop			Sent when a clip repeats
 */
export class ActiveAudio extends EventDispatcher {

	/**
	 * @type {AudioManager}
	 */
	#manager;

	/**
	 * The AudioManager this instance was created by.
	 */
	get manager() {
		return this.#manager;
	}

	/**
	 * @type {number}
	 */
	#duration;

	/**
	 * The length of the clip in seconds. This value is based on the native sample rate of
	 * the underlying buffer and independent of the playbackRate.
	 */
	get duration() {
		return this.#duration;
	}

	/**
	 * The configuration to apply to any AudioBufferSourceNodes created for playback.
	 * @type {{
	 *     buffer: AudioBuffer,
	 *     detune: number,
	 *     playbackRate: number,
	 *     loop: boolean,
	 *     loopStart: number,
	 *     loopEnd: number
	 * }}
	 */
	#config;

	/**
	 * @type {AudioBufferSourceNode?}
	 */
	#audioBufferSourceNode;

	/**
	 * The destination node the sound should be attached to.
	 * If the clip has gain applied to it, this will be a GainNode.
	 * Otherwise, this will be the context's destination node.
	 * @type {AudioNode}
	 */
	#destination;

	/**
	 * @type {AudioNotification[]}
	 */
	#notifications = [];

	/**
	 * The time when playback was scheduled to begin.
	 * @type {number?}
	 */
	#startTime;

	/**
	 * The time within the clip where playback should begin in seconds. This value is
	 * based on the native sample rate of the underlying buffer and independent of the
	 * playbackRate.
	 *
	 * @type {number}
	 */
	#position;

	/**
	 * The ID of any currently scheduled notification for this audio.
	 */
	#scheduledNotificationId;

	/**
	 * Event handler to add to AudioBufferSourceNodes to handle the 'ended' event.
	 */
	#endedListener;

	/**
	 * The current status of the audio. One of 'stopped', 'scheduled' or 'playing'.
	 */
	get status() {
		if (this.#startTime != null) {
			if (this.#manager.currentTime < this.#startTime) {
				return 'scheduled';
			}
			return 'playing';
		}
		return 'stopped';
	}

	/**
	 * The current playback position in seconds within the clip.
	 *
	 * @type {number}
	 */
	get position() {
		if (this.#startTime == null || this.#manager.currentTime < this.#startTime) {
			return this.#position;
		}
		return this.#contextTimeToClipTime(this.#manager.currentTime, this.#startTime, this.#position);
	}

	set position(when) {
		if (when < 0) {
			when = 0;
		} else if (when >= this.length) {
			when = this.length - 1;
		}

		if (this.#startTime != null) {
			// Stop and restart playing the audio starting at the new position
			this.#stop(0, true);
			this.#position = when;
			this.#play(0, true);
		} else {
			this.#position = when;
		}
	}

	/**
	 *
	 * @param {AudioManager} manager the AudioManager through which the playback will be performed.
	 * @param {AudioClip} clip the AudioClip describing the audio and playback parameters.
	 */
	constructor(manager, clip) {
		this.#manager = manager;
		this.#config = {
			"buffer": clip.buffer,
			"detune": clip.detune,
			"playbackRate": clip.playbackRate,
			"loop": clip.loop,
			"loopStart": clip.startSample,
			"loopEnd": clip.endSample
		};

		this.#endedListener = () => { this.#handleStop(); };

		if (clip.gain != 1) {
			this.#destination = new GainNode(this.#manager.context, {
				"gain": clip.gain
			});

			this.#destination.connect(this.#manager.destination);
		} else {
			this.#destination = this.#manager.destination;
		}

		this.#duration = clip.length / clip.buffer.sampleRate;

		for (let notification of clip.notifications) {
			this.addNotification(notification);
		}
	}

	/**
	 * Schedules the audio to start playing at the specified time.
	 *
	 * @param {number?} when The time, in seconds to wait before the sound should begin to play.
	 *        The default value is 0, which starts playing the audio immediately.
	 *
	 * @throws {Error} if the audio has already been scheduled to play or is currently playing.
	 */
	play(when) {
		if (this.status != 'stopped') {
			throw new Error("play() called while audio is " + this.status +
				". The audio must be stopped before play can be called.");
		}

		if (when == null || when < 0) {
			when = 0;
		}

		this.#play(when);
	}

	/**
	 * Schedules the audio to start playing at the specified time.
	 *
	 * @param {number} when the time, in seconds to wait before the sound should begin to play.
	 *        The default value is 0, which starts playing the audio immediately.
	 * @param {boolean=} suppressStartEvent whether to suppress the dispatch of the 'start' event or not.
	 *        Typically used when repositioning the stream.
	 */
	#play(when, suppressStartEvent = false) {
		this.#startTime = this.#manager.currentTime + when;

		this.#audioBufferSourceNode = new AudioBufferSourceNode(this.#manager.context, this.#config);
		this.#audioBufferSourceNode.connect(this.#destination);
		this.#audioBufferSourceNode.addEventListener('ended', this.#endedListener);
		this.#audioBufferSourceNode.start(this.#manager.currentTime + when, this.#position);

		if (when > 0) {
			// Start scheduled for the future, schedule the start notification
			this.#scheduledNotificationId =
			    this.#manager.scheduleNotification(
					this.#manager.currentTime + when,
					() => { this.#handleStart(suppressStartEvent); }
				);
		} else {
			this.#handleStart(suppressStartEvent);
		}
	}

	#handleStart(suppressStartEvent) {
		this.#scheduledNotificationId = null;

		if (!suppressStartEvent) {
			this.triggerEvent('start', {
				target: this
			});
		}

		let index = 0;
		if (this.#position > 0) {
			// Find the first notification on or after the current position
			for (let notification of this.#notifications) {
				if (this.#position <= notification.when) {
					break;
				}
			}
		}

		this.#scheduleNextNotification(index);
	}

	/**
	 * Converts a time in the context's clock to a time in the clip's timeline.
	 *
	 * The result is computed as `(when - clipStartTime) * clip.playbackRate + clipStartOffset`.
	 *
	 * @param {number} when a time in seconds, relative to the context's clock coordinate system.
	 * @param {number=} clipStartTime time in the context timeline when the clip started
	 *        playing. Defaults to 0.
	 * @param {number=} clipStartOffset time offset in the clip's timeline indicating the
	 *        offset where playback started. Defaults to 0.
	 *
	 * @returns the context time converted to a time relative to the clip's timeline.
	 */
	#contextTimeToClipTime(when, clipStartTime = 0, clipStartOffset = 0) {
		return (when - clipStartTime) * this.playbackRate + clipStartOffset;
	}

	/**
	 * Converts a time in the clip's clock to a time in the context's timeline.
	 *
	 * The result is computed as `((when - clipStartOffset) / clip.playbackRate) + clipStartTime`.
	 *
	 * @param {number} when a time in seconds, relative to the clip's timeline coordinate system.
	 * @param {number=} clipStartTime time in the context timeline when the clip started
	 *        playing. Defaults to 0.
	 * @param {number=} clipStartOffset time offset in the clip's timeline indicating the
	 *        offset where playback started. Defaults to 0.
	 *
	 * @returns the clip time converted to a time relative to the context's clock.
	 */
	#clipTimeToContextTime(when, clipStartTime = 0, clipStartOffset = 0) {
		return ((when - clipStartOffset) / this.playbackRate) + clipStartTime;
	}

	/**
	 * Schedules the next notification
	 *
	 * @param {number} index the index of the notification to schedule.
	 */
	#scheduleNextNotification(index, suppressStopEvent = false) {
		const now = this.#contextTimeToClipTime(this.#manager.currentTime, this.#startTime, this.#position);

		let when;
		let callback;

		while (index < this.#notifications.length) {
			const notification = this.#notifications[index];
			index++;

			if (notification.when <= now) {
				// execute the notification immediately
				notification.callback();
			} else {
				when = this.#clipTimeToContextTime(notification.when, this.#startTime, this.#position);
				callback = () => { notification.callback(); this.#scheduleNextNotification(index); }
				break;
			}
		}

		if (callback == null) {
			when = this.#clipTimeToContextTime(this.duration, this.#startTime, this.#position);
			callback = () => { this.#handleStop(suppressStopEvent); };
		}

		if (when <= now) {
			this.#handleStop(suppressStopEvent);
		} else {
			this.#scheduledNotificationId = this.#manager.scheduleNotification(when, callback);
		}
	}

	/**
	 * Schedules the audio to stop playing at the specified time.
	 *
	 * This method does nothing if the audio is not currently scheduled or playing.
	 *
	 * @param {number} when the time, in seconds when the audio should stop playing.
	 *        The interpretation of this value is dependent on the value of the
	 *        `relativeTo` parameter. The default value is 0, which stops playing
	 *        the audio immediately. Negative values or values in the past will
	 *        also stop playing immediately.
	 * @param {('now'|'context'|'clip')=} relativeTo how to interpret the when parameter.
	 *        If 'now' (the default), the time is interpereted as the number of seconds in
	 *        the future.
	 *        If 'context', the time is interpreted as an absolute time in the context
	 *        clock coordinate space.
	 *        If 'clip', the time is interpreted as a position within the clip coordinate
	 *        space. In this case, the value is based on the native sample rate of the
	 *        underlying buffer and independent of the playbackRate.
	 */
	stop(when, relativeTo = 'now') {
		if (this.status == 'stopped') {
			console.debug("Ignoring stop request. Audio is not currently playing.");
			return;
		}

		if (when == null || when < 0) {
			when = 0;
		}

		if (relativeTo == 'now') {
			when = this.#manager.currentTime + when;
		} else if (relativeTo == 'clip') {
			when = this.#clipTimeToContextTime(when, this.#startTime, this.#position);
		}

		this.#stop(when);
	}

	/**
	 * Schedules the audio to stop playing at the specified time.
	 *
	 * @param {number} when the time to stop playing the audio, in the context's clock coordinate
	 *        space.
	 * @param {boolean=} suppressStopEvent whether to suppress the dispatch of the 'stop' event or not.
	 *        Typically used when repositioning the stream.
	 */
	#stop(when, suppressStopEvent = false) {

		if (suppressStopEvent) {
			// define a 2nd listener for suppressed event
			// try removing both event listeners
			this.#audioBufferSourceNode.removeEventListener('ended', this.#endedListener);

			// TODO: add new event listener if scheduled in future...
		}

		// If stopping immediately, remove any ended listeners before stopping

		this.#audioBufferSourceNode.stop(when);

		if (stopNow) {
			// handle stop actions immediately
			this.#handleStop(suppressStopEvent);
		}

	}

	#handleStop(suppressStopEvent) {
		// Record the current position for potential restart
		this.#position = this.position;

		// Remove any pending notification
		this.#manager.removeNotification(this.#scheduledNotificationId);
		this.#scheduledNotificationId = null;

		this.#audioBufferSourceNode = null;


	}

}







/**
 *
 * Events:
 *  - load			Sent when all currently loading clips have completed.
 *  - error			Sent when a clip load operation fails.
 *  - notification	Sent when a notification time is reached.
 */
export class AudioManager
	extends EventDispatcher
{

	/**
	 * @type {AudioContext}
	 */
	#context;

	/**
	 * The currently registered clips.
	 * @type {Map<string, AudioClip>}
	 */
	#clips;

	/**
	 * Currently loading clips.
	 * @see {@link clipFromArrayBuffer}
	 * @type {Map<string, [any, PromiseLike<AudioClip>]>}
	 */
	#loading;

	/**
	 * Linked list of registered notifications.
	 * @see addNotification
	 * @see removeNotification
	 * @type {AudioNotification?}
	 */
	#notifications;

	/**
	 * The last notification entry that was scheduled.
	 * @type {AudioNotification?}
	 */
	#currentNotification;

	/**
	 * The audio buffer used for scheduling notification events.
	 * @type {AudioBuffer}
	 */
	#currentNotificationBuffer;

	/**
	 * The source node used by the last registered notification for triggering an event when that
	 * point in time is reached.
	 * @type {AudioBufferSourceNode|undefined}
	 */
	#currentNotificationNode;

	/**
	 * The current event callback function for the last registered notification.
	 * Used for removing the event listener if the notification event is cancelled.
	 * @type {(() => void)|undefined}
	 */
	#currentNotificationCallback;

	/**
	 * Constructs a new AudioManager instance.
	 */
	constructor() {
		super();

		this.#clips = new Map();
		this.#loading = new Map();
		this.#context = new AudioContext();

		this.#currentNotificationBuffer = this.#context.createBuffer(1, 1, this.#context.sampleRate);
	} // constructor

	/**
	 * The audio context for this AudioManager.
	 */
	get context() {
		return this.#context;
	} // context

	/**
	 * Suspends the progression of time for the associated audio context.
	 * @return {PromiseLike<void>} A Promise that resolves with void. The promise is rejected if the context
	 *         has already been closed.
	 */
	suspend() {
		console.log('suspending context', this.#context, 'state='+ this.#context.state);
		return this.#context.suspend().then((val) => { console.log('suspend OK', val); }, (err) => { console.log('suspend FAILED', err); });
	} // suspend

	/**
	 * Resumes the progression of time for the associated audio context.
	 * @return {PromiseLike<void>} A Promise that resolves with void. The promise is rejected if the context
	 *         has already been closed.
	 */
	resume() {
		console.log('resuming context', this.#context, 'state='+ this.#context.state);
		return this.#context.resume().then((val) => { console.log('resume OK', val); }, (err) => { console.log('resume FAILED', err); });
	} // resume

	/**
	 * The current audio clock timestamp.
	 */
	get currentTime() {
		return this.#context.currentTime;
	} // currentTime

	/**
	 * The destination node for this AudioManager.
	 */
	get destination() {
		return this.#context.destination;
	} // destination


	/**
	 * Registeres an audio clip with the context for retrieval later.
	 * @param {AudioClip} clip
	 */
	registerClip(clip) {
		if (clip.manager !== this) {
			throw new Error("Only clips created under this AudioManager can be registered");
		}

		const name = String(clip.name);
		if (this.#clips.has(name)) {
			throw new Error("A clip named '"+ name +"' has already been defined");
		}

		this.#clips.set(name, clip);
	} // registerClip

	/**
	 * Returns a Promise which resolves to a new AudioClip with the specified name
	 * and audio data.
	 *
	 * On fulfilment, the new AudioClip is registered with the AudioManager under the specified name.
	 *
	 * @param {string} name The name to register the new clip under.
	 * @param {ArrayBuffer} audioData The audio data to use for the clip.  Must be in a supported
	 *        audio format.
	 *
	 * @return {PromiseLike<AudioClip>} a Promise which resolves to a new AudioClip with the specified name
	 *         and audio data.
	 */
	clipFromArrayBuffer(name, audioData) {
console.log("clipFromArrayBuffer: ", name, audioData);
		let entry = this.#loading.get(name);
		if (entry) {
			if (entry[0] !== audioData) {
				throw new Error("A clip named '"+ name +"' has already been defined");
			}

			return entry[1]; /* Promise<AudioClip> */
		}

		const promise = new Promise((accept, reject) => {
			this.#context.decodeAudioData(audioData).then(
				(buffer) => {
					this.#loading.delete(name);
					accept(new AudioClip(this, name, buffer));
				},
				(error) => {
					this.#loading.delete(name);
					reject(error);
				}
			)
		});

		this.#loading.set(name, [audioData, promise]);

		return promise;
	} // clipFromArrayBuffer

	/**
	 * Retrieves the audio clip registered with the provided name.
	 * @param {string} name The name the desired audio clip was registered under.
	 * @return {AudioClip?} The audio clip registered with the provided name or undefined
	 *         if no clip exists with the given name.
	 */
	getClip(name) {
		return this.#clips.get(String(name));
	} // getClip

	/**
	 * Prepares an AudioClip for playback.
	 *
	 * @param {AudioClip|string} clipOrName the clip to prepare for playback. May be an
	 *        AudioClip instance or the name of a previously registered clip.
	 *
	 * @returns {ActiveAudio} An ActiveAudio instance which can be used to control playback,
	 *          schedule notifications, or listen for events.
	 */
	prepare(clip) {
		if (!(clip instanceof AudioClip)) {
			clip = this.getClip(clip);
			if (clip == null) {
				throw new Error("There is no clip named '" + clip + "' registered with this manager");
			}
		}
		return ActiveAudio(this, clip);
	}

	/**
	 * Invokes the current notification when it's time has come.
	 */
	#invokeCurrentNotification() {
		if (this.#currentNotification) {
			const entry = this.#currentNotification;
			if (this.#notifications) {
				this.#notifications = this.#notifications.remove(this.#currentNotification.id);
			}
			this.#currentNotification = this.#currentNotificationNode = undefined;

			entry.invoke();

			this.#scheduleNextNotificationIfNeeded();
		} else
			console.warn("invokeCurrentNotification: no notifications to process at "+ this.#context.currentTime);
	} // invokeCurrentNotification

	/**
	 * Stops/unschedules the current notification if one is scheduled.
	 */
	unscheduleCurrentNotification() {
		if (this.#currentNotification) {
			if (this.#currentNotificationNode) {
				this.#currentNotificationNode.stop();
				if (this.#currentNotificationCallback) {
					this.#currentNotificationNode.removeEventListener('ended', this.#currentNotificationCallback);
				}
			}
			this.#currentNotification = undefined;
			this.#currentNotificationCallback = undefined;
			this.#currentNotificationNode = undefined;
		}
	} // unscheduleCurrentNotification

	/**
	 * Schedules the next notification node to fire an event at it's specified time, if an earlier
	 * event isn't already scheduled.
	 */
	#scheduleNextNotificationIfNeeded() {
		if (!this.#notifications || this.#currentNotification === this.#notifications) {
			return; // Nothing to schedule
		}

		const notification = this.#notifications;

		if (this.#currentNotification) {
			if (this.#currentNotification.when <= notification.when) {
				return; // No need to reschedule
			}

			this.unscheduleCurrentNotification();
		}

		// Start new notification
		this.#currentNotificationNode = this.#context.createBufferSource();
		this.#currentNotificationNode.buffer = this.#currentNotificationBuffer;
		this.#currentNotificationNode.connect(this.#context.destination);

		this.#currentNotification = this.#notifications;

		this.#currentNotificationCallback = () => {
			this.#invokeCurrentNotification();
		};

		this.#currentNotificationNode.addEventListener(
			'ended',
			this.#currentNotificationCallback
		);

		this.#currentNotificationNode.start(
			notification.when <= this.#context.currentTime + 0.002 ? undefined : notification.when
		);
	} // scheduleNextNotificationIfNeeded

	/**
	 * Specifies that a notification event containing the given data be fired at the specified
	 * time relative to the audio context's clock
	 *
	 * @param {number} when The time relative to the audio context's clock when the event should be
	 *        fired.  If this time is in the past, no action is taken.
	 * @param {((notification: AudioNotification) => void)?} callback The callback to invoke when the
	 *        notification time is reached.  If no callback is specified, will trigger a "notification"
	 *        event instead.
	 *
	 * @return {number} A value that can be used to unregister the notification at a later time, or 0 if
	 *         the notification was executed immediately or was specified to execute in the past.
	 */
	scheduleNotification(when, callback) {
		if (!callback) {
			callback = (notification) => {
				this.triggerEvent('notification', notification);
			};
		}

		const notification = new AudioNotification(when, callback);

		const now = this.#context.currentTime;
		if (when < now - 0.005) {
			console.warn("requested time "+ when +" expired (now="+ now +")");
			return 0;
		} else if (when <= now + 0.005) {
			notification.invoke();
			return 0;
		}

		this.#notifications = (
			this.#notifications
				? this.#notifications.insert(notification)
				: notification
		);

		this.#scheduleNextNotificationIfNeeded();

		return notification.id;
	} // addNotification

	/**
	 * Removes the notification with the specified ID from the list of regsitered notifications.
	 *
	 * @param {number} notification The ID of the notification to unregister, as returned by
	 *        {@link addNotification}.
	 */
	removeNotification(notification) {
		if (this.#notifications) {
			let reschedule = false;

			if (this.#currentNotification && (this.#currentNotification.id == notification)) {
				reschedule = true;
				this.unscheduleCurrentNotification();
			}

			this.#notifications = this.#notifications.remove(notification);

			if (reschedule) {
				this.#scheduleNextNotificationIfNeeded();
			}
		}
	} // removeNotification



	// set listener orientation (angle)
	// set listener position (x, y, h)



} // AudioManager
