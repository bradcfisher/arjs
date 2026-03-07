import { AudioManager } from "./AudioManager.js";
import { AudioNotificationEntry, AudioNotification } from "./AudioNotificationEntry.js";
import { EventDispatcher } from "./EventDispatcher.js";


/**
 * Represents an audio clip.
 *
 * Events:
 *  - start			Sent when a clip begins playing
 *  - stop			Sent when a clip stops playing
 *  - pause			Sent when a clip is paused
 *  - repeat		Sent when a clip repeats
 *  - notification	Sent when a notification time is reached
 *
 * Event data:
 * ```typescript
 * {
 *   data: <Data provided when the notification was defined>
 * }
 * ```
 */
export class AudioClip
	extends EventDispatcher
{

	/**
	 * @type {string}
	 */
	#name;

	/**
	 * @type {AudioBuffer}
	 */
	#baseBuffer;

	/**
	 * The current view of the audio buffer, based on previous start/stop/pause/seek operations.
	 * @type {AudioBuffer}
	 */
	#currentBuffer;

	/**
	 * @type {AudioManager}
	 */
	#manager;

	/**
	 * The last position set.
	 * @type {number}
	 */
	#position = 0;

	/**
	 * @type {boolean}
	 */
	#paused = false;

	/**
	 * The time, relative to the audio context's clock when playing began.
	 * This value is used for determining the current position as well as whether the clip is
	 * currently playing or not.
	 * @see playing
	 * @see position
	 * @type {number}
	 */
	#startTime = Number.NaN;

	/**
	 * Linked list of registered notifications.
	 * @type {AudioNotificationEntry|undefined}
	 */
	#notifications;

	/**
	 * The notification that is currently scheduled to fire next.
	 * @type {AudioNotificationEntry|undefined}
	 */
	#currentNotification;

	/**
	 * The ID of the current notification.
	 * @type {number}
	 */
	#currentNotificationId = 0;

	/**
	 * The ID of the registered stop event notification, if a stop is scheduled.
	 * @see stop
	 * @see pause
	 * @type {number}
	 */
	#stoppingNotificationId = 0;

	/**
	 * The WebAudio GainNode used to control the gain for this audio clip.
	 * @see gain
	 * @see gainParam
	 * @type {GainNode}
	 */
	#gainNode;

	/**
	 * The WebAudio node for this audio clip.
	 * @type {AudioBufferSourceNode|undefined}
	 */
	#node;

	/**
	 * Constructs a new AudioClip instance.
	 *
	 * @param {AudioManager|AudioClip} context The audio context to create the clip under.
	 * @param {string} name A name to associate with the audio clip instance.  This name is
	 *        used to identify the clip in the containing {@link AudioManager}.
	 * @param {AudioClip|AudioBuffer} source The source AudioClip or AudioBuffer to retrieve the audio
	 *        data from.
	 */
	constructor(context, name, source) {
		super();

		if (context instanceof AudioClip) {
			source = context;
			this.#manager = source.#manager;
		} else
			this.#manager = context;

		this.#name = name;
		this.#manager.registerClip(this);

		this.#gainNode = this.context.createGain();

		if (source instanceof AudioClip) {
			this.#baseBuffer = source.#baseBuffer;
		} else {
			this.#baseBuffer = source;
		}

		this.#currentBuffer = this.#baseBuffer;

		// Initialize the AudioBufferSourceNode for triggering start events for this clip
		this.addNotification(0, undefined, () => { this.trigger('start'); });
	} // constructor

	/**
	 * Creates a copy of an AudioBuffer containing only the specified range of the audio data.
	 *
	 * @param {AudioBuffer} buffer The AudioBuffer to clone.
	 * @param {number} startTime The starting timestamp, in seconds, within the buffer to use for the
	 *        starting position of the new clone.  May be negative, in which case
	 *        an appropriate amount of silence will be inserted into the beginning
	 *        of the new buffer.
	 * @param {number?} duration The duration to copy from the original buffer into the new clone, in
	 *        seconds.  If not specified, the remainder of the buffer starting at
	 *        `startTime` will be copied.  If the specified duration would exceed the
	 *        duration of the source buffer, silence will be appended to the end of
	 *        the new buffer to pad the clip to the specified duration.  Must be a
	 *        positive value.
	 *
	 * @return {AudioBuffer} a new AudioBuffer containing the specified range of the audio data.
	 */
	#cloneBuffer(buffer, startTime, duration) {
		const startSample = Math.trunc(startTime * buffer.sampleRate);

		let numSamples =
			(duration == null
				? buffer.length - startSample
				: Math.ceil(duration * buffer.sampleRate)
			);

		if (numSamples < 1) {
			numSamples = 1;
		}

		let endSample = startSample + numSamples;

		if (endSample >= buffer.length) {
			endSample = buffer.length - 1;
		}

		let channelSampleOffset = 0;

		if (startSample < 0) {
			channelSampleOffset = -startSample;
			startSample = 0;
		}

console.log("clone buffer: startSample=", startSample, ", numSamples=", numSamples, ", endSample=", endSample, ", channelSampleOffset=", channelSampleOffset);

		const clonedBuffer = this.context.createBuffer(
			buffer.numberOfChannels,
			numSamples,
			buffer.sampleRate
		);

		if (endSample >= 0) {
			// Copy audio data within the specified range for each channel
			for (let channel = buffer.numberOfChannels - 1; channel >= 0; --channel) {
				clonedBuffer.copyToChannel(
					buffer.getChannelData(channel).subarray(startSample, endSample),
					channel,
					channelSampleOffset
				);
			}
		}

		return clonedBuffer;
	} // cloneBuffer

	/**
	 * Creates a new AudioClip "sprite" based on this clip.
	 *
	 * @param {string} name The name for the new sprite.
	 * @param {number} startTime The position within this clip to use as the start of the sprite, in
	 *        seconds relative to the start of this clip.  Must be in
	 *        [0, this clip's duration).
	 * @param {number} duration The duration, in seconds, to use for the sprite.  The startTime +
	 *        duration cannot exceed the duration of the original clip.
	 *
	 * @return {AudioClip} A new AudioClip instance containing the specified portion of this audio clip.
	 *         Notifications are not cloned into the new sprite.
	 */
	createSprite(name, startTime, duration) {
		return new AudioClip(
			this.#manager,
			name,
			this.#cloneBuffer(this.#baseBuffer, startTime, duration)
		);
	} // createSprite

	/**
	 * The name of this AudioClip, as registered with the associated {@link AudioManager}.
	 */
	get name() {
		return this.#name;
	} // name

	/**
	 * The context this clip was created under.
	 */
	get context() {
		return this.#manager.context;
	} // context

	/**
	 * The manager this clip was created under.
	 */
	get manager() {
		return this.#manager;
	} // manager

	/**
	 * Whether the clip is currently playing or not.
	 */
	get playing() {
		return !Number.isNaN(this.#startTime) && (this.#manager.currentTime >= this.#startTime);
	} // playing

	/**
	 * Whether the clip is current paused or not.
	 */
	get paused() {
		return this.#paused;
	} // paused

	/**
	 * The number of audio channels for this clip.
	 */
	get numberOfChannels() {
		return this.#baseBuffer.numberOfChannels;
	} // numberOfChannels

	/**
	 * The sample rate of the underlying audio buffer, in Hz.
	 */
	get sampleRate() {
		return this.#baseBuffer.sampleRate;
	} // sampleRate

	/**
	 * The length of the clip, in samples.
	 */
	get length() {
		return this.#baseBuffer.length;
	} // length

	/**
	 * The duration of the clip, in seconds.
	 */
	get duration() {
		return this.#baseBuffer.duration;
	} // duration

	/**
	 * The current position of the clip, in seconds relative to the start of the clip.
	 */
	get position() {
		return (
			Math.min(
				(Number.isNaN(this.#startTime)
					? this.#position	// not playing
					: (this.#baseBuffer.duration - this.#currentBuffer.duration) +	// Offset of last start pos
						(this.#manager.currentTime - this.#startTime)				// Current play duration
				),
				this.duration
			)
		);
	} // position

	/**
	 * Sets the current position of the clip, in seconds relative to the start of the clip.
	 *
	 * @param {number} position The new position, in seconds relative to the start of the clip.
	 *        Values less than 0 or past the end of the clip will be clamped.
	 */
	set position(position) {
		const playing = this.playing;
		if (playing) {
			this._stop();
			this.#startTime = Number.NaN;
		}
		this.#position = Math.max(position, 0);
		if (playing) this.start();
	} // position

	/**
	 * The current position of the clip, in samples relative to the start of the clip.
	 */
	get samplePosition() {
		return Math.trunc(this.position * this.sampleRate);
	} // samplePosition

	/**
	 * Sets the current position of the clip, in samples relative to the start of the clip.
	 *
	 * @param {number} samplePosition The new position, in samples relative to the start of the clip.
	 *        Values less than 0 or greater than the number of samples in the the
	 *        clip will be clamped.
	 */
	set samplePosition(samplePosition) {
		this.position = samplePosition / this.sampleRate;
	} // samplePosition

	/**
	 * The AudioParam for this clip's GainNode.
	 */
	get gainParam() {
		return this.#gainNode.gain;
	} // gainParam

	/**
	 * The current gain value for this clip.
	 */
	get gain() {
		return this.#gainNode.gain.value;
	} // gain

	/**
	 * Sets the current gain value for this clip.
	 * @param {number} value The new gain value to assign to the clip.
	 */
	set gain(value) {
		this.#gainNode.gain.value = value;
	} // gain

	/**
	 * Queues this AudioClip to begin playing at it's current position at the specified time
	 * relative to the associated context's clock.
	 *
	 * @param {number?} when The timestamp when this clip should begin playing, relative to the
	 *        associated context's clock.  If not specified, or in the past, then playback
	 *        will begin immediately.
	 */
	start(when) {
		if (this.playing) {
			throw new Error("Clip already playing");
		}

		this.#paused = false;

		const pos = this.position;
		if (pos == 0) {
			this.#currentBuffer = this.#baseBuffer;
		} else {
			this.#currentBuffer = this.#cloneBuffer(this.#baseBuffer, pos);
		}

		// Enable the gain node
		this.#gainNode.connect(this.context.destination);

		// Initialize the AudioBufferSourceNode for the clip
		this.#node = this.context.createBufferSource();
		this.#node.buffer = this.#currentBuffer;
		this.#node.connect(this.#gainNode);
		this.#node.addEventListener('ended', () => {
			if (this.position >= this.duration)
				this.#stop();
				// TODO: What about looping?
		});

		this.#startTime = (when && when >= this.#manager.currentTime ? when : this.#manager.currentTime);

		if (this.#notifications)
			this.#scheduleNextNotificationIfNeeded(this.#notifications.nextOccurring(this.position));

		this.#node.start(when);
	} // start

	/**
	 * Pauses the clip at its current position at the specified time.
	 * Calling this method has no effect if the clip hasn't been started.
	 * @param {number?} when The timestamp when this clip should stop playing, relative to the
	 *        associated context's clock.  If not specified, or in the past, then playback
	 *        will stop immediately.
	 */
	pause(when) {
		this._stop(when, () => {
			this.#paused = true;
			this.trigger('pause');
		});
	} // pause

	/**
	 * Stops playing the current clip at the specified time, and resets the position to 0.
	 * Calling this method has no effect if the clip hasn't been started.
	 * @param {number?} when The timestamp when this clip should stop playing, relative to the
	 *        associated context's clock.  If not specified, or in the past, then playback
	 *        will stop immediately.
	 */
	#stop(when) {
		const commonStopActions = (additionalActions) => {
			this.#paused = false;
			this.#position = 0;
			if (additionalActions)
				additionalActions();
			this.trigger('stop');
		};

		if (this.paused) {
			commonStopActions();
		} else {
			this._stop(when, () => {
				commonStopActions(() => {
					if (this.#node) {
						this.#node.disconnect();
						this.#node = undefined;

						// Disable the gain node
						this.#gainNode.disconnect();
					}
				});
			});
		}
	} // stop

	/**
	 * Performs a scheduled stop, calling a custom callback when the audio stops.
	 * @param {number?} when The timestamp when this clip should stop playing, relative to the
	 *        associated context's clock.  If not specified, or in the past, then
	 *        playback will stop immediately.
	 * @param {(() => void)?} callback The callback to invoke when the playback stops.
	 */
	#stop(when, callback) {
		if (Number.isNaN(this.#startTime)) {
			return;
		}

		if (this.#stoppingNotificationId) {
			this.manager.removeNotification(this.#stoppingNotificationId);
			this.#stoppingNotificationId = 0;
		}

		let wrappedCallback;
		if (callback) {
			wrappedCallback = () => {
				this.#unscheduleCurrentNotification();
				this.#position = this.position;
				this.#startTime = Number.NaN;
				this.#stoppingNotificationId = 0;
				callback();
			};
		}

		when = (!when || when <= this.context.currentTime ? undefined : when);
		if (this.#node) {
			this.#node.stop(when);
		}

		if (wrappedCallback) {
			if (when) {
				this.#stoppingNotificationId = this.manager.addNotification(when, undefined, wrappedCallback);
			} else {
				wrappedCallback();
			}
		}
	} // _stop

	/**
	 * Invokes the current notification when it's time has come.
	 */
	#invokeCurrentNotification() {
		if (this.#currentNotification) {
			this.#currentNotification.invoke();

			const next = this.#currentNotification.next;
			this.#unscheduleCurrentNotification();
			this.#scheduleNextNotificationIfNeeded(next, true);
		}
	} // invokeCurrentNotification

	/**
	 * Stops/unschedules current notification if one is scheduled.
	 */
	#unscheduleCurrentNotification() {
		if (this.#currentNotification) {
			this.manager.removeNotification(this.#currentNotificationId);
			this.#currentNotification = undefined;
			this.#currentNotificationId = 0;
		}
	} // unscheduleCurrentNotification

	/**
	 * Registers a notification node to fire an event at it's specified time.
	 * No change is made unless:
	 * - There is no currently registered notification.
	 * - The currently registered notification should fire after the new notification.
	 * @param {AudioNotificationEntry=} notification The notification entry to register.
	 * @param {boolean} force If true, the notification will be invoked, even if its time has
	 *        passed.  Should only be true when called from
	 *        {@link #invokeCurrentNotification}.
	 */
	#scheduleNextNotificationIfNeeded(notification, force = false) {
		if (!this.playing || !notification || !this.#baseBuffer) {
			return;
		}

		const now = this.position;
		if (notification.when < now) {
			if (force) {
				notification.invoke();
				this.#scheduleNextNotificationIfNeeded(notification.next, true);
			}
			return;
		}

		if (this.#currentNotification) {
			if (this.#currentNotification.when <= notification.when) {
				return;
			}

			this.manager.removeNotification(this.#currentNotificationId);
		}

		// Start new notification
		this.#currentNotification = notification;

		const when = (this.#startTime - (this.#baseBuffer.duration - this.#currentBuffer.duration)) + notification.when;
		this.#currentNotificationId = this.manager.addNotification(when, undefined, () => { this.#invokeCurrentNotification(); });
	} // scheduleNextNotificationIfNeeded

	/**
	 * Specifies that a notification callback should be triggered at the specified time (relative
	 * to the start of the clip) each time the clip is played or repeats.
	 *
	 * @param {number} when The time relative to the start of the clip when the callback should be
	 *        invoked. Times less than 0 and times greater than the length of the clip
	 *        will be clamped.
	 * @param {any} data Additional data to associate with the triggered notification.
	 * @param {((notification: AudioNotification) => void)?} callback The callback to invoke when the
	 *        notification time is reached.  If no callback is specified, will trigger a "notification"
	 *        event instead.
	 *
	 * @return {number} A value that can be used to unregister the notification at a later time.
	 */
	addNotification(when, data, callback) {
		if (callback == null) {
			callback = (notification) => {
				this.trigger('notification', notification);
			};
		}

		const notification = new AudioNotificationEntry(when, callback, data);

		this.#notifications = (
			this.#notifications
				? this.#notifications.insert(notification)
				: notification
		);

		this.#scheduleNextNotificationIfNeeded(notification);

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
			/** @type AudioNotificationEntry|undefined */
			let next;

			if (this.#currentNotification && (this.#currentNotification.id == notification)) {
				next = this.#currentNotification.next;
				this.#unscheduleCurrentNotification();
			}

			this.#notifications = this.#notifications.remove(notification);

			if (next)
				this.#scheduleNextNotificationIfNeeded(next);
		}
	} // removeNotification

	/**
	 * The currently defined notifications for this clip.  Modifications of
	 * the returned array will not affect the clip.
	 */
	get notifications() {
		let rv = [];
		let n = this.#notifications;
		while (n) {
			rv.push(n);
			n = n.next;
		}
		return rv;
	} // notifications

/*
	autoplay?
	loop/repeat
*/

} // AudioClip