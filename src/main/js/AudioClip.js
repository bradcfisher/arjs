import { AudioNotification, AudioNotification } from "./AudioNotificationEntry.js";
import { Parse } from "./Parse.js";


/**
 * Parses an audio sample position/duration value, returning the number of samples it represents
 * within an audio stream with the specified sample rate.
 *
 * @param {{number|string)?} position the value to parse.
 * @param {{number|string}?} defaultPosition the default value to use if the `position` is
 *        null. If this value is also null, the method will throw an error.
 * @param {number} sampleRate the number of samples per second for the audio.
 *
 * @returns {number} the parsed sample position.
 *
 * @throws {Error} if both `position` and `defaultPosition` are null.
 */
function parseSample(position, defaultPosition, sampleRate) {
	if (position == null) {
		if (defaultPosition == null) {
			throw new Error("Audio sample number or value in seconds required");
		}
		position = defaultPosition;
	}

	if (isNaN(position)) {
		position = Parse.duration(position, defaultPosition, "s") * sampleRate;
	}

	// Absolute sample position
	return Math.trunc(position);
}


export class AudioClipOptions {

	/**
	 * Gain amount to apply to the clip.
	 * @type {number}
	 * @readonly
	 */
	gain;

	/**
	 * Pitch adjustment to apply to the clip.
	 *
	 * For example, values of +100 and -100 detune the source up or down by one
	 * semitone, while +1200 and -1200 detune it up or down by one octave.
	 *
	 * @type {number}
	 * @readonly
	 */
	detune;

	/**
	 * Playback rate adjustment to apply to the clip.
	 *
	 * A value of 1.0 indicates it should play at the same speed as its sampling rate,
	 * values less than 1.0 cause the sound to play more slowly, while values greater
	 * than 1.0 result in audio playing faster than normal.
	 * @type {number}
	 * @readonly
	 */
	playbackRate;

	/**
	 * Whether the clip should loop repeatedly or not.
	 * @type {boolean}
	 * @readonly
	 */
	loop;

	/**
	 * X position of the audio in map space.
	 * @type {number?}
	 * @readonly
	 */
	x;

	/**
	 * Y position of the audio in map space.
	 * @type {number}
	 * @readonly
	 */
	y;

	/**
	 * Height of the audio clip in map space.
	 * @type {number}
	 * @readonly
	 */
	height;

	/**
	 * The sample position within the buffer where playback will begin.
	 * @type {number}
	 * @readonly
	 */
	start;

	/**
	 * The length of playback in samples.
	 * @type {number}
	 * @readonly
	 */
	length;

	/**
	 * Notifications registered for this clip.
	 * @type {AudioNotification[]}
	 * @readonly
	 */
	notifications;

}

/**
 * A reusable AudioClip definition.
 *
 * AudioClips can be provided to an AudioManager for playback or to register them for retrieval
 * and playback at a later time.
 */
export class AudioClip {

	/**
	 * The AudioBuffer containing the audio data for this clip.
	 * @readonly
	 * @type {AudioBuffer}
	 */
	#buffer;

	/**
	 * The AudioBuffer containing the audio data for this clip.
	 */
	get buffer() {
		return this.#buffer;
	}

	/**
	 * @type {number}
	 */
	#gain = 1;

	/**
	 * Gain amount to apply to the clip.
	 */
	get gain() {
		return this.#gain;
	}

	/**
	 * @type {number}
	 */
	#detune = 0;

	/**
	 * Pitch adjustment to apply to the clip.
	 *
	 * For example, values of +100 and -100 detune the source up or down by one
	 * semitone, while +1200 and -1200 detune it up or down by one octave.
	 *
	 * @see {@link AudioBufferSourceNode.detune}
	 */
	get detune() {
		return this.#detune;
	}

	/**
	 * @type {number}
	 */
	#playbackRate = 1;

	/**
	 * Playback rate adjustment to apply to the clip.
	 *
	 * A value of 1.0 indicates it should play at the same speed as its sampling rate,
	 * values less than 1.0 cause the sound to play more slowly, while values greater
	 * than 1.0 result in audio playing faster than normal.
	 *
	 * The default value is 1 (unchanged).
	 *
	 * @see {@link AudioBufferSourceNode.}
	 */
	get playbackRate() {
		return this.#playbackRate;
	}

	/**
	 * @type {boolean}
	 */
	#loop = false;

	/**
	 * Whether the clip should loop repeatedly or not.
	 * The default is `false`.
	 */
	get loop() {
		return this.#loop;
	}

