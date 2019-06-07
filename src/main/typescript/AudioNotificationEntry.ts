
export interface AudioNotification {
	/**
	 * Retrieves the unique ID assigned to this notification.
	 * @return	The unique ID assigned to this notification.
	 */
	readonly id: number;

	/**
	 * Retrieves the time when this notification should be invoked.
	 * @return	The time when this notification should be invoked.
	 */
	readonly when: number;

	/**
	 * Retrieves the data associated with this notification.
	 * @return	The data associated with this notification.
	 */
	readonly data: any;

	/**
	 * Retrieves the callback invoked when this notification's time is reached.
	 * @return	The callback invoked when this notification's time is reached.
	 */
	readonly callback: AudioNotification.Callback;
} // AudioNotification


/**
 * Class representing a Notification entry linked list.
 */
export class AudioNotificationEntry
	implements AudioNotification
{

	/**
	 * ID allocated to the last AudioNotificationEntry created.
	 * Defines a monotonically increasing sequence of IDs.
	 */
	private static _lastId: number = 0;

	/**
	 * @see [[id]]
	 */
	private _id: number;

	/**
	 * @see [[when]]
	 */
	private _when: number;

	/**
	 * @see [[callback]]
	 */
	private _callback: AudioNotification.Callback;

	/**
	 * @see [[data]]
	 */
	private _data: any;

	/**
	 * @see [[next]]
	 */
	private _next: AudioNotificationEntry|undefined;

	/**
	 * Constructs a new AudioNotificationEntry.
	 * @param	when		The time when this notification should be invoked.
	 * @param	callback	The function to invoke for the notification.
	 */
	constructor(when: number, callback: AudioNotification.Callback, data?: any) {
		this._id = ++AudioNotificationEntry._lastId;
		this._when = when;
		this._data = data;
		this._callback = callback;
	} // constructor

	/**
	 * Retrieves the unique ID assigned to this notification.
	 * @return	The unique ID assigned to this notification.
	 */
	get id(): number {
		return this._id;
	} // id

	/**
	 * Retrieves the time when this notification should be invoked.
	 * @return	The time when this notification should be invoked.
	 */
	get when(): number {
		return this._when;
	} // when

	/**
	 * Retrieves the data associated with this notification.
	 * @return	The data associated with this notification.
	 */
	get data(): any {
		return this._data;
	} // data

	/**
	 * Retrieves the callback invoked when this notification's time is reached.
	 * @return	The callback invoked when this notification's time is reached.
	 */
	get callback(): AudioNotification.Callback {
		return this._callback;
	} // callback

	/**
	 * Retrieves the next entry in the linked list after this one.
	 * @return	The next entry in the linked list after this one.
	 */
	get next(): AudioNotificationEntry|undefined {
		return this._next;
	} // next

	/**
	 * Inserts a new AudioNotificationEntry into the linked list rooted at this node.
	 * Entries are maintained in sorted ascending order by their `when` property.
	 * @param	entry	The new entry to add to the list.
	 * @return	The new root node of the linked list.
	 */
	insert(entry: AudioNotificationEntry): AudioNotificationEntry {
		if (entry._when < this._when) {
			entry._next = this;
			return entry;
		}

		let last: AudioNotificationEntry = this;
		let cur: AudioNotificationEntry|undefined = this._next;

		while (cur && entry._when >= cur._when) {
			last = cur;
			cur = cur._next;
		}

		entry._next = cur;
		last._next = entry;
		return this;
	} // insert

	/**
	 * Removes the entry with the given ID from the linked list rooted at this node.
	 * @param	id	The ID of the entry to remove from the list.
	 * @return	The new root node of the linked list.
	 */
	remove(id: number): AudioNotificationEntry|undefined {
		if (this._id == id)
			return this._next;

		let last: AudioNotificationEntry = this;
		let cur: AudioNotificationEntry|undefined = this._next;

		while (cur) {
			if (cur._id == id) {
				last._next = cur._next;
				cur._next = undefined;
				break;
			}

			last = cur;
			cur = cur._next;
		}

		return this;
	} // remove

	/**
	 * Retrieves the next entry from the list that should trigger on or after the specified time.
	 * @param	when	The time to retrieve the next entry for.
	 * @return	The next entry that should trigger on or after the specified time, or undefined if
	 *			no such entry exists.
	 */
	nextOccurring(when: number): AudioNotificationEntry|undefined {
		let entry: AudioNotificationEntry|undefined = this;
		while (entry) {
			if (entry.when >= when)
				return entry;
			entry = entry._next;
		}
	} // nextOccurring

	/**
	 * Invokes the associated callback function, passing this notification as the first parameter.
	 */
	invoke() {
		this._callback(this);
	} // invoke

} // AudioNotificationEntry


export module AudioNotification {

	/**
	 * Callback invoked for an [[AudioNotificationEntry]].
	 *
	 * @param	notification	The AudioNotificationEntry node the callback is being invoked for.
	 */
	export type Callback = (notification: AudioNotification) => void;

} // AudioNotification
