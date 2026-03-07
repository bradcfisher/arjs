
/**
 * @interface
 */
export class AudioNotification {
	/**
	 * The unique ID assigned to this notification.
	 * @readonly
	 * @type {number}
	 */
	id;

	/**
	 * The time when this notification should be invoked.
	 * @readonly
	 * @type {number}
	 */
	when;

	/**
	 * The data associated with this notification.
	 * @readonly
	 * @type {any}
	 */
	data;

	/**
	 * The callback invoked when this notification's time is reached.
	 * @readonly
	 * @type {(notification: AudioNotification) => void}
	 */
	callback;
} // AudioNotification


/**
 * Class representing a Notification entry linked list.
 * @implements {AudioNotification}
 */
export class AudioNotificationEntry {

	/**
	 * ID allocated to the last AudioNotificationEntry created.
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
	 * @type {any}
	 */
	#data;

	/**
	 * @type {AudioNotificationEntry|undefined}
	 */
	#next;

	/**
	 * Constructs a new AudioNotificationEntry.
	 * @param {number} when The time when this notification should be invoked.
	 * @param {(notification: AudioNotification) => void} callback The function to invoke for the notification.
	 * @param {*} data
	 */
	constructor(when, callback, data) {
		this.#id = ++AudioNotificationEntry.#lastId;
		this._when = when;
		this._data = data;
		this.#callback = callback;
	} // constructor

	/**
	 * The unique ID assigned to this notification.
	 */
	get id() {
		return this.#id;
	} // id

	/**
	 * The time when this notification should be invoked.
	 */
	get when() {
		return this.#when;
	} // when

	/**
	 * The data associated with this notification.
	 */
	get data() {
		return this.#data;
	} // data

	/**
	 * The callback invoked when this notification's time is reached.
	 */
	get callback() {
		return this.#callback;
	} // callback

	/**
	 * The next entry in the linked list after this one.
	 */
	get next() {
		return this.#next;
	} // next

	/**
	 * Inserts a new AudioNotificationEntry into the linked list rooted at this node.
	 * Entries are maintained in sorted ascending order by their `when` property.
	 * @param {AudioNotificationEntry} entry The new entry to add to the list.
	 * @return {AudioNotificationEntry} The new root node of the linked list.
	 */
	insert(entry) {
		if (entry.#when < this.#when) {
			entry.#next = this;
			return entry;
		}

		/** @type AudioNotificationEntry */
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
	 */
	remove(id) {
		if (this.#id == id)
			return this.#next;

		/** @type AudioNotificationEntry */
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
	 */
	nextOccurring(when) {
		/** @type AudioNotificationEntry|undefined */
		let entry = this;
		while (entry) {
			if (entry.when >= when)
				return entry;
			entry = entry.#next;
		}
	} // nextOccurring

	/**
	 * Invokes the associated callback function, passing this notification as the first parameter.
	 */
	invoke() {
		this.#callback(this);
	} // invoke

} // AudioNotificationEntry