	/**
	 * @type {number?}
	 */
	#x;

	/**
	 * X position of the audio in map space.
	 * @see {setPosition}
	 * @see {clearPosition}
	 */
	get x() {
		return this.#x;
	}

	/**
	 * @type {number?}
	 */
	#y;

	/**
	 * Y position of the audio in map space.
	 * @see {setPosition}
	 * @see {clearPosition}
	 */
	get y() {
		return this.#y;
	}

	/**
	 * @type {number?}
	 */
	#height;

	/**
	 * Height of the audio clip in map space.
	 * @see {setPosition}
	 * @see {clearPosition}
	 */
	get height() {
		return this.#height;
	}

	/**
	 * @type {number}
	 */
	#startSample = 0;

	/**
	 * The sample position within the buffer where playback will begin.
	 */
	get startSample() {
		return this.#startSample;
	}

	/**
	 * @type {number}
	 */
	#endSample;

	get endSample() {
		return this.#endSample;
	}

	/**
	 * The length of playback in samples.
	 */
	get length() {
		return this.#endSample - this.#startSample + 1;
	}

	/**
	 * Notifications registered for this clip.
	 */
	#notifications = [];

	get notifications() {
		return this.#notifications;
	}

	/**
	 * The number of audio channels for this clip.
	 */
	get numberOfChannels() {
		return this.#buffer.numberOfChannels;
	}

	/**
	 * The sample rate of the underlying audio buffer, in Hz.
	 */
	get sampleRate() {
		return this.#buffer.sampleRate;
	}

	/**
	 * The duration of the clip playback, in seconds.
	 * The duration reported is a combination of the duration of the AudioBuffer
	 * and the assigned playback rate.
	 */
	get duration() {
		return this.length / this.sampleRate / this.#playbackRate;
	}

	/**
	 * @type {AudioClipOptions}
	 */
	get config() {
		return {
			start: this.#startSample,
			length: this.length,
			gain: this.#gain,
			detune: this.#detune,
			playbackRate: this.#playbackRate,
			loop: this.#loop,
			x: this.#x,
			y: this.#y,
			height: this.#height,
			notifications: this.#notifications.slice()
		};
	}

