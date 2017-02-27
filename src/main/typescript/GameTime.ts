
import { Calendar } from "./Calendar";
import { GameDate } from "./GameDate";
import { GameTimer } from "./GameTimer";

/**
 * Extension interface which exposes the otherwise private properties of GameTimer that the
 * GameTime class needs access to.
 */
interface GameTimerEx {
	_next: GameTimer;
	_triggerAt: number;
	triggerTimer(): void;
} // GameTimerEx

/**
 * Class for managing the current game time.
 *
 * Example:
 * ```typescript
 * // Load a calendar and create a GameTime instance based on it
 * GameMonths months = new Months(require("months.json"));
 * GameTime time = new GameTime(months);
 *
 * // Set the current game time to 12:00 Day 1 of Month 6, Year 0 since Abduction 
 * time.setCurrent(0, 6, 1, 12, 0);
 *
 * // Create a timer that will fire every 30 minutes of game time.
 * GameTimer timer = time.timer(30, 0).onTimer(function(t) {
 *   console.log("A half hour of game time has passed");
 * });
 * ```
 */
export class GameTime {

	/**
	 * The total number of in-game minutes that have elapsed so far.
	 */
	private _current: number = 0;

	/**
	 * The current number of complete in-game years that have elapsed.
	 */
	private _year: number = 0;

	/**
	 * The current 0-based month number [0 to number of months - 1].
	 */
	private _month: number = 0;

	/**
	 * The current day of the month [1 to number of days in month].
	 */
	private _day: number = 1;

	/**
	 * The current hour [0 to 23].
	 */
	private _hour: number = 0;

	/**
	 * The current minute [0 to 59].
	 */
	private _minute: number = 0;

	/**
	 * Timestamp (in real-time) when the last game time update occurred.
	 */
	private _lastTick: number;

	/**
	 * @see [[GameTime.tickDelay]]
	 */
	private _tickDelay: number = GameTime.MinuteDelay.Normal;

	/**
	 * Internal list of active GameTimer instances, sorted by their trigger time.
	 */
	private _entries: (GameTimer|GameTimer&GameTimerEx)[] = [];

	private _calendar: Calendar;

	constructor(calendar: Calendar) {
		this._calendar = calendar;
		this._lastTick = Date.now();
	} // constructor 

	/**
	 * Retrieves the number of in-game minutes that have elapsed so far.
	 * @return	The number of in-game minutes that have elapsed so far.
	 */
	get current(): number {
		return this._current;
	} // current

	/**
	 * Sets the number of in-game minutes that have elapsed so far.
	 * This method will throw an error if there are any active timers when it is called.
	 *
	 * @param	current	The new number of elapsed in-game minutes.  If less than zero, will be
	 *					set to 0.
	 */
	set current(current: number) {
		if (this._entries.length > 0)
			throw new Error("Unable to set current time when active timers exist");

		this._lastTick = Date.now();
		this.setCurrent(this._calendar.timestampToDate(current));
	} // current

	/**
	 * Sets the current game time.
	 *
	 * ```typescript
	 * // Set the current game time to 12:00 Day 1 of Month 6, Year 0 since Abduction 
	 * gameTime.setCurrent(0, 6, 1, 12, 0);
	 * ```
	 *
	 * NOTE: Many time-based events will not fire when setting the current time in this way, such
	 *       as hourly or daily triggers.
	 *
	 * @param	year	The new year value.
	 * @param	month	The new month value.
	 * @param	day		The new day of month.
	 * @param	hour	The new hour.
	 * @param	minute	The new minute.
	 */
	setCurrent(yearOrDate: GameDate): void;
	setCurrent(yearOrDate: number, month: number, day: number, hour: number, minute: number): void;
	setCurrent(yearOrDate: number|GameDate, month?: number, day?: number, hour?: number, minute?: number): void {
		let date: GameDate;
		if (yearOrDate instanceof Number) {
			date = {
				year: yearOrDate as number,
				month: (month === undefined ? 0 : month),
				day: (day === undefined ? 1 : day),
				hour: (hour === undefined ? 0 : hour),
				minute: (minute === undefined ? 0 : minute)
			};
		} else {
			date = yearOrDate as GameDate;
		}

		date = this._calendar.normalizeDate(date);

		this._year = date.year;
		this._month = date.month as number;
		this._day = date.day;
		this._hour = date.hour;
		this._minute = date.minute;
		this._current = this._calendar.dateToTimestamp(date);
	} // setCurrent

	/**
	 * Retrieves the current year in game time (0-based).
	 * @return	The current year in game time (0-based).
	 */
	get year(): number {
		return this._year;
	} // year

	/**
	 * Retrieves the current month in game time (0-based).
	 * @return	The current month in game time (0-based).
	 */
	get month(): number {
		return this._month;
	} // month

	/**
	 * Retrieves the current day in game time (1-based).
	 * @return	The current day in game time (1-based).
	 */
	get day(): number {
		return this._day;
	} // day

	/**
	 * Retrieves the current hour in game time (0 to 23).
	 * @return	The current hour in game time (0 to 23).
	 */
	get hour(): number {
		return this._hour;
	} // hour

	/**
	 * Retrieves the current minute in game time (0 to 59).
	 * @return	The current minute in game time (0 to 59).
	 */
	get minute(): number {
		return this._minute;
	} // minute

