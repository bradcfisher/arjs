
import { EventDispatcher } from "./EventDispatcher";
import { AudioNotificationEntry, AudioNotification } from "./AudioNotificationEntry";
import { AudioClip } from "./AudioClip";

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
	 * @see [[context]]
	 */
	private _context: AudioContext;

	/**
	 * The currently registered clips.
	 * @see [[loadClip]]
	 * @see [[loadClips]]
	 * @see [[getClip]]
	 */
	private _clips: { [name:string]: AudioClip };

	/**
	 * Linked list of registered notifications.
	 * @see [[addNotification]]
	 * @see [[removeNotification]]
	 */
	private _notifications?: AudioNotificationEntry;

	/**
	 * The last notification entry that was scheduled.
	 */
	private _currentNotification?: AudioNotificationEntry;

	/**
	 * The audio buffer used for scheduling notification events.
	 */
	private _currentNotificationBuffer: AudioBuffer;

	/**
	 * The source node used by the last registered notification for triggering an event when that
	 * point in time is reached.
	 */
	private _currentNotificationNode: AudioBufferSourceNode|undefined;

	/**
	 * The current event callback function for the last registered notification.
	 * Used for removing the event listener if the notification event is cancelled.
	 */
	private _currentNotificationCallback: (() => void)|undefined;

	/**
	 * Constructs a new AudioManager instance.
	 */
	constructor() {
		super();

		this._clips = {};
		this._context = new AudioContext();

		this._currentNotificationBuffer = this._context.createBuffer(1, 1, this._context.sampleRate);
	} // constructor

	/**
	 * Retrieves the audio context for this AudioManager.
	 * @return	The audio context for this AudioManager.
	 */
	get context(): AudioContext {
		return this._context;
	} // context

	/**
	 * Suspends the progression of time for the associated audio context.
	 * @return	A Promise that resolves with void. The promise is rejected if the context
	 *			has already been closed.
	 */
	suspend() {
		console.log('suspending context', this._context, 'state='+ this._context.state);
		return this._context.suspend().then((val) => { console.log('suspend OK', val); }, (err) => { console.log('suspend FAILED', err); });
	} // suspend

	/**
	 * Resumes the progression of time for the associated audio context.
	 * @return	A Promise that resolves with void. The promise is rejected if the context
	 *			has already been closed.
	 */
	resume() {
		console.log('resuming context', this._context, 'state='+ this._context.state);
		return this._context.resume().then((val) => { console.log('resume OK', val); }, (err) => { console.log('resume FAILED', err); });
	} // resume

	/**
	 * Retrieves the current audio clock timestamp.
	 * @return	The current audio clock timestamp.
	 */
	get currentTime(): number {
		return this._context.currentTime;
	} // currentTime

	/**
	 * Retrieves the destination node for this AudioManager.
	 * @return	The destination node for this AudioManager.
	 */
	get destination(): AudioNode {
		return this._context.destination;
	} // destination

	registerClip(clip: AudioClip): void {
		if (clip.manager !== this)
			throw new Error("Only clips created under this AudioManager can be registered");

		if (this._clips[clip.name])
			throw new Error("A clip named '"+ name +"' has already been defined");

		this._clips[clip.name] = clip;
	} // registerClip

	/**
	 * Returns a Promise which resolves to a new AudioClip with the specified name
	 * and audio data.
	 *
	 * @param	name		The name to register the new clip under.
	 * @param	audioData	The audio data to use for the clip.  Must be in a supported
	 *						audio format.
	 */
	clipFromArrayBuffer(name: string, audioData: ArrayBuffer): Promise<AudioClip> {
console.log("clipFromArrayBuffer: ", name, audioData);
		return new Promise<AudioClip>((accept, reject) => {
			this._context.decodeAudioData(audioData).then(
				(buffer) => {
					accept(new AudioClip(this, name, buffer));
				},
				(error) => {
					reject(error);
				}
			)
		});
	} // clipFromArrayBuffer

	/**
	 * Retrieves the audio clip registered with the provided name.
	 * @param	name	The name the desired audio clip was registered under.
	 * @return	The audio clip registered with the provided name.
	 */
	getClip(name: string): AudioClip {
		return this._clips[name];
	} // getClip

	/**
	 * Invokes the current notification when it's time has come.
	 */
	private invokeCurrentNotification(): void {
		if (this._currentNotification) {
			let entry: AudioNotificationEntry = this._currentNotification;
			if (this._notifications)
				this._notifications = this._notifications.remove(this._currentNotification.id);
			this._currentNotification = this._currentNotificationNode = undefined;

			entry.invoke();

			this.scheduleNextNotificationIfNeeded();
		} else
			console.warn("invokeCurrentNotification: no notifications to process at "+ this._context.currentTime);
	} // invokeCurrentNotification

	/**
	 * Stops/unschedules current notification if one is scheduled.
	 */
	unscheduleCurrentNotification(): void {
		if (this._currentNotification) {
			if (this._currentNotificationNode) {
				this._currentNotificationNode.stop();
        if (this._currentNotificationCallback)
          this._currentNotificationNode.removeEventListener('ended', this._currentNotificationCallback);
			}
			this._currentNotification = undefined;
			this._currentNotificationCallback = undefined;
			this._currentNotificationNode = undefined;
		}
	} // unscheduleCurrentNotification

	/**
	 * Schedules the next notification node to fire an event at it's specified time, if an earlier
	 * event isn't already scheduled.
	 */
	private scheduleNextNotificationIfNeeded(): void {
		if (!this._notifications || this._currentNotification === this._notifications) {
			return; // Nothing to schedule
		}

		let notification: AudioNotificationEntry = this._notifications;

		if (this._currentNotification) {
			if (this._currentNotification.when <= notification.when) {
				return; // No need to reschedule
			}

			this.unscheduleCurrentNotification();
		}

		// Start new notification
		this._currentNotificationNode = this._context.createBufferSource();
		this._currentNotificationNode.buffer = this._currentNotificationBuffer;
		this._currentNotificationNode.connect(this._context.destination);

		this._currentNotification = this._notifications;

		this._currentNotificationCallback = () => {
			this.invokeCurrentNotification();
		};

		this._currentNotificationNode.addEventListener(
			'ended',
			this._currentNotificationCallback
		);

		this._currentNotificationNode.start(
			notification.when <= this._context.currentTime + 0.002 ? undefined : notification.when
		);
	} // scheduleNextNotificationIfNeeded

	/**
	 * Specifies that a notification event containing the given data be fired at the specified
	 * time relative to the audio context's clock
	 *
	 * @param	when		The time relative to the audio context's clock when the event should be
	 *						fired.  If this time is in the past, no action is taken.
	 * @param	data		Additional data to associate with the triggered notification.
	 * @param	callback	The [[AudioNotification.Callback]] to invoke when the notification time
	 *						is reached.  If no callback is specified, will trigger a "notification"
	 *						event instead.
	 *
	 * @return	A value that can be used to unregister the notification at a later time, or 0 if
	 *			the notification was executed immediately or was specified to execute in the past.
	 */
	addNotification(when: number, data?: any, callback?: AudioNotification.Callback): number {
		let notification: AudioNotificationEntry;

		if (!callback) {
			callback = (notification: AudioNotification) => {
				this.trigger('notification', notification);
			};
		}

		notification = new AudioNotificationEntry(when, callback, data);

		let now: number = this._context.currentTime;
		if (when < now - 0.005) {
			console.warn("requested time "+ when +" expired (now="+ now +")");
			return 0;
		} else if (when <= now + 0.005) {
			notification.invoke();
			return 0;
		}

		this._notifications = (
			this._notifications
				? this._notifications.insert(notification)
				: notification
		);

		this.scheduleNextNotificationIfNeeded();

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
			let reschedule: boolean = false;

			if (this._currentNotification && (this._currentNotification.id == notification)) {
				reschedule = true;
				this.unscheduleCurrentNotification();
			}

			this._notifications = this._notifications.remove(notification);

			if (reschedule)
				this.scheduleNextNotificationIfNeeded();
		}
	} // removeNotification

} // AudioManager