	/**
	 * Creates a new AudioClip.
	 * @param {AudioBuffer} buffer the AudioBuffer containing the sprite's audio.
	 * @param {AudioClipOptions} options the options for configuring the AudioClip.
	 */
	constructor(buffer, options) {
		if (!(buffer instanceof AudioBuffer)) {
			throw new Error("An AudioBuffer is required, not " + buffer);
		}

		if (options == null) {
			options = {};
		}

		const length = parseSample(options.length);

		this.#buffer = buffer;
		this.#startSample = parseSample(options.start, 0, buffer.sampleRate);
		this.#endSample = this.#startSample + length;
		this.#detune = Parse.num(options.detune, 0);
		this.#loop = Parse.bool(options.loop, false);
		this.#gain = Parse.num(options.gain, 1);
		this.#playbackRate = Parse.num(options.playbackRate, 1);
		this.#x = (options.x == null ? null : Parse.num(options.x));
		this.#y = (options.y == null ? null : Parse.num(options.y));
		this.#height = Parse.num(options.height, 0);

		if (this.#startSample < 0 || this.#startSample >= buffer.length) {
			throw new Error("Start sample must be between [0, " + buffer.length +
					"): " + this.#startSample);
		}

		if (this.#endSample < this.#startSample || this.#endSample >= buffer.length) {
			throw new Error("Sample length must be between [0, " +
				(buffer.length - this.#startSample) + "): " +
				(this.#endSample - this.#startSample + 1));
		}

		this.#notifications = Parse.array(options.notifications, [], (value) => {
			const whenSample = parseSample(value.when, null, buffer.sampleRate);

			if (whenSample < 0 || whenSample >= length) {
				throw new Error("Notification sample must be between [0, " + length +
					"): " + whenSample);
			}

			return new AudioNotification(whenSample, Parse.action(value.callback));
		});
		this.#notifications.sort((a, b) => (a < b) ? -1 : ((a > b) ? 1 : 0));
	}

}



/*



export class AudioClip
	extends EventDispatcher
{

	/**
	 * @type {string}
	 * /
	#name;

	/**
	 * @type {AudioBuffer}
	 * /
	#baseBuffer;

	/**
	 * The current view of the audio buffer, based on previous start/stop/pause/seek operations.
	 * @type {AudioBuffer}
	 * /
	#currentBuffer;

	/**
	 * @type {AudioManager}
	 * /
	#manager;

	/**
	 * The last position set.
	 * @type {number}
	 * /
	#position = 0;

	/**
	 * @type {boolean}
	 * /
	#paused = false;

	/**
	 * The time, relative to the audio context's clock when playing began.
	 * This value is used for determining the current position as well as whether the clip is
	 * currently playing or not.
	 * @see playing
	 * @see position
	 * @type {number}
	 * /
	#startTime = Number.NaN;

	/**
	 * Linked list of registered notifications.
	 * @type {AudioNotificationEntry|undefined}
	 * /
	#notifications;

	/**
	 * The notification that is scheduled to fire next in the timeline.
	 * @type {AudioNotificationEntry|undefined}
	 * /
	#nextNotification;

	/**
	 * The ID of the next notification.
	 * @type {number}
	 * /
	#nextNotificationId = 0;

	/**
	 * The ID of the registered stop event notification, if a stop is scheduled.
	 * @see stop
	 * @see pause
	 * @type {number}
	 * /
	#stoppingNotificationId = 0;

	/**
	 * The WebAudio GainNode used to control the gain for this audio clip.
	 * @see gain
	 * @see gainParam
	 * @type {GainNode}
	 * /
	#gainNode;

	/**
	 * The WebAudio node for this audio clip.
	 * @type {AudioBufferSourceNode|undefined}
	 * /
	#node;

	/**
	 * Constructs a new AudioClip instance.
	 *
	 * @param {AudioManager|AudioClip} context The audio context to create the clip under.
	 * @param {string} name A name to associate with the audio clip instance.  This name is
	 *        used to identify the clip in the containing {@link AudioManager}.
	 * @param {AudioClip|AudioBuffer} source The source AudioClip or AudioBuffer to retrieve the audio
	 *        data from.
	 * /
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
		this.addNotification(0, undefined, () => { this.triggerEvent('start'); });
	} // constructor

	/**
	 * The name of this AudioClip, as registered with the associated {@link AudioManager}.
	 * /
	get name() {
		return this.#name;
	} // name

	/**
	 * The context this clip was created under.
	 * /
	get context() {
		return this.#manager.context;
	} // context

	/**
	 * The manager this clip was created under.
	 * /
	get manager() {
		return this.#manager;
	} // manager

	/**
	 * Whether the clip is currently playing or not.
	 * /
	get playing() {
		return !Number.isNaN(this.#startTime) && (this.#manager.currentTime >= this.#startTime);
	} // playing

	/**
	 * Whether the clip is current paused or not.
	 * /
	get paused() {
		return this.#paused;
	} // paused

	/**
	 * The number of audio channels for this clip.
	 * /
	get numberOfChannels() {
		return this.#baseBuffer.numberOfChannels;
	} // numberOfChannels

	/**
	 * The sample rate of the underlying audio buffer, in Hz.
	 * /
	get sampleRate() {
		return this.#baseBuffer.sampleRate;
	} // sampleRate

	/**
	 * The length of the clip, in samples.
	 * /
	get length() {
		return this.#baseBuffer.length;
	} // length

	/**
	 * The duration of the clip, in seconds.
	 * /
	get duration() {
		return this.#baseBuffer.duration;
	} // duration

	/**
	 * The current position of the clip, in seconds relative to the start of the clip.
	 *
	 * When updated, values less than 0 or past the end of the clip will be clamped.
	 * /
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

	set position(position) {
		const playing = this.playing;
		if (playing) {
			this.#stop();
			xxx
			this.#startTime = Number.NaN;
		}
		this.#position = Math.max(position, 0);
		if (playing) this.start();
	} // position

	/**
	 * The current position of the clip, in samples relative to the start of the clip.
	 * /
	get samplePosition() {
		return Math.trunc(this.position * this.sampleRate);
	} // samplePosition

	/**
	 * Sets the current position of the clip, in samples relative to the start of the clip.
	 *
	 * @param {number} samplePosition The new position, in samples relative to the start of the clip.
	 *        Values less than 0 or greater than the number of samples in the the
	 *        clip will be clamped.
	 * /
	set samplePosition(samplePosition) {
		this.position = samplePosition / this.sampleRate;
	} // samplePosition

	/**
	 * The AudioParam for this clip's GainNode.
	 * /
	get gainParam() {
		return this.#gainNode.gain;
	} // gainParam

	/**
	 * The current gain value for this clip.
	 * /
	get gain() {
		return this.#gainNode.gain.value;
	} // gain

	/**
	 * Sets the current gain value for this clip.
	 * @param {number} value The new gain value to assign to the clip.
	 * /
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
	 * /
	start(when) {
		if (this.playing) {
			if (when != null) {
				this.position = when - this.#startTime;
			}
			return;
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
			if (this.position >= this.duration) {
				this.#stop();
				// TODO: What about looping?
			}
		});

		this.#startTime = (when && when >= this.#manager.currentTime ? when : this.#manager.currentTime);

		if (this.#notifications) {
			this.#scheduleNextNotificationIfNeeded(this.#notifications.nextOccurring(this.position));
		}

		this.#node.start(when);
	} // start

	/**
	 * Pauses the clip at its current position at the specified time.
	 * Calling this method has no effect if the clip hasn't been started.
	 * @param {number?} when The timestamp when this clip should stop playing, relative to the
	 *        associated context's clock.  If not specified, or in the past, then playback
	 *        will stop immediately.
	 * @fires pause
	 * /
	pause(when) {
		this.#stop(when, () => {
			this.#paused = true;
			this.triggerEvent('pause');
		});
	} // pause

	/**
	 * Stops playing the current clip at the specified time, and resets the position to 0.
	 * Calling this method has no effect if the clip hasn't been started.
	 * @param {number?} when The timestamp when this clip should stop playing, relative to the
	 *        associated context's clock.  If not specified, or in the past, then playback
	 *        will stop immediately.
	 * @fires stop
	 * /
	stop(when) {
		const commonStopActions = (additionalActions) => {
			this.#paused = false;
			this.#position = 0;
			if (additionalActions) {
				additionalActions();
			}
			this.triggerEvent('stop');
		};

		if (this.paused) {
			commonStopActions();
		} else {
			this.#stop(when, () => {
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
	 * /
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
	} // #stop

	/**
	 * Invokes the current notification when its time has come.
	 * /
	#invokeCurrentNotification() {
		if (this.#nextNotification) {
			this.#nextNotification.invoke();

			const next = this.#nextNotification.next;
			this.#unscheduleCurrentNotification();
			this.#scheduleNextNotificationIfNeeded(next, true);
		}
	} // #invokeCurrentNotification

	/**
	 * Stops/unschedules current notification if one is scheduled.
	 *
	 * While this method prevents the current notification from firing, it also does not
	 * schedule the next notification. If you intend to prevent the
	 * /
	#unscheduleCurrentNotification() {
		if (this.#nextNotification) {
			this.manager.removeNotification(this.#nextNotificationId);
			this.#nextNotification = undefined;
			this.#nextNotificationId = 0;
		}
	} // #unscheduleCurrentNotification

	/**
	 * Registers a notification node to fire an event at it's specified time.
	 * No change is made unless:
	 * - There is no currently registered notification.
	 * - The currently registered notification should fire after the new notification.
	 * @param {AudioNotificationEntry=} notification The notification entry to register.
	 * @param {boolean} force If true, the notification will be invoked, even if its time has
	 *        passed.  Should only be true when called from
	 *        {@link #invokeCurrentNotification}.
	 * /
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

		if (this.#nextNotification) {
			if (this.#nextNotification.when <= notification.when) {
				return;
			}

			this.manager.removeNotification(this.#nextNotificationId);
		}

		// Start new notification
		this.#nextNotification = notification;

		const when = (this.#startTime - (this.#baseBuffer.duration - this.#currentBuffer.duration)) + notification.when;
		this.#nextNotificationId = this.manager.addNotification(when, undefined, () => { this.#invokeCurrentNotification(); });
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
	 * /
	addNotification(when, data, callback) {
		if (callback == null) {
			callback = (notification) => {
				this.triggerEvent('notification', notification);
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
	 * /
	removeNotification(notification) {
		if (this.#notifications) {
			/** @type AudioNotificationEntry|undefined * /
			let next;

			if (this.#nextNotification && (this.#nextNotification.id == notification)) {
				next = this.#nextNotification.next;
				this.#unscheduleCurrentNotification();
			}

			this.#notifications = this.#notifications.remove(notification);

			if (next) {
				this.#scheduleNextNotificationIfNeeded(next);
			}
		}
	} // removeNotification

	/**
	 * The currently defined notifications for this clip.  Modifications of
	 * the returned array will not affect the clip.
	 * /
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
* /

} // AudioClip

*/