
import { EventDispatcher } from "./EventDispatcher";
import { AudioNotificationEntry } from "./AudioNotificationEntry";
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
	 * The associated audio context.
	 */
	private _context: AudioContext;

	/**
	 * The currently registered clips.
	 */
	private _clips: { [name:string]: AudioClip };

	/**
	 * Linked list of registered notifications.
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
	 * Loads and registers an audio clip from a URL.
	 * @param	name	The name to register the audio clip under.
	 * @param	url		The URL to load the audio clip from.
	 * @return	The new AudioClip instance.
	 */
	loadClip(name: string, url: string): AudioClip {
		return new AudioClip(this, name, url);
	}  // loadAudioClip

	/**
	 * Starts loading several clips at once.
	 *
	 * @param	assetMap	Object whose values are URLs of clips to load, and whose keys are the
	 *						names to assign those clips to.
	 * ```typescript
	 * {
	 *   "clip1": "http://www.example.com/audio/someClip.ogg",
	 *   "laser": "http://www.example.com/audio/coolLaser.ogg"
	 * }
	 * ```
	 *
	 * @return	A promise that will complete after all of the specified assets have loaded.
	 */
	loadClips(assetMap: {[name:string]: string}): Promise<AudioClip[]> {
		let promises: Promise<AudioClip>[] = [];
		for (let name in assetMap) {
			promises.push(
				new Promise<AudioClip>((accept, reject) => {
					let completeAction: EventDispatcher.Callback =
						(target: AudioClip, event: string, data: any) => {
							target.off('load', completeAction);
							target.off('error', completeAction);
							if (event == 'load') {
								accept(target);
							} else {
								reject(data.error);
							}
						};

					this.loadClip(name, assetMap[name])
						.on('load', completeAction)
						.on('error', completeAction);
				})
			);
		}
		return Promise.all(promises);
	} // loadClips

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
		if (this._notifications) {
console.log("AudioManager::invokeCurrentNotification: current id="+ this._notifications.id +" at "+ this._context.currentTime);
			this._notifications.invoke();
			this._notifications = this._notifications.next;
			this._currentNotification = this._currentNotificationNode = undefined;
			this.scheduleNextNotificationIfNeeded();
		} else
			console.warn("AudioManager::invokeCurrentNotification: no notifications to process");
	} // invokeCurrentNotification

	/**
	 * Schedules the next notification node to fire an event at it's specified time, if an earlier
	 * event isn't already scheduled.
	 */
	private scheduleNextNotificationIfNeeded(): void {
		if (!this._notifications) {
console.log("AudioManager::scheduleNextNotificationIfNeeded: nothing to schedule");
			return; // Nothing to schedule
		}

		let notification: AudioNotificationEntry = this._notifications;

		if (this._currentNotification) {
			if (this._currentNotification.when <= notification.when) {
console.log("AudioManager::scheduleNextNotificationIfNeeded: no need to reschedule");
				return; // No need to reschedule
			}

			this._currentNotification = undefined;
			if (this._currentNotificationNode)
				this._currentNotificationNode.stop();
		}

		// Start new notification
		this._currentNotificationNode = this._context.createBufferSource();
		this._currentNotificationNode.buffer = this._currentNotificationBuffer;
		this._currentNotificationNode.connect(this._context.destination);

		this._currentNotification = this._notifications;

let currentId: number = this._currentNotification.id;
		this._currentNotificationNode.addEventListener(
			'ended',
			() => {
				console.log(">> invoking notification "+ currentId +" at "+ this._context.currentTime);
				this.invokeCurrentNotification();
			}
		);

console.log("AudioManager::scheduleNextNotificationIfNeeded: starting at "+ this._context.currentTime);
		this._currentNotificationNode.start(
			notification.when <= this._context.currentTime + 0.002 ? undefined : notification.when
		);
	} // scheduleNextNotificationIfNeeded

	/**
	 * Specifies that a notification event containing the given data be fired at the specified time.
	 *
	 * @param	atTime	The time relative to the audio context's clock when the event should be
	 *					fired.  If this time is in the past, no action is taken.
	 * @param	data	Additional data to attach to the event object for the notification.
	 *					If a function, the function will be executed at the specified time, any
	 *					other type of value will trigger a 'notification' event to be fired with
	 *					the value assigned to the data property.
	 *
	 * @return	A value that can be used to unregister the notification at a later time, or 0 if
	 *			the notification was executed immediately or was specified to execute in the past.
	 */
	addNotification(atTime: number, data?: Object): number {
		let now: number = this._context.currentTime;
console.log("AudioManager::addNotification: atTime="+ atTime +" (now="+ now +")");
		if (atTime < now - 0.005) {
console.log("AudioManager::addNotification: atTime="+ atTime +": requested time expired", data);
			return 0;
		} else if (atTime <= now + 0.005) {
			if (typeof data === "function")
				data();
			else
				this.trigger('notification', data);

console.log("AudioManager::addNotification: atTime="+ atTime +": fired immediately", data);
			return 0;
		}

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

		this.scheduleNextNotificationIfNeeded();

console.log("AudioManager::addNotification: atTime="+ atTime +": registered id="+ notification.id, data);
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
			this._notifications = this._notifications.remove(notification);
			this.scheduleNextNotificationIfNeeded();
		}
	} // removeNotification

} // AudioManager
