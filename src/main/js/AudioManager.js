
import { AudioNotification } from "./AudioNotification.js";
import { AudioClip } from "./AudioClip.js";
import { EventDispatcher } from "./EventDispatcher.js";


/**
 * Represents an audio instance prepared for playback by an AudioManager.
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
	 * @type {number}
	 */
	#playbackRate;

	/**
	 * The playback rate for the underlying audio data.
	 */
	get playbackRate() {
		return this.#playbackRate;
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
	#position = 0;

	/**
	 * The ID of any currently scheduled notification for this audio.
	 * @type {number}
	 */
	#scheduledNotificationId;

	/**
	 * Event handler to add to AudioBufferSourceNodes to handle the 'ended' event
	 * and dispatch a 'stop' event.
	 */
	#endedListener;

	/**
	 * Event handler to add to AudioBufferSourceNodes to handle the 'ended' event
	 * without dispatching a 'stop' event.
	 */
	#endedListenerNoEvent;

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
		} else if (when > this.length) {
			when = this.length;
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
	 * Constructs a new instance.
	 * @param {AudioManager} manager the AudioManager through which the playback will be performed.
	 * @param {AudioClip} clip the AudioClip describing the audio and playback parameters.
	 */
	constructor(manager, clip) {
		super();

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
		this.#endedListenerNoEvent = () => { this.#handleStop(true); };

		if (clip.gain != 1) {
			this.#destination = new GainNode(this.#manager.context, {
				"gain": clip.gain
			});

			this.#destination.connect(this.#manager.destination);
		} else {
			this.#destination = this.#manager.destination;
		}

		this.#playbackRate = clip.playbackRate;
		this.#duration = clip.length / clip.buffer.sampleRate;

		this.#notifications = clip.notifications.slice();
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
	 */
	#play(when) {
		if (this.#audioBufferSourceNode != null) {
			throw new Error("#play called when #audioBufferSourceNode is assigned");
		}

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
					() => { this.#handleStart(); }
				);
		} else {
			this.#handleStart();
		}
	}

	/**
	 * Performs necessary actions when a clip starts to play.
	 * This may include sending a 'start' event as well as scheduling the next notification to
	 * fire at the appropriate time.
	 */
	#handleStart() {
		this.#scheduledNotificationId = null;

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
	#scheduleNextNotification(index) {
		const now = this.#contextTimeToClipTime(this.#manager.currentTime, this.#startTime, this.#position);

		let when;
		let callback;

		while (index < this.#notifications.length) {
			const notification = this.#notifications[index];
			index++;

			if (notification.when <= now) {
				// execute the notification immediately
				notification.callback(this);
			} else {
				when = this.#clipTimeToContextTime(notification.when, this.#startTime, this.#position);
				callback = () => { notification.callback(this); this.#scheduleNextNotification(index); }
				break;
			}
		}

		if (callback == null) {
			when = this.#clipTimeToContextTime(this.duration, this.#startTime, this.#position);
			callback = () => { this.#handleStop(); };
		}

		if (when <= now) {
			this.#handleStop();
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
	 */
	#stop(when) {
		if (this.#audioBufferSourceNode == null) {
			throw new Error("#stop called when #audioBufferSourceNode is unassigned");
		}

		const stopNow = when <= this.#manager.currentTime;
		if (stopNow) {
			this.#audioBufferSourceNode.removeEventListener('ended', this.#endedListener);
			this.#audioBufferSourceNode.removeEventListener('ended', this.#endedListenerNoEvent);
		}

		this.#audioBufferSourceNode.stop(when);

		if (stopNow) {
			// handle stop actions immediately
			this.#handleStop();
		}
	}

	#handleStop() {
		// Record the current position for potential restart
		this.#position = this.position;

		// Remove any pending notification
		if (this.#scheduledNotificationId) {
			this.#manager.cancelNotification(this.#scheduledNotificationId);
			this.#scheduledNotificationId = null;
		}

		this.#audioBufferSourceNode = null;
	}

}


export class ScheduledAudioNotification extends AudioNotification {
	/**
	 * @type {ScheduledAudioNotification?}
	 */
	#next;

	/**
	 * The next ScheduledAudioNotificationEntry scheduled to execute after this one.
	 */
	get next() {
		return this.#next;
	}

	/**
	 * @type {AudioManager}
	 */
	#manager;

	/**
	 * The AudioManager this notification was scheduled under.
	 */
	get manager() {
		return this.#manager;
	}

	constructor(manager, when, callback) {
		super(when, callback);
		this.#manager = manager;
	}

	/**
	 * Inserts a new entry into the list in chronological order.
	 *
	 * @param {ScheduledAudioNotification} notification the notification entry to
	 *        insert.
	 *
	 * @returns {ScheduledAudioNotification} the start of the list. This value may be
	 *          either the notification this method was called on or the new notification
	 *          if it was inserted at the front of the list.
	 */
	insert(notification) {
		if (notification.when < this.when) {
			// Insert at the start of the list
			notification.#next = this;
			return notification;
		}

		let entry = this;
		while (true) {
			if (entry.#next == null) {
				// Add at the end of the list
				entry.#next = notification;
				break;
			}

			if (notification.when < entry.#next.when) {
				// Insert into the middle of the list
				notification.#next = entry.#next;
				entry.#next = notification;
				break;
			}

			entry = entry.#next;
		}

		return this;
	}

