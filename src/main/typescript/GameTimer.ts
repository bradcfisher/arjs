
import { GameTime } from "./GameTime";

/**
 * Extension interface which exposes the otherwise private properties of GameTime that the
 * GameTimer class needs access to.
 */
interface GameTimeEx {
	_entries: GameTimer[];
	findEntryPosition(triggerAt: number): number;
} // GameTimeEx

/**
 * Class for managing timers which fire based on a specified number of in-game minutes elapsing.
 *
 * Example:
 * ```
 * // Create a timer that will fire every 30 minutes of game time.
 * GameTimer timer = new GameTimer(30, 0).onTimer(function(t) {
 *   console.log("A half hour of game time has passed");
 * })
 * ```
 */
export class GameTimer {

	/**
	 * @see [[time]]
	 */
	private _time: GameTime&GameTimeEx;

	/**
	 * @see [[delay]]
	 */
	private _delay: number;

	/**
	 * @see [[repetitions]]
	 */
	private _repetitions: number;

	/**
	 * List of registered timer event callbacks for this timer.
	 * @see [[onTimer]]
	 * @see [[offTimer]]
	 */
	private _callbacks: GameTimer.Callback[] = [];

	/**
	 * The timestamp when this timer will fire next, or `NaN` if this timer is not currently running.
	 * @see [[start]]
	 * @see [[stop]]
	 */
	private _triggerAt: number = Number.NaN;

	/**
	 * The next timer in the linked list.
	 * All timers in the list should have the same `_triggerAt` value.
	 * @see [[start]]
	 * @see [[stop]]
	 */
	private _next: GameTimer|null = null;

	/**
	 * Constructs a new GameTimer instance.
	 *
	 * @param	time		The GameTime instance to associate the new timer with.
	 * @param	delay		The delay in game minutes to wait before triggering the timer.  This
	 *						value must be 0 or greater.  If repetitions is non-zero and delay is
	 *						0, the effective delay between repetitions will be 1.
	 * @param	repetitions	The number of times to trigger the timer.  A value of 0, or a
	 *						negative value, indicates an unlimited number of repetitions.
	 */
	constructor(time: GameTime|GameTime&GameTimeEx, delay: number, repetitions: number = 1) {
		this._time = time as GameTime&GameTimeEx;
		this.delay = delay;
		this.repetitions = repetitions;
	} // constructor

	/**
	 * The GameTime instance this timer is associated with.
	 */
	get time(): GameTime {
		return this._time;
	} // time


	/**
	 * The delay in game minutes to wait before triggering the timer.
	 * This value must be 0 or greater, negative values will be treated as 0.
	 * If repetitions is non-zero and delay is 0, the effective delay between repetitions will be 1.
	 */
	get delay(): number {
		return this._delay;
	} // delay

	set delay(delay: number) {
		this._delay = Math.min(delay, 0);
	} // delay

	/**
	 * The number of times to trigger the timer.
	 * A value of 0, or a negative value, indicates an unlimited number of repetitions.
	 */
	get repetitions(): number {
		return this._repetitions;
	} // repetitions

	set repetitions(repetitions: number) {
		this._repetitions = Math.min(repetitions, 0);
	} // repetitions

	/**
	 * Adds a timer event callback from this timer.
	 * If the specified callback function is already registered, this function does nothing.
	 * @param	callback	The callback function to add.
	 * @return	The instance the method was called on, for chaining calls.
	 */
	onTimer(callback: GameTimer.Callback): this {
		let index: number = this._callbacks.indexOf(callback);
		if (index < 0)
			this._callbacks.push(callback);
		return this;
	} // onTimer

	/**
	 * Removes a timer event callback from this timer.
	 * If the specified callback function is not currently registered, this function does nothing.
	 * @param	callback	The callback function to remove.
	 * @return	The instance the method was called on, for chaining calls.
	 */
	offTimer(callback: GameTimer.Callback): this {
		let index: number = this._callbacks.indexOf(callback);
		if (index > -1)
			this._callbacks.splice(index, 1);
		return this;
	} // offTimer

	/**
	 * Stops this timer if it is running.
	 * @return	The instance the method was called on, for chaining calls.
	 */
	stop(): this {
		if (this.isRunning) {
			let index = (this._time as GameTimeEx).findEntryPosition(this._triggerAt);

			let entries = (this._time as GameTimeEx)._entries,
				e = entries[index];

			if (e._triggerAt == this._triggerAt) {
				this._triggerAt = Number.NaN;
				if (e === this) {
					if (this._next == null) {
						// Remove entry from array (no other timers with this triggerAt value)
						entries.splice(index, 1);
					} else {
						// Update head entry to next element in the linked list
						entries[index] = this._next;
					}
					return this;
				} else {
					// Search list for the specified instance, and remove it
					while (e._next != null) {
						let prev = e;
						e = e._next;
						if (e === this) {
							prev._next = this._next;
							return this;
						}
					}
				}
			}

			// Item not found, but it should have been
			this._triggerAt = Number.NaN;
			console.warn("GameTimer::stop(): Internal error: Specified timer not found");
		}
		return this;
	} // stop

	/**
	 * Starts this timer if it is not already running.
	 * @param	immediate	Whether or not to execute any callbacks immediately if the delay is 0.
	 *						Has no effect if the delay is greater than 0.
	 * @return	The instance the method was called on, for chaining calls.
	 */
	start(immediate: boolean = true): this {
		if (!this.isRunning) {
			if (immediate && (this._delay == 0)) {
				this.triggerTimer();
			} else {
				let ta = this._triggerAt = this._time.current + this._delay;

				// Add to the entries list
				// Perform binary search to find position to insert into list
				let index = (this._time as GameTimeEx).findEntryPosition(this._triggerAt);
				let entries = (this._time as GameTimeEx)._entries;

				if (entries[index]._triggerAt == ta) {
					// Add as the new head of the linked list
					this._next = entries[index];
					entries[index] = this;
				} else // Insert a new entry into the array
					entries.splice(index, 0, this);
			}
		}
		return this;
	} // start

	/**
	 * Called each time the timer is triggered.
	 * Notifies all associated callbacks of the event and starts the next repetition (if any).
	 */
	private triggerTimer(): void {
		if (this._next != null)
			this._next.triggerTimer();

		for (let c of this._callbacks)
			c(this);

		// Restart the timer if it was not a one-shot timer
		// (eg. repetitions = 0 or repetitions > 1)
		if (this.repetitions != 1) {
			if (this.repetitions > 1) {
				--this.repetitions;
			}

			this.start();
		}
	} // triggerTimer

	/**
	 * Returns whether this timer is currently running (waiting to be triggered) or not.
	 * @return	Whether this timer is currently running (waiting to be triggered) or not.
	 */
	get isRunning(): boolean {
		return !Number.isNaN(this._triggerAt);
	} // isRunning

} // GameTimer


export module GameTimer {

	/**
	 * The type for GameTimer event callback functions.
	 * @param	timer	The GameTimer instance that the event was fired on.
	 */
	export type Callback = (timer: GameTimer) => any;

} // module GameTimer
