import { AudioManager } from "./AudioManager";
import { AudioNotificationEntry, AudioNotification } from "./AudioNotificationEntry";
import { EventDispatcher } from "./EventDispatcher";


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
	 * @see [[name]]
	 */
	private _name: string;

	/**
	 * @see [[baseBuffer]]
	 */
	private _baseBuffer: AudioBuffer;

	/**
	 * The current view of the audio buffer, based on previous start/stop/pause/seek operations.
	 */
	private _currentBuffer: AudioBuffer;

	/**
	 * @see [[manager]]
	 */
	private _manager: AudioManager;

	/**
	 * The last position set.
	 * @see [[position]]
	 */
	private _position: number = 0;

	/**
	 * @see [[paused]]
	 */
	private _paused: boolean = false;

	/**
	 * The time, relative to the audio context's clock when playing began.
	 * This value is used for determining the current position as well as whether the clip is
	 * currently playing or not.
	 * @see [[playing]]
	 * @see [[position]]
	 */
	private _startTime: number = Number.NaN;

	/**
	 * Linked list of registered notifications.
	 */
	private _notifications: AudioNotificationEntry|undefined;

	/**
	 * The notification that is currently scheduled to fire next.
	 */
	private _currentNotification: AudioNotificationEntry|undefined;

	/**
	 * The ID of the current notification.
	 */
	private _currentNotificationId: number = 0;

	/**
	 * The ID of the registered stop event notification, if a stop is scheduled.
	 * @see [[stop]]
	 * @see [[pause]]
	 */
	private _stoppingNotificationId: number = 0;

	/**
	 * The WebAudio GainNode used to control the gain for this audio clip.
	 * @see [[gain]]
	 * @see [[gainParam]]
	 */
	private _gainNode: GainNode;

	/**
	 * The WebAudio node for this audio clip.
	 */
	private _node: AudioBufferSourceNode|undefined;

	/**
	 * Constructs a new AudioClip instance.
	 *
	 * @param	context		The audio context to create the clip under.
	 * @param	name		A name to associate with the audio clip instance.  This name is
	 *						used to identify the clip in the containing [[AudioManager]].
	 * @param	source		The source AudioClip or AudioBuffer to retrieve the audio
	 *						data from.
	 */
	constructor(context: AudioManager|AudioClip, name: string, source: AudioClip|AudioBuffer) {
		super();

		if (context instanceof AudioClip) {
			source = context;
			this._manager = source._manager;
		} else
			this._manager = context;

		this._name = name;
		this._manager.registerClip(this);

		this._gainNode = this.context.createGain();

		if (source instanceof AudioClip) {
			this._baseBuffer = (source as AudioClip)._baseBuffer;
		} else {
			this._baseBuffer = source as AudioBuffer;
		}

		this._currentBuffer = this._baseBuffer;

		// Initialize the AudioBufferSourceNode for triggering start events for this clip
		this.addNotification(0, undefined, () => { this.trigger('start'); });
	} // constructor

	/**
	 * Creates a copy of an AudioBuffer containing only the specified range of the audio data.
	 *
	 * @param	buffer		The AudioBuffer to clone.
	 * @param	startTime	The starting timestamp, in seconds, within the buffer to use for the
	 *						starting position of the new clone.  May be negative, in which case
	 *						an appropriate amount of silence will be inserted into the beginning
	 *						of the new buffer.
	 * @param	duration	The duration to copy from the original buffer into the new clone, in
	 *						seconds.  If not specified, the remainder of the buffer starting at
	 *						`startTime` will be copied.  If the specified duration would exceed the
	 *						duration of the source buffer, silence will be appended to the end of
	 *						the new buffer to pad the clip to the specified duration.  Must be a
	 *						positive value.
	 */
	private cloneBuffer(buffer: AudioBuffer, startTime: number, duration?: number): AudioBuffer {
		let startSample: number = Math.trunc(startTime * buffer.sampleRate);

		let numSamples: number =
			(duration == null
				? buffer.length - startSample
				: Math.ceil(duration * buffer.sampleRate)
			);

		if (numSamples < 1)
			numSamples = 1;

		let endSample: number = startSample + numSamples;

		if (endSample >= buffer.length)
			endSample = buffer.length - 1;

		let channelSampleOffset: number = 0;

		if (startSample < 0) {
			channelSampleOffset = -startSample;
			startSample = 0;
		}

console.log("clone buffer: startSample=", startSample, ", numSamples=", numSamples, ", endSample=", endSample, ", channelSampleOffset=", channelSampleOffset);

		let clonedBuffer: AudioBuffer = this.context.createBuffer(
			buffer.numberOfChannels,
			numSamples,
			buffer.sampleRate
		);

		if (endSample >= 0) {
			// Copy audio data within the specified range for each channel
			for (let channel: number = buffer.numberOfChannels - 1; channel >= 0; --channel) {
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
	 * @param	name		The name for the new sprite.
	 * @param	startTime	The position within this clip to use as the start of the sprite, in
	 *						seconds relative to the start of this clip.  Must be in
	 *						[0, this clip's duration).
	 * @param	duration	The duration, in seconds, to use for the sprite.  The startTime +
	 *						duration cannot exceed the duration of the original clip.
	 *
	 * @return	A new AudioClip instance containing the specified portion of this audio clip.
	 *			Notifications are not cloned into the new sprite.
	 */
	createSprite(name: string, startTime: number, duration: number): AudioClip {
		return new AudioClip(
			this._manager,
			name,
			this.cloneBuffer(this._baseBuffer as AudioBuffer, startTime, duration)
		);
	} // createSprite

	/**
	 * Retrieves the name of this AudioClip, as registered with the associated AudioManager.
	 * @return	The name of this AudioClip, as registered with the associated [[AudioManager]].
	 */
	get name(): string {
		return this._name;
	} // name

	/**
	 * Retrieves the context this clip was created under.
	 * @return	The context this clip was created under.
	 */
	get context(): AudioContext {
		return this._manager.context;
	} // context

	/**
	 * Retrieves the manager this clip was created under.
	 * @return	The manager this clip was created under.
	 */
	get manager(): AudioManager {
		return this._manager;
	} // manager

	/**
	 * Determines whether the clip is currently playing or not.
	 * @return	Whether the clip is currently playing or not.
	 */
	get playing(): boolean {
		return !Number.isNaN(this._startTime) && (this._manager.currentTime >= this._startTime);
	} // playing

	/**
	 * Determines whether the clip is current paused or not.
	 * @return	Whether the clip is current paused or not.
	 */
	get paused(): boolean {
		return this._paused;
	} // paused

	/**
	 * Retrieves the number of audio channels for this clip.
	 * @return	The number of audio channels for this clip.
	 */
	get numberOfChannels(): number {
		return this._baseBuffer.numberOfChannels;
	} // numberOfChannels

	/**
	 * Retrieves the sample rate of the underlying audio buffer, in Hz.
	 * @return	The sample rate of the underlying audio buffer, in Hz.
	 */
	get sampleRate(): number {
		return this._baseBuffer.sampleRate;
	} // sampleRate

	/**
	 * Retrieves the length of the clip, in samples.
	 * @return	The length of the clip, in samples.
	 */
	get length(): number {
		return this._baseBuffer.length;
	} // length

	/**
	 * Retrieves the duration of the clip, in seconds.
	 * @return	The duration of the clip, in seconds.
	 */
	get duration(): number {
		return this._baseBuffer.duration;
	} // duration

	/**
	 * Retrieves the current position of the clip, in seconds relative to the start of the clip.
	 * @return	The current position of the clip, in seconds relative to the start of the clip.
	 */
	get position(): number {
		return (
			Math.min(
				(Number.isNaN(this._startTime)
					? this._position	// not playing
					: (this._baseBuffer.duration - this._currentBuffer.duration) +	// Offset of last start pos
						(this._manager.currentTime - this._startTime)				// Current play duration
				),
				this.duration
			)
		);
	} // position

	/**
	 * Sets the current position of the clip, in seconds relative to the start of the clip.
	 *
	 * @param	position	The new position, in seconds relative to the start of the clip.
	 *						Values less than 0 or past the end of the clip will be clamped.
	 */
	set position(position: number) {
		let playing: boolean = this.playing;
		if (playing) {
			this._stop();
			this._startTime = Number.NaN;
		}
		this._position = Math.max(position, 0);
		if (playing) this.start();
	} // position

	/**
	 * Retrieves the current position of the clip, in samples relative to the start of the clip.
	 * @return	The current position of the clip, in samples relative to the start of the clip.
	 */
	get samplePosition(): number {
		return Math.trunc(this.position * this.sampleRate);
	} // samplePosition

	/**
	 * Sets the current position of the clip, in samples relative to the start of the clip.
	 *
	 * @param	samplePosition	The new position, in samples relative to the start of the clip.
	 *						Values less than 0 or greater than the number of samples in the the
	 *						clip will be clamped.
	 */
	set samplePosition(samplePosition: number) {
		this.position = samplePosition / this.sampleRate;
	} // samplePosition

	/**
	 * Retrieves the AudioParam for this clip's GainNode.
	 * @return	The AudioParam for this clip's GainNode.
	 */
	get gainParam(): AudioParam {
		return this._gainNode.gain;
	} // gainParam

	/**
	 * Retrieves the current gain value for this clip.
	 * @return	The current gain value for this clip.
	 */
	get gain(): number {
		return this._gainNode.gain.value;
	} // gain

	/**
	 * Sets the current gain value for this clip.
	 * @param	value	The new gain value to assign to the clip.
	 */
	set gain(value: number) {
		this._gainNode.gain.value = value;
	} // gain

	/**
	 * Queues this AudioClip to begin playing at it's current position at the specified time
	 * relative to the associated context's clock.
	 *
	 * @param	when	The timestamp when this clip should begin playing, relative to the
	 *					associated context's clock.  If not specified, or in the past, then playback
	 *					will begin immediately.
	 */
	start(when?: number): void {
		if (this.playing)
			throw new Error("Clip already playing");

		this._paused = false;

		let pos: number = this.position;
		if (pos == 0)
			this._currentBuffer = this._baseBuffer;
		else
			this._currentBuffer = this.cloneBuffer(this._baseBuffer, pos);

		// Enable the gain node
		this._gainNode.connect(this.context.destination);

		// Initialize the AudioBufferSourceNode for the clip
		this._node = this.context.createBufferSource();
		this._node.buffer = this._currentBuffer;
		this._node.connect(this._gainNode);
		this._node.addEventListener('ended', () => {
			if (this.position >= this.duration)
				this.stop();
				// TODO: What about looping?
		});

		this._startTime = (when && when >= this._manager.currentTime ? when : this._manager.currentTime);

		if (this._notifications)
			this.scheduleNextNotificationIfNeeded(this._notifications.nextOccurring(this.position));

		this._node.start(when);
	} // start

	/**
	 * Pauses the clip at its current position at the specified time.
	 * Calling this method has no effect if the clip hasn't been started.
	 * @param	when	The timestamp when this clip should stop playing, relative to the
	 *					associated context's clock.  If not specified, or in the past, then playback
	 *					will stop immediately.
	 */
	pause(when?: number): void {
		this._stop(when, () => {
			this._paused = true;
			this.trigger('pause');
		});
	} // pause

	/**
	 * Stops playing the current clip at the specified time, and resets the position to 0.
	 * Calling this method has no effect if the clip hasn't been started.
	 * @param	when	The timestamp when this clip should stop playing, relative to the
	 *					associated context's clock.  If not specified, or in the past, then playback
	 *					will stop immediately.
	 */
	stop(when?: number): void {
		let commonStopActions = (additionalActions?:Function) => {
			this._paused = false;
			this._position = 0;
			if (additionalActions)
				additionalActions();
			this.trigger('stop');
		};

		if (this.paused)
			commonStopActions();
		else
			this._stop(when, () => {
				commonStopActions(() => {
					if (this._node) {
						this._node.disconnect();
						this._node = undefined;

						// Disable the gain node
						this._gainNode.disconnect();
					}
				});
			});
	} // stop

	/**
	 * Performs a scheduled stop, calling a custom callback when the audio stops.
	 * @param	when		The timestamp when this clip should stop playing, relative to the
	 *						associated context's clock.  If not specified, or in the past, then
	 *						playback will stop immediately.
	 * @param	callback	The callback to invoke when the playback stops.
	 */
	private _stop(when?: number, callback?: () => void): void {
		if (Number.isNaN(this._startTime))
			return;

		if (this._stoppingNotificationId) {
			this.manager.removeNotification(this._stoppingNotificationId);
			this._stoppingNotificationId = 0;
		}

		let wrappedCallback;
		if (callback) {
			wrappedCallback = () => {
				this.unscheduleCurrentNotification();
				this._position = this.position;
				this._startTime = Number.NaN;
				this._stoppingNotificationId = 0;
				callback();
			};
		}

		when = (!when || when <= this.context.currentTime ? undefined : when);
		if (this._node)
			this._node.stop(when);

		if (wrappedCallback) {
			if (when) {
				this._stoppingNotificationId = this.manager.addNotification(when, undefined, wrappedCallback);
			} else {
				wrappedCallback();
			}
		}
	} // _stop

	/**
	 * Invokes the current notification when it's time has come.
	 */
	private invokeCurrentNotification(): void {
		if (this._currentNotification) {
			this._currentNotification.invoke();

			let next: AudioNotificationEntry|undefined = this._currentNotification.next;
			this.unscheduleCurrentNotification();
			this.scheduleNextNotificationIfNeeded(next, true);
		}
	} // invokeCurrentNotification

	/**
	 * Stops/unschedules current notification if one is scheduled.
	 */
	private unscheduleCurrentNotification(): void {
		if (this._currentNotification) {
			this.manager.removeNotification(this._currentNotificationId);
			this._currentNotification = undefined;
			this._currentNotificationId = 0;
		}
	} // unscheduleCurrentNotification

	/**
	 * Registers a notification node to fire an event at it's specified time.
	 * No change is made unless:
	 * - There is no currently registered notification.
	 * - The currently registered notification should fire after the new notification.
	 * @param	notification	The notification entry to register.
	 * @param	force			If true, the notification will be invoked, even if its time has
	 *							passed.  Should only be true when called from
	 *							[[invokeCurrentNotification]].
	 */
	private scheduleNextNotificationIfNeeded(notification: AudioNotificationEntry|undefined, force: boolean = false): void {
		if (!this.playing || !notification || !this._baseBuffer)
			return;

		let now = this.position;
		if (notification.when < now) {
			if (force) {
				notification.invoke();
				this.scheduleNextNotificationIfNeeded(notification.next, true);
			}
			return;
		}

		if (this._currentNotification) {
			if (this._currentNotification.when <= notification.when) {
				return;
			}

			this.manager.removeNotification(this._currentNotificationId);
		}

		// Start new notification
		this._currentNotification = notification;

		let when: number = (this._startTime - (this._baseBuffer.duration - this._currentBuffer.duration)) + notification.when;
		this._currentNotificationId = this.manager.addNotification(when, undefined, () => { this.invokeCurrentNotification(); });
	} // scheduleNextNotificationIfNeeded

	 /**
	 * Specifies that a notification callback should be triggered at the specified time (relative
	 * to the start of the clip) each time the clip is played or repeats.
	 *
	 * @param	when		The time relative to the start of the clip when the callback should be
	 *						invoked. Times less than 0 and times greater than the length of the clip
	 *						will be clamped.
	 * @param	data		Additional data to associate with the triggered notification.
	 * @param	callback	The [[AudioNotification.Callback]] to invoke when the notification time
	 *						is reached.  If no callback is specified, will trigger a "notification"
	 *						event instead.
	 *
	 * @return	A value that can be used to unregister the notification at a later time.
	 */
	addNotification(when: number, data?: any, callback?: AudioNotification.Callback): number {
		let notification: AudioNotificationEntry;

		if (!callback) {
			callback = (notification: AudioNotification) => {
				this.trigger('notification', notification);
			};
		}

		notification = new AudioNotificationEntry(when, callback, data);

		this._notifications = (
			this._notifications
				? this._notifications.insert(notification)
				: notification
		);

		this.scheduleNextNotificationIfNeeded(notification);

		return notification.id;
	} // addNotification

	/**
	 * Removes the notification with the specified ID from the list of regsitered notifications.
	 *
	 * @param	notification	The ID of the notification to unregister, as returned by
	 *							[[addNotification]].
	 */
	removeNotification(notification: number): void {
		if (this._notifications) {
			let next: AudioNotificationEntry|undefined;

			if (this._currentNotification && (this._currentNotification.id == notification)) {
				next = this._currentNotification.next;
				this.unscheduleCurrentNotification();
			}

			this._notifications = this._notifications.remove(notification);

			if (next)
				this.scheduleNextNotificationIfNeeded(next);
		}
	} // removeNotification

	/**
	 * Retrieves the currently defined notifications for this clip.
	 * @return	An array of the currently defined notifications for this clip.  Modifications of
	 *			the returned array will not affect the clip.
	 */
	get notifications(): AudioNotification[] {
		let rv: AudioNotification[] = [];
		let n: AudioNotificationEntry|undefined = this._notifications;
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