	/**
	 * Removes a notification from the linked list rooted at this entry.
	 *
	 * @param {ScheduledAudioNotification} notification the notification to remove from the
	 *        list.
	 *
	 * @returns {ScheduledAudioNotification} the start of the list. This value may be
	 *          either the notification this method was called on or the next notification
	 *          in the list if this node was the node to remove.
	 */
	remove(notification) {
		if (this == notification) {
			const root = this.#next;
			this.#next = null;
			return root;
		}

		let entry = this;
		while (entry != null) {
			if (notification == entry.#next) {
				// Found a match, remove from the list
				entry.#next = notification.#next;
				notification.#next = null;
				break;
			}

			entry = entry.#next;
		}

		return this;
	}

	cancel() {
		this.#manager.cancelNotification(this.id);
	}

}



export class AudioManager {

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
	 * Linked list of scheduled notifications.
	 * @see scheduleNotification
	 * @see cancelNotification
	 * @type {ScheduledAudioNotification?}
	 */
	#pendingNotifications;

	/**
	 * The last notification entry that was scheduled.
	 * @type {ScheduledAudioNotification?}
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
		this.#clips = new Map();
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
	 * Registers an audio clip with the context for retrieval later.
	 *
	 * @param {string} name the name to register the clip under.
	 * @param {AudioClip} clip the clip to register.
	 */
	registerClip(name, clip) {
		name = String(name);
		if (this.#clips.has(name)) {
			throw new Error("A clip named '"+ name +"' has already been defined");
		}

		this.#clips.set(name, clip);
	} // registerClip

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
	prepare(clipOrName) {
		let clip;
		if (clipOrName instanceof AudioClip) {
			clip = clipOrName;
		} else {
			clip = this.getClip(clipOrName);
			if (clip == null) {
				throw new Error("There is no clip named '" + clipOrName + "' registered with this manager");
			}
		}
		return new ActiveAudio(this, clip);
	}

	/**
	 * Invokes the current notification when it's time has come.
	 */
	#invokeCurrentNotification() {
		if (this.#currentNotification) {
			const entry = this.#currentNotification;
			if (this.#pendingNotifications) {
				this.#pendingNotifications = this.#pendingNotifications.remove(this.#currentNotification);
			}
			this.#currentNotification = this.#currentNotificationNode = undefined;

			entry.callback();

			this.#scheduleNextNotificationIfNeeded();
		} else
			console.warn("invokeCurrentNotification: no notifications to process at "+ this.#context.currentTime);
	} // invokeCurrentNotification

	/**
	 * Stops/unschedules the current notification if one is scheduled.
	 */
	#unscheduleCurrentNotification() {
		if (this.#currentNotification) {
			if (this.#currentNotificationNode) {
				if (this.#currentNotificationCallback) {
					this.#currentNotificationNode.removeEventListener('ended', this.#currentNotificationCallback);
				}
				this.#currentNotificationNode.stop();
			}
			this.#currentNotification = undefined;
			this.#currentNotificationCallback = undefined;
			this.#currentNotificationNode = undefined;
		}
	}

	/**
	 * Schedules the next notification node to fire an event at it's specified time, if an earlier
	 * event isn't already scheduled.
	 */
	#scheduleNextNotificationIfNeeded() {
		if (!this.#pendingNotifications || this.#currentNotification === this.#pendingNotifications) {
			return; // Nothing to schedule
		}

		const notification = this.#pendingNotifications;

		if (this.#currentNotification) {
			if (this.#currentNotification.when <= notification.when) {
				return; // No need to reschedule
			}

			this.#unscheduleCurrentNotification();
		}

		// Start new notification
		this.#currentNotificationNode = this.#context.createBufferSource();
		this.#currentNotificationNode.buffer = this.#currentNotificationBuffer;
		this.#currentNotificationNode.connect(this.#context.destination);

		this.#currentNotification = this.#pendingNotifications;

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
	}

	/**
	 * Specifies that a notification event containing the given data be fired at the specified
	 * time relative to the audio context's clock
	 *
	 * @param {number} when The time relative to the audio context's clock when the event should be
	 *        fired.  If this time is in the past, no action is taken.
	 * @param {() => void} callback The callback to invoke when the notification time is reached.
	 *        If no callback is specified, will trigger a "notification" event instead.
	 *
	 * @return {number} A value that can be used to unregister the notification at a later time, or 0 if
	 *         the notification was executed immediately or was specified to execute in the past.
	 */
	scheduleNotification(when, callback) {
		const notification = new ScheduledAudioNotification(this, when, callback);

		const now = this.#context.currentTime;
		if (when < now - 0.005) {
			console.warn("requested time " + when + " expired (now=" + now + ")");
			return 0;
		} else if (when <= now + 0.005) {
			notification.callback();
			return 0;
		}

		// Add the notification to the list of pending notifications
		this.#pendingNotifications = (
			this.#pendingNotifications
				? this.#pendingNotifications.insert(notification)
				: notification
		);

		this.#scheduleNextNotificationIfNeeded();

		return notification.id;
	}

	/**
	 * Removes the notification with the specified ID from the list of regsitered notifications.
	 *
	 * @param {number} notification The ID of the notification to unregister, as returned by
	 *        {@link addNotification}.
	 */
	cancelNotification(notification) {
		if (this.#pendingNotifications) {
			let reschedule = false;

			if (this.#currentNotification && (this.#currentNotification.id == notification)) {
				reschedule = true;
				this.#unscheduleCurrentNotification();
			}

			this.#pendingNotifications = this.#pendingNotifications.remove(notification);

			if (reschedule) {
				this.#scheduleNextNotificationIfNeeded();
			}
		}
	}


	// set listener orientation (angle)
	// set listener position (x, y, h)



} // AudioManager
