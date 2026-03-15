

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
	 * @type {(notification: AudioNotification) => void}
	 */
	#callback;

	/**
	 * Constructs a new AudioNotificationEntry.
	 * @param {number} when The time when this notification should be invoked.
	 * @param {(notification: AudioNotification) => void} callback The function to invoke for the notification.
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

	/**
	 * Inserts a new AudioNotificationEntry into the linked list rooted at this node.
	 * Entries are maintained in sorted ascending order by their `when` property.
	 * @param {AudioNotificationEntry} entry The new entry to add to the list.
	 * @return {AudioNotificationEntry} The new root node of the linked list.
	 * /
	insert(entry) {
		if (entry.#when < this.#when) {
			entry.#next = this;
			return entry;
		}

		/** @type AudioNotificationEntry * /
		let last = this;
		let cur = this.#next;

		while (cur && entry.#when >= cur.#when) {
			last = cur;
			cur = cur.#next;
		}

		entry.#next = cur;
		last.#next = entry;
		return this;
	} // insert

	/**
	 * Removes the entry with the given ID from the linked list rooted at this node.
	 * @param {number} id The ID of the entry to remove from the list.
	 * @return {AudioNotificationEntry|undefined} The new root node of the linked list.
	 * /
	remove(id) {
		if (this.#id == id)
			return this.#next;

		/** @type AudioNotificationEntry * /
		let last = this;
		let cur = this.#next;

		while (cur) {
			if (cur.#id == id) {
				last.#next = cur.#next;
				cur.#next = undefined;
				break;
			}

			last = cur;
			cur = cur.#next;
		}

		return this;
	} // remove

	/**
	 * Retrieves the next entry from the list that should trigger on or after the specified time.
	 * @param {number} when The time to retrieve the next entry for.
	 * @return {AudioNotificationEntry|undefined} The next entry that should trigger on or after
	 *         the specified time, or undefined if no such entry exists.
	 * /
	nextOccurring(when) {
		/** @type AudioNotificationEntry|undefined * /
		let entry = this;
		while (entry) {
			if (entry.when >= when)
				return entry;
			entry = entry.#next;
		}
	} // nextOccurring

	/**
	 * Invokes the associated callback function, passing this notification as the first parameter.
	 * /
	invoke() {
		this.#callback(this);
	} // invoke
	 */

}