	/**
	 * Sets the real-world time for each minute in game time.
	 * @param	delay	The real-world time for each minute in game time, in milliseconds.
	 */
	set tickDelay(delay: number) {
		if (this._tickDelay <= 0)
			this._lastTick = Date.now();
		this._tickDelay = Math.max(delay, 0);
	} // tickDelay

	/**
	 * Retrieves the real-world time for each minute in game time.
	 * @return	The real-world time for each minute in game time, in milliseconds.
	 */
	get tickDelay(): number {
		return this._tickDelay;
	} // tickDelay

	/**
	 * Updates the in-game time based on the current `tickDelay` and the elapsed real time since the
	 * last call and processes any timers that expired.
	 *
	 * For example, if the `tickDelay` is set to [[GameTime.MinuteDelay.Normal]], and the first
	 * call to `update()` occurred at T=0, then:
	 * - If the next call to `update()` occurred at T+8.5seconds, the in-game time will be advanced by
	 *   two minutes.
	 * - If the next call to `update()` occurred at T1=T+2seconds, the in-game time will not be
	 *   advanced. However if `update()` is called again at T2=T1+2.3seconds (eg T+4.3seconds), the
	 *   in-game time will be advanced by one minute.
	 */
	update(): void {
		if (this._tickDelay <= 0)
			return;

		let now = Date.now();
		let elapsed = now - this._lastTick;

		while (elapsed > this._tickDelay) {
			this.handleTick();
			elapsed -= this._tickDelay;
		}

		this._lastTick = now - elapsed;
	} // update

	/**
	 * Increments the in-game time by one "minute" and processes timers that have expired.
	 */
	private handleTick(): void {
		++this._current;

		++this._minute;
		if (this._minute == 60) {
			this._minute = 0;
			++this._hour;

			if (this._hour == 24) {
				++this._day;

				if (this._day > this._calendar.getMonth(this._month).days) {
					this._day = 1;
					++this._month;

					// Year
					if (this._month == this._calendar.numMonths) {
						this._month = 0;
						++this._year;
// TODO: Trigger yearly tasks
					}

// TODO: Trigger monthly tasks
				}

// TODO: Trigger daily tasks
			}

// TODO: Trigger hourly tasks
		}

		// Process expired timers
		if (this._entries.length > 0) {
			let e: GameTimerEx;
			while ((e = (this._entries[0] as GameTimerEx))._triggerAt <= this._current) {
				this._entries.pop();	// Remove from the list
				e.triggerTimer(); 			// (timer instances may be re-added when triggered if recurring)
			}
		}
	} // handleTick

	/**
	 * Finds the index in the entries array where the specified entry should be inserted.
	 * @param	entry The item to find the insertion position for.
	 * @return	The index in the entries array where the specified entry should be inserted.
	 */
	private findEntryPosition(triggerAt: number): number {
		let entries = this._entries;
		let s = 0, e = entries.length, p = (s + e) >> 1;
		while (s != e) {
			let v: number = (entries[p] as GameTimerEx)._triggerAt;
			if (v < triggerAt) {
				s = p + 1;
			} else if (v > triggerAt) {
				e = p;
			} else {
				break;
			}
			p = (s + e) >> 1;
		} // while
		return p;
	} // findEntryPosition

	/**
	 * Creates and starts a one-shot timer.
	 *
	 * @param	callback	The callback function to invoke when the timer expires.
	 * @param	delay		The number of in-game minutes before the timer expires.
	 *
	 * @return	A new GameTimer instance.
	 */
	setTimeout(callback: GameTimer.Callback, delay: number): GameTimer {
		return new GameTimer(this, delay).onTimer(callback).start(false);
	} // setTimeout

	/**
	 * Creates and starts an infinitely repeating interval timer.
	 *
	 * @param	callback	The callback function to invoke for each repetition.
	 * @param	delay		The number of in-game minutes between each repetition.
	 *
	 * @return	A new GameTimer instance.
	 */
	setInterval(callback: GameTimer.Callback, delay: number): GameTimer {
		return new GameTimer(this, delay, 0).onTimer(callback).start(false);
	} // setInterval

	/**
	 * Creates a new GameTimer instance, but doesn't start it.
	 *
	 * @param	delay		The delay in game minutes to wait before triggering the timer.  This
	 *						value must be 0 or greater.  If repetitions is non-zero and delay is
	 *						0, the effective delay between repetitions will be 1.
	 * @param	repetitions	The number of times to trigger the timer.  A value of 0, or a
	 *						negative value, indicates an unlimited number of repetitions.
	 *
	 * @return	A new GameTimer instance.
	 */
	createTimer(delay: number, repetitions: number = 1): GameTimer {
		return new GameTimer(this, delay, repetitions);
	} // timer

} // GameTime


export module GameTime {

	/**
	 * Enumeration of "standard" mappings of real-time (milliseconds) to game-time (minutes).
	 */
	export enum MinuteDelay {
		/**
		 * Value used to prevent the progress of in-game time.
		 */
		Pause = 0,

		/**
		 * Real-world milliseconds per normal in-game minute.
		 */
		Normal = 4000,

		/**
		 * Real-world milliseconds per in-game minute when working, sleeping or learning a spell.
		 */
		Fast = 16
	} // MinuteDelay

} // module GameTime
