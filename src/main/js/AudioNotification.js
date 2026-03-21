/** @import { ActiveAudio } from "./AudioManager.js" */

export class AudioNotificationOptions {
	/**
	 * The time when the notification should be invoked.
	 * @readonly
	 * @type {number}
	 */
	when;

	/**
	 * Additional data associated with the notification.
	 * The value of this property will be provided to the callback function.
	 */
	data;

	/**
	 * The callback invoked when the notification's time is reached.
	 *
	 * The `activeAudio` parameter will be assigned for notifications associated with an audio
	 * clip and undefined for notifications scheduled directly on the AudioManager.
	 *
	 * @readonly
	 * @type {(activeAudio: ActiveAudio?, data: any) => void}
	 */
	callback;
}

/**
 * Class representing an audio notification.
 */
export class AudioNotification {

	/**
	 * ID allocated to the last AudioNotification created.
	 * Defines a monotonically increasing sequence of IDs.
	 * @type {number}
	 */
	static #lastId = 0;

	/**
	 * @type {number}
	 */
	#id;

	/**
	 * @type {number}
	 */
	#when;

	#data;

	/**
	 * @type {(activeAudio: ActiveAudio?) => void}
	 */
	#callback;

	/**
	 * Constructs a new AudioNotification.
	 * @param {number} when The time when this notification should be invoked, in seconds relative to the
	 *        clip's timeline.
	 * @param {(activeAudio: ActiveAudio?, data: any) => void} callback The function to invoke for the
	 *        notification. The `activeAudio` parameter will be assigned for notifications
	 *        associated with an audio clip and undefined for notifications scheduled directly
	 *        on the AudioManager.
	 * @param {any} data additional data to provide to the callback when it is invoked.
	 */
	constructor(when, callback, data) {
		this.#id = ++AudioNotification.#lastId;
		this.#when = when;
		this.#callback = callback;
		this.#data = data;
	}

	/**
	 * The unique ID assigned to this notification.
	 */
	get id() {
		return this.#id;
	}

	/**
	 * The time when this notification should be invoked, in seconds relative to the clip's timeline.
	 */
	get when() {
		return this.#when;
	}

	/**
	 * Additional data to provide to the callback when it is invoked.
	 */
	get data() {
		return this.#data;
	}

	/**
	 * The callback invoked when this notification's time is reached.
	 */
	get callback() {
		return this.#callback;
	}

}

