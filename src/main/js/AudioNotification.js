

export class AudioNotificationOptions {
	/**
	 * The time when the notification should be invoked.
	 * @readonly
	 * @type {number}
	 */
	when;

	/**
	 * The callback invoked when the notification's time is reached.
	 * @readonly
	 * @type {() => void}
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

	/**
	 * @type {() => void}
	 */
	#callback;

	/**
	 * Constructs a new AudioNotificationEntry.
	 * @param {number} when The time when this notification should be invoked.
	 * @param {() => void} callback The function to invoke for the notification.
	 */
	constructor(when, callback) {
		this.#id = ++AudioNotification.#lastId;
		this.#when = when;
		this.#callback = callback;
	}

	/**
	 * The unique ID assigned to this notification.
	 */
	get id() {
		return this.#id;
	}

	/**
	 * The time when this notification should be invoked.
	 */
	get when() {
		return this.#when;
	}

	/**
	 * The callback invoked when this notification's time is reached.
	 */
	get callback() {
		return this.#callback;
	}

}

