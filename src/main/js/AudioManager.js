
import { EventDispatcher } from "./EventDispatcher.js";
import { AudioNotificationEntry, AudioNotification } from "./AudioNotificationEntry.js";
import { AudioClip } from "./AudioClip.js";

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
	 * @see loadClip
	 * @see loadClips
	 * @see getClip
	 * @type {{ [name:string]: AudioClip }}
	 */
	#clips;

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

		this.#clips = {};
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
	 *
	 * @param {AudioClip} clip
	 */
	registerClip(clip) {
		if (clip.manager !== this)
			throw new Error("Only clips created under this AudioManager can be registered");

		if (this.#clips[clip.name])
			throw new Error("A clip named '"+ name +"' has already been defined");

		this.#clips[clip.name] = clip;
	} // registerClip

	/**
	 * Returns a Promise which resolves to a new AudioClip with the specified name
	 * and audio data.
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
		return new Promise((accept, reject) => {
			this.#context.decodeAudioData(audioData).then(
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
	 * @param {string} name The name the desired audio clip was registered under.
	 * @return {AudioClip} The audio clip registered with the provided name.
	 */
	getClip(name) {
		return this.#clips[name];
	} // getClip

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
	 * Stops/unschedules current notification if one is scheduled.
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
	 * @param {any} data Additional data to associate with the triggered notification.
	 * @param {((notification: AudioNotification) => void)?} callback The callabck to invoke when the
	 *        notification time is reached.  If no callback is specified, will trigger a "notification"
	 *        event instead.
	 *
	 * @return {number} A value that can be used to unregister the notification at a later time, or 0 if
	 *         the notification was executed immediately or was specified to execute in the past.
	 */
	addNotification(when, data, callback) {
		if (!callback) {
			callback = (notification) => {
				this.trigger('notification', notification);
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

} // AudioManager
