import { AudioManager } from "./AudioManager";
import { AudioNotificationEntry } from "./AudioNotificationEntry";
import { EventDispatcher } from "./EventDispatcher";


/**
 * Represents an audio clip.
 *
 * Clip Events:
 *  - load			Sent when a load operation completes
 *  - error			Sent when a load operation fails
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
 *   error: The error that occurred
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
	private _baseBuffer: AudioBuffer|undefined;

	/**
	 * The current view of the audio buffer, based of previous start/stop/pause/seek operations.
	 */
	private _currentBuffer: AudioBuffer;

	/**
	 * The AudioManager that this clip was created under.
	 */
	private _manager: AudioManager;

	/**
	 * The last position set.
	 */
	private _position: number = Number.NaN;

	/**
	 * The time, relative to the audio context's clock when playing began.
	 */
	private _startTime: number = 0;

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
	private _currentNotificationId: number = Number.NaN;

	/**
	 * The WebAudio node for this audio clip.
	 */
	private _node: AudioBufferSourceNode|undefined;

	/**
	 * Constructs a new AudioClip instance.
	 *
	 * @param	context		The audio context to create the clip under.
	 * @param	source		The source AudioClip, AudioBuffer, or url string to retrieve the audio
	 *						data from.
	 */
	constructor(context: AudioManager|AudioClip, name: string, source: AudioClip|AudioBuffer|string|undefined) {
		super();

		if (context instanceof AudioClip) {
			source = context;
			this._manager = source._manager;
		} else
			this._manager = context;

		this._name = name;
		this._manager.registerClip(this);

		if (typeof source === "string") {
			this.loadFromUrl(source as string);
		} else {
			if (source instanceof AudioClip)
				source = (source as AudioClip)._baseBuffer;

			this._baseBuffer = source as AudioBuffer;
		}

		// Initialize the AudioBufferSourceNode for triggering start events for this clip
		this.addNotification(0, () => { this.trigger('start'); });
	} // constructor

	/**
	 * Creates a copy of an AudioBuffer containing only the specified range of the audio data.
	 *
	 * @param	buffer		The AudioBuffer to clone.
	 * @param	startTime	The starting timestamp within the buffer to use for the starting
	 *						position of the new clone.
	 * @param	duration	The duration to copy from the original buffer into the new clone.
	 */
	private cloneBuffer(buffer: AudioBuffer, startTime: number, duration?: number): AudioBuffer {
		let startSample: number = startTime * buffer.sampleRate;

		if (duration == null)
			duration = buffer.duration - startTime;

		let numSamples: number = duration * buffer.sampleRate;
console.log("cloneBuffer: startTime="+ startTime +" duration="+ duration +" | startSample="+ startSample +" numSamples="+ numSamples);
		let rv: AudioBuffer = this.context.createBuffer(
			buffer.numberOfChannels,
			numSamples,
			buffer.sampleRate
		);

		// Copy audio data within the specified range for each channel
		for (let channel: number = buffer.numberOfChannels - 1; channel >= 0; --channel) {
			rv.copyToChannel(
				buffer.getChannelData(channel).subarray(startSample, startSample + numSamples),
				channel
			);
		}

		return rv;
	} // cloneBuffer

	/**
	 * Creates a new AudioClip "sprite" based on this clip.
	 *
	 * Throws an Error if the content has not completed loading.
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
		if (!this._baseBuffer)
			throw new Error("Content not loaded");

		return new AudioClip(
			this._manager,
			name,
			this.cloneBuffer(this._baseBuffer as AudioBuffer, startTime, duration)
		);
	} // createSprite

	/**
	 * Loads new audio content into this clip from the specified URL, stopping the clip if it's
	 * currently playing.
	 *
	 * @param	url		The location to retrieve the new audio data from.
	 *
	 * @return	A Promise executing the asynchronous load operation.
	 */
	loadFromUrl(url: string): Promise<AudioClip> {
		this.stop();
		this._baseBuffer = undefined;
		this._startTime = Number.NaN;

		return new Promise<AudioClip>((accept, reject) => {
			let request: XMLHttpRequest = new XMLHttpRequest();
			request.open('GET', url);
			request.responseType = 'arraybuffer';
			request.onload = () => {
				if (request.status == 200) {
					this.context.decodeAudioData(request.response, (buffer) => {
						this._baseBuffer = buffer;
						this.trigger('load');
						accept(this);
					});
				} else {
					let error: Error = new Error(request.status +" "+ request.statusText);
					this.trigger('error', error);
					reject(error);
				}
			};
			request.onerror = (error) => {
				this.trigger('error', error);
				reject(error);
			};
			request.send();
		});
	} // loadFromUrl

	/**
	 * Retrieves the name of this AudioClip, as registered with the associated AudioManager.
	 * @return	The name of this AudioClip, as registered with the associated AudioManager.
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
	 * Determines whether the audio content has been completely loaded or not.
	 * @return	Whether the audio content has been completely loaded or not.
	 */
	get loaded(): boolean {
		return (this._baseBuffer != null);
	} // loaded

	/**
	 * Determines whether the clip is currently playing or not.
	 * @return	Whether the clip is currently playing or not.
	 */
	get playing(): boolean {
		return !Number.isNaN(this._startTime) && (this._manager.currentTime >= this._startTime);
	} // playing

	/**
	 * Retrieves the number of audio channels for this clip.
	 * If the content has not completed loading, this property returns 0.
	 * @return	The number of audio channels for this clip.
	 */
	get numberOfChannels(): number {
		return (this._baseBuffer ? this._baseBuffer.numberOfChannels : 0);
	} // numberOfChannels

	/**
	 * Retrieves the sample rate of the underlying audio buffer, in Hz.
	 * If the content has not completed loading, this property returns 0.
	 * @return	The sample rate of the underlying audio buffer, in Hz.
	 */
	get sampleRate(): number {
		return (this._baseBuffer ? this._baseBuffer.sampleRate : 0);
	} // sampleRate

	/**
	 * Retrieves the length of the clip, in samples.
	 * If the content has not completed loading, this property returns 0.
	 * @return	The length of the clip, in samples.
	 */
	get length(): number {
		return (this._baseBuffer ? this._baseBuffer.length : 0);
	} // length

	/**
	 * Retrieves the duration of the clip, in seconds.
	 * If the content has not completed loading, this property returns 0.
	 * @return	The duration of the clip, in seconds.
	 */
	get duration(): number {
		return (this._baseBuffer ? this._baseBuffer.duration : 0);
	} // duration

	/**
	 * Retrieves the current position of the clip, in seconds relative to the start of the clip.
	 * If the content has not completed loading, this property returns 0.
	 * @return	The current position of the clip, in seconds relative to the start of the clip.
	 */
	get position(): number {
		return (
			this._baseBuffer // loaded
				? Math.min(
					(Number.isNaN(this._startTime)
						? this._position	// not playing
						: (this._baseBuffer.duration - this._currentBuffer.duration) +	// Offset of last start pos
							(this._manager.currentTime - this._startTime)				// Current play duration
					),
					this.duration
				)
				: 0
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
		if (playing) this.stop();
		this._position = Math.max(position, 0);
		if (playing) this.start();
	} // position

	/**
	 * Retrieves the current position of the clip, in samples relative to the start of the clip.
	 * If the content has not completed loading, this property returns 0.
	 * @return	The current position of the clip, in samples relative to the start of the clip.
	 */
	get samplePosition(): number {
		return Math.trunc(this.position * this.sampleRate);
	} // samplePosition

	/**
	 * Sets the current position of the clip, in seconds relative to the start of the clip.
	 * Note that setting this value before the clip is loaded will always result in the position
	 * being set to 0, regardless of the value specified.
	 *
	 * @param	position	The new position, in seconds relative to the start of the clip.
	 *						Values less than 0 or past the end of the clip will be clamped.
	 */
	set samplePosition(samplePosition: number) {
		this.position = samplePosition * this.sampleRate;
	} // samplePosition

	/**
	 * Queues this AudioClip to begin playing at it's current position at the specified time
	 * relative to the associated context's clock.
	 *
	 * Calling this method has no effect if the clip hasn't finished loading.
	 *
	 * @param	when	The timestamp when this clip should begin playing, relative to the
	 *					associated context's clock.  If not specified, then playback will begin
	 *					immediately.
	 */
	start(when?: number): void {
		if (!this._baseBuffer)
			return;

		let pos: number = this.position;
		if (pos == 0)
			this._currentBuffer = this._baseBuffer;
		else
			this._currentBuffer = this.cloneBuffer(this._baseBuffer, pos);

		// Initialize the AudioBufferSourceNode for the clip
		this._node = this.context.createBufferSource();
		this._node.buffer = this._currentBuffer;
		this._node.connect(this._manager.destination);
		this._node.addEventListener('ended', (function() {
			if (this.position >= this.duration)
				this.trigger('stop');
		}).bind(this));

		this._startTime = (when ? when : this._manager.currentTime);

		if (this._notifications)
			this.scheduleNextNotificationIfNeeded(this._notifications.nextOccurring(this.position));

		this._node.start(when);
	} // start

	/**
	 * Pauses the clip at its current position.
	 * Calling this method has no effect if the clip hasn't been started.
	 */
	pause(): void {
		if (Number.isNaN(this._startTime))
			return;

// TODO: Allow scheduled pauses by passing a `when` parameter?
		let pausePosition = this.position;
		this.stop();
		this._position = pausePosition;
		this.trigger('pause', { target: this });
	} // pause

	/**
	 * Stops playing the current clip.
	 * Calling this method has no effect if the clip hasn't been started.
	 */
	stop(when?: number): void {
		if (Number.isNaN(this._startTime))
			return;

		if (this._node)
			this._node.stop();

		this.unscheduleCurrentNotification();

		this._startTime = Number.NaN;
		this._position = 0;
	} // stop

	/**
	 * Invokes the current notification when it's time has come.
	 */
	private invokeCurrentNotification(): void {
console.log("invokeCurrentNotification: hasCurrent="+ !!this._currentNotification);
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

console.log("AudioClip::scheduleNextNotificationIfNeeded: when="+ notification.when);

		let now = this.position;
		if (notification.when < now) {
console.log("AudioClip::scheduleNextNotificationIfNeeded: when is in the past");
			if (force) {
				notification.invoke();
				this.scheduleNextNotificationIfNeeded(notification.next, true);
			} else
				return;
		}

		if (this._currentNotification) {
console.log("AudioClip::scheduleNextNotificationIfNeeded: has current");
			if (this._currentNotification.when <= notification.when)
				return;

			this.manager.removeNotification(this._currentNotificationId);
		}

console.log("AudioClip::scheduleNextNotificationIfNeeded: adding notification to manager");

		// Start new notification
		this._currentNotification = notification;

		let when: number = (this._startTime - (this._baseBuffer.duration - this._currentBuffer.duration)) + notification.when;
		this._currentNotificationId = this.manager.addNotification(when, () => { this.invokeCurrentNotification(); });
	} // scheduleNextNotificationIfNeeded

	/**
	 * Specifies that a notification event containing the given data be fired at the specified time
	 * (relative to the start of the clip) each time the clip is played or repeats.
	 *
	 * @param	atTime	The time relative to the start of the clip when the event should be fired.
	 *					Times less than 0 and times greater than the length of the clip will be
	 *					clamped.
	 * @param	data	Additional data to attach to the event object for the notification.
	 *					If a function, the function will be executed at the specified time, any
	 *					other type of value will trigger a 'notification' event to be fired with
	 *					the value assigned to the data property.
	 *
	 * @return	A value that can be used to unregister the notification at a later time.
	 */
	addNotification(atTime: number, data?: Object): number {
		let notification: AudioNotificationEntry;
		let callback: AudioNotificationEntry.Callback;

		if (typeof data === "function") {
			callback = data;
		} else {
			callback = () => {
				this.trigger('notification', data);
			};
		}

		notification = new AudioNotificationEntry(atTime, callback);

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

/*
	autoplay?
	volume
	loop/repeat
*/

} // AudioClip