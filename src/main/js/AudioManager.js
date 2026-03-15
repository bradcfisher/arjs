
import { EventDispatcher } from "./EventDispatcher.js";
import { AudioNotificationEntry, AudioNotification } from "./AudioNotificationEntry.js";
import { AudioClip } from "./AudioClip.js";




/**
 * Represents an audio clip.
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
	#bufferStartTime;

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
			if (this.#manager.context.currentTime < this.#startTime) {
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
		if (this.#startTime == null || this.#manager.context.currentTime < this.#startTime) {
			return this.#position;
		}
		return (this.#manager.context.currentTime - this.#startTime) * this.playbackRate + this.#position;
	}

	set position(when) {
		if (when < 0) {
			when = 0;
		} else if (when >= this.length) {
			when = this.length - 1;
		}

		this.#position = when;

		if (this.#startTime != null) {
			// Remove any pending notification
			this.#manager.removeNotification(this.#scheduledNotificationId);
			this.#scheduledNotificationId = null;

			// Stop the audio
			this.#audioBufferSourceNode.removeEventListener('ended', this.#endedListener);
			this.#audioBufferSourceNode.stop();

			// Create a new source node starting at the new position

			// TODO: if playing, reset playback to the specified position
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

		this.#bufferStartTime = clip.start / clip.buffer.sampleRate;
		this.#duration = clip.length / clip.buffer.sampleRate;

		for (let notification of clip.notifications) {
			this.addNotification(notification);
		}
	}

	/**
	 *
	 * @param {number?} when The time, in seconds to wait before the sound should begin to play.
	 *        The default value is 0.
	 */
	play(when) {
		if (when == null || when < 0) {
			when = 0;
		}

// TODO: Take into account the #position

		this.#startTime = this.#manager.context.currentTime + when;

		this.#audioBufferSourceNode = new AudioBufferSourceNode(this.#manager.context, this.#config);
		this.#audioBufferSourceNode.connect(this.#destination);
		this.#audioBufferSourceNode.addEventListener('ended', this.#endedListener);
		this.#audioBufferSourceNode.start(this.#manager.context.currentTime + when, this.#startTime, this.#duration);

		if (when > 0) {
			// Start scheduled for the future, schedule the start event notification
			this.#scheduledNotificationId =
			    this.#manager.scheduleNotification(
					this.#manager.context.currentTime + when,
					() => { this.#handleStart(); }
				);
		} else {
			this.#handleStart();
		}
	}

	#handleStart() {
		this.#scheduledNotificationId = null;

		this.triggerEvent('start', {
			target: this
		});

		let index = 0;
		if (this.#position > 0) {
			// Find the first notification on or after the position
			for (let notification of this.#notifications) {
				if (this.#position <= notification.when) {
					break;
				}
			}
		}
		this.#scheduleNextNotification(index);
	}


// TODO: when: relative to NOW, using absolute position in context time, using position within the clip.

	stop(when) {
		// Record the current position for potential restart
		this.#position = this.position;

		this.#audioBufferSourceNode.stop(this.#manager.context.currentTime + when);
		if (stopNow) {
			this.#handleStop();
		}
	}

	#handleStop() {
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
	 * @type {AudioNotificationEntry?}
	 */
	#notifications;

	/**
	 * The last notification entry that was scheduled.
	 * @type {AudioNotificationEntry?}
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

		const notification = new AudioNotificationEntry(when, callback, data);

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
