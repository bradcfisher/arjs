
import { Calendar, NormalizedGameDate } from "./Calendar";
import { EventDispatcher, EventListener, EventDispatcherConfig } from "./EventDispatcher";
import { GameDate } from "./Calendar";
import { GameTimer, GameTimerConfig } from "./GameTimer";
import { Parse } from "./Parse";
import { MonthConfig, Month } from "./Month"
import { ClassRegistry, Serializer, Deserializer } from "./Serializer";
import { Configurable } from "./Configurable";

/**
 * Configuration interface for delay between clock ticks/minutes (0 = time stands still).
 */
export interface TickDelaysConfig {
	/**
	 * Rate when paused.
	 * Defaults to 0 if not provided, meaning time does not progress while paused.
	 */
	readonly paused?: number,

	/**
	 * Normal time rate.
	 * Defaults to 4000ms (1 game minute passes for every 4 real world seconds) if not provided.
	 */
	readonly normal?: number,

	/**
	 * Fast time rate, typically used while sleeping/working/etc.
	 * Defaults to 16ms.
	 */
	readonly fast?: number
}

/**
 * Configuration interface for configuring time within the game.
 */
export interface GameClockConfig extends EventDispatcherConfig {
	/**
	 * Game clock tick (minute) interval delays.
	 *
	 * If this property is not provided, the default tick delays as described for
	 * the TickDelaysConfig will be used.
	 */
	readonly tickDelays?: TickDelaysConfig;

	/**
	 * The current tick delay.
	 * If not specified, will default to "paused".
	 */
	readonly tickDelay?: number|"paused"|"normal"|"fast";

	/**
	 * The current time.
	 * If a number, the number of in-game minutes that have elapsed so far.
	 */
	readonly current?: GameDate|number;

	/**
	 * Temperature adjustments applied for specific hours during the day.
	 *
	 * This table should have 24 entries in it, one for each hour of the day.
	 * Each entry represents a delta value to add to the current outdoor temperature
	 * during the corresponding hour.  A positive value will increase the temperature,
	 * while a negative value will decrease it.
	 *
	 * If an entry is a number, it is treated as a value in degrees F.  If a string,
	 * you may provide units of F or C (e.g. "24C" or "75.2F").
	 *
	 * If this property is not provided, no hourly temperature adjustments will be
	 * applied.
	 */
	readonly hourlyTemperatureAdjustment?: ReadonlyArray<number|string>;

	/**
	 * The calendar months.
	 */
	readonly months: ReadonlyArray<MonthConfig>;

	/**
	 * Timers associated with the clock.
	 */
	readonly timers: ReadonlyArray<GameTimerConfig>;
}

/**
 * Configuration for game clock tick (minute) interval delays.
 */
export class TickDelays {

	/**
	 * @see [[paused]]
	 */
	private _paused: number = GameClock.DefaultTickDelay.Paused;

	/**
	 * @see [[normal]]
	 */
	private _normal: number = GameClock.DefaultTickDelay.Normal;

	/**
	 * @see [[fast]]
	 */
	private _fast: number = GameClock.DefaultTickDelay.Fast;

	/**
	 * Constructs a new instance.
	 * @param config The configuration to inherit values from.
	 */
	constructor(config?: TickDelaysConfig|null) {
		if (config != null) {
			if (config.paused != null)
				this._paused = Parse.num(config.paused);

			if (config.normal != null)
				this._normal = Parse.num(config.normal);

			if (config.fast != null)
				this._fast = Parse.num(config.fast);
		}
	}

	/**
	 * Rate when paused.
	 * Defaults to 0 if not provided, meaning time does not progress while paused.
	 */
	get paused(): number {
		return this._paused;
	}

	/**
	 * Normal time rate.
	 * Defaults to 4000ms (1 game minute passes for every 4 real world seconds) if not provided.
	 */
	get normal(): number {
		return this._normal;
	}

	/**
	 * Fast time rate, typically used while sleeping/working/etc.
	 * Defaults to 16ms.
	 */
	get fast(): number {
		return this._fast;
	}
}

/**
 * Extension interface which exposes the otherwise private properties of GameTimer that the
 * GameClock class needs access to.
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
 * // Load a calendar and create a GameClock instance based on it
 * GameMonths months = new Months(require("months.json"));
 * GameClock clock = new GameClock({ "months": months });
 *
 * // Set the current game time to 12:00 Day 1 of Month 6, Year 0 since Abduction
 * clock.setCurrent(0, 6, 1, 12, 0);
 *
 * // Create a timer that will fire every 30 minutes of game time.
 * GameTimer timer = clock.timer(30, 0).onTimer(function(t) {
 *   console.log("A half hour of game time has passed");
 * });
 * ```
 *
 * Events:
 * @event	yearRollover	Fired when the in-game year changes.
 * @event	monthRollover	Fired when the in-game month changes.
 * @event	dayRollover		Fired when the in-game day changes.
 * @event	hourRollover	Fired when the in-game hour changes.
 * @event	minuteRollover	Fired when the in-game minute changes.
 */
export class GameClock
	extends EventDispatcher
	implements NormalizedGameDate, Configurable<GameClockConfig>
{

	/**
	 * @see [[GameClock.current]]
	 */
	private _current: number = 0;

	/**
	 * @see [[GameClock.year]]
	 */
	private _year: number = 0;

	/**
	 * @see [[GameClock.month]]
	 */
	private _month: number = 1;

	/**
	 * @see [[GameClock.monthEntry]]
	 */
	private _monthEntry!: Month;

	/**
	 * @see [[GameClock.day]]
	 */
	private _day: number = 1;

	/**
	 * @see [[GameClock.hour]]
	 */
	private _hour: number = 0;

	/**
	 * @see [[GameClock.minute]]
	 */
	private _minute: number = 0;

	/**
	 * @see [[GameClock.lastTick]]
	 */
	private _lastTick: number = Number.NaN;

	/**
	 * @see [[GameClock.tickDelay]]
	 */
	private _tickDelay!: number;

	/**
	 * @see [[GameClock.timers]]
	 */
	private readonly _timers: (GameTimer|GameTimer&GameTimerEx)[] = [];

	/**
	 * @see [[GameClock.tickDelays]]
	 */
	private _tickDelays!: TickDelays;

	/**
	 * @see [[GameClock.calendar]]
	 */
	private _calendar!: Calendar;

	/**
	 * @see [[GameClock.hourlyTemperatureAdjustment]]
	 */
	private _hourlyTemperatureAdjustment!: number[];

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	private static _initializeClass_GameClock: void = (() => {
			ClassRegistry.registerClass(
				"GameClock", GameClock,
				(obj: GameClock, serializer: Serializer): void => {
					serializer.writeProp(obj.config);
				},
				(obj: GameClock, data: any, deserializer: Deserializer): void => {
					obj.configure(deserializer.readProp(data) as GameClockConfig);
				}
			);
		})();

	/**
	 * Constructs a new instance based on a configuration.
	 * @param config The clock configuration to inherit initial values from.
	 */
	constructor(config?: GameClockConfig) {
		super();
		if (config != null) // Should only be null when called from Deserialiser
			this.configure(config);
	}

	/**
	 * Parses a tickDelay value.
	 * @param value The value to parse.  Either a duration value, or "paused", "normal", "fast".
	 * @returns The parsed value.
	 * @throws Error if the value cannot be parsed.
	 */
	private parseTickDelay(value: string|number|undefined|null): number {
		if (typeof value !== "number") {
			switch (value) {
				case "normal":	return this._tickDelays.normal;
				case "fast":	return this._tickDelays.fast;
				case "paused":	return this._tickDelays.paused;
			}
		}
		return Parse.duration(value, this.tickDelays.paused, "ms");
	}

	configure(config: GameClockConfig): void {
		// Note that the _timers property will already be populated with the timers
		// at this point.  The Deserializer is depth-first, so the timers are deserialized
		// before the clock's configure method is called.

		super.configure(config);

		this._calendar = new Calendar(Parse.array(config.months));
		this._tickDelays = new TickDelays(config.tickDelays);
		this._tickDelay = this.parseTickDelay(config.tickDelay);

		this.hourlyTemperatureAdjustment = Parse.array(
			config.hourlyTemperatureAdjustment,
			[],
			Parse.temperature
		);

		if (config.current != null)
			this.setCurrent(config.current);

		this._lastTick = performance.now();
	}

	get config(): GameClockConfig {
		let current = Object.assign(this.calendar.timestampToDate(this.current));
		delete current.monthEntry;

		return Object.assign(
			super.config,
			{
				tickDelays: {
					paused: this.tickDelays.paused,
					normal: this.tickDelays.normal,
					fast: this.tickDelays.fast
				},
				tickDelay: this.tickDelay,
				current: current,
				hourlyTemperatureAdjustment: this.hourlyTemperatureAdjustment,
				months: this.calendar.config,
				timers: this.timers.map((timer) => timer.config)
			}
		);
	}

	/**
	 * Retrieves the configured game Calendar.
	 * @return The configured game Calendar.
	 */
	get calendar(): Calendar {
		return this._calendar;
	}


	/**
	 * Retrieves the number of in-game minutes that have elapsed so far.
	 * @return	The number of in-game minutes that have elapsed so far.
	 */
	get current(): number {
		return this._current;
	}

	/**
	 * Sets the number of in-game minutes that have elapsed so far.
	 * This method will throw an error if there are any active timers when it is called.
	 *
	 * @param	current	The new number of elapsed in-game minutes.  If less than zero, will be
	 *					set to 0.
	 * @throws Error if there are any active timers.
	 */
	set current(current: number) {
		if (this._timers.length > 0)
			throw new Error("Unable to set current time when active timers exist");

		this._lastTick = performance.now();
		this.setCurrent(this._calendar.timestampToDate(current));
	}

	/**
	 * Sets the current game time from a timestamp value.
	 *
	 * NOTE: Many time-based events will not fire when setting the current time in this way, such
	 *       as hourly or daily triggers.
	 *
	 * @param	timestamp the new timestamp value to assign.
	 */
	setCurrent(timestamp: number): void;

	/**
	 * Sets the current game time from a GameDate object.
	 *
	 * NOTE: Many time-based events will not fire when setting the current time in this way, such
	 *       as hourly or daily triggers.
	 *
	 * @param	dateOrTimestamp the date to calculate the new time from.  The new timestamp
	 * 				is calculated from the date using the clock's associated Calendar.
	 */
	setCurrent(date: GameDate): void;

	/**
	 * Sets the current game time from a GameDate object or timestamp value.
	 *
	 * NOTE: Many time-based events will not fire when setting the current time in this way, such
	 *       as hourly or daily triggers.
	 *
	 * @param	dateOrTimestamp the date to calculate the new time from, or the timestamp
	 * 				to assign.  When a GameDate is provided, the new timestamp is calculated
	 * 				from the date using the clock's associated Calendar.
	 */
	setCurrent(dateOrTimestamp: GameDate|number): void;

	/**
	 * Sets the current game time.
	 *
	 * The new timestamp is calculated from the parameters using the clock's associated Calendar.
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
	setCurrent(year: number, month: number, day: number, hour: number, minute: number): void;

	setCurrent(yearDateOrTimestamp: number|GameDate, month?: number, day?: number, hour?: number, minute?: number): void {
		let date: GameDate;
		let year: number = Number(yearDateOrTimestamp);
		if (!Number.isNaN(year)) {
			if (month === undefined && day === undefined && hour === undefined && minute === undefined) {
				date = this._calendar.timestampToDate(yearDateOrTimestamp as number);
			} else {
				date = {
					year: yearDateOrTimestamp as number,
					month: (month === undefined ? 0 : month),
					day: (day === undefined ? 1 : day),
					hour: (hour === undefined ? 0 : hour),
					minute: (minute === undefined ? 0 : minute)
				};
			}
		} else {
			date = yearDateOrTimestamp as GameDate;
		}

		let normalizedDate: NormalizedGameDate = this._calendar.normalizeDate(date);

		this._year = normalizedDate.year;
		this._month = normalizedDate.month as number;
		this._monthEntry = normalizedDate.monthEntry;
		this._day = normalizedDate.day;
		this._hour = normalizedDate.hour;
		this._minute = normalizedDate.minute;
		this._current = normalizedDate.current;
	}

	/**
	 * Retrieves the current year in game time (0-based).
	 * @return	The current year in game time (0-based).
	 */
	get year(): number {
		return this._year;
	}

	/**
	 * Retrieves the current month in game time (0-based).
	 * @return	The current month in game time (0-based).
	 */
	get month(): number {
		return this._month;
	}

	/**
	 * Retrieves the current month month's Calendar entry object.
	 * @return	The current month month's Calendar entry object.
	 */
	get monthEntry(): Month {
		return this._monthEntry;
	}

	/**
	 * Retrieves the current day in game time (1-based).
	 * @return	The current day in game time (1-based).
	 */
	get day(): number {
		return this._day;
	}

	/**
	 * Retrieves the current hour in game time (0 to 23).
	 * @return	The current hour in game time (0 to 23).
	 */
	get hour(): number {
		return this._hour;
	}

	/**
	 * Retrieves the current minute in game time (0 to 59).
	 * @return	The current minute in game time (0 to 59).
	 */
	get minute(): number {
		return this._minute;
	} // minute

	/**
	 * Retrieves the minute configuration values.
	 * @return The minute configuration values.
	 * @see [[TickDelays]]
	 */
	get tickDelays(): TickDelays {
		return this._tickDelays;
	}

	/**
	 * Sets the real-world time for each minute in game time.
	 * @param	delay	The real-world time for each minute in game time, in milliseconds.
	 *					A value of zero indicates that game time progression is currently
	 					disabled.
	 */
	set tickDelay(delay: number) {
		if (this._tickDelay <= 0)
			this._lastTick = performance.now();
		this._tickDelay = Math.max(delay, 0);
	}

	/**
	 * Retrieves the real-world time for each minute in game time.
	 * @return	The real-world time for each minute in game time, in milliseconds.  A value of
	 * 		zero indicates that game time progression is currently disabled.
	 */
	get tickDelay(): number {
		return this._tickDelay;
	}

	/**
	 * Retrieves the temperature adjustments applied for specific hours during the day.
	 *
	 * This table always has 24 entries in it, one for each hour of the day.
	 * Each entry represents a delta value to add to the current outdoor temperature
	 * during the corresponding hour.  A positive value will increase the temperature,
	 * while a negative value will decrease it.
	 *
	 * The values in this list are specified in degrees F.
	 *
	 * @return The temperature adjustments applied for specific hours during the day.
	 */
	get hourlyTemperatureAdjustment(): ReadonlyArray<number> {
		return this._hourlyTemperatureAdjustment;
	}

	/**
	 * Sets the temperature adjustments applied for specific hours during the day.
	 *
	 * This table should have 24 entries in it, one for each hour of the day.
	 * If the provided value has fewer than 24 entries, additional entries will be created
	 * with a value of 0.  If there are more than 24 entries, the additional entries will
	 * be ignored.
	 *
	 * Each entry represents a delta value to add to the current outdoor temperature
	 * during the corresponding hour.  A positive value will increase the temperature,
	 * while a negative value will decrease it.
	 *
	 * The values in this list are specified in degrees F.
	 *
	 * @param value The new list of temperature adjustments.
	 */
	set hourlyTemperatureAdjustment(value: ReadonlyArray<number>) {
		for (let temp of value)
			if (Number.isNaN(temp))
				throw new Error("NaN is not a valid temperature adjustment value.");

		let v: number[] = value.slice();

		let len: number = v.length;
		if (len != 24) {
			v.length = 24;
			if (len < 24)
				v.fill(0, 24);
		}

		this._hourlyTemperatureAdjustment = v;
	}

	/**
	 * Updates the in-game time based on the current `tickDelay` and the elapsed real time since the
	 * last call and processes any timers that expired.
	 *
	 * For example, if the `tickDelay` is set to [[GameClock.DefaultTickDelay.Normal]], and the first
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

		let now = performance.now();
		let elapsed = now - this._lastTick;

		while (elapsed > this._tickDelay) {
			this.handleTick();
			elapsed -= this._tickDelay;
		}

		this._lastTick = now - elapsed;
	}

	/**
	 * Updates the month entry based on the current value of the month property.
	 */
	private updateMonthEntry(): void {
		let month: Month|undefined = this._calendar.getMonth(this._month);
		if (month == null) {
			throw new Error("Unable to determine month: "+ this._month);
		}
		this._monthEntry = month;
	}

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
				this._hour = 0;
				++this._day;

				if (this._day > this._monthEntry.days) {
					this._day = 1;
					++this._month;
					if (this._month == this._calendar.numMonths) {
						++this._year;
						this._month = 0;
						this.updateMonthEntry();
						this.trigger('yearRollover');
					} else
						this.updateMonthEntry();

					this.trigger('monthRollover');
				}

				this.trigger('dayRollover');
			}

			this.trigger('hourRollover');
		}

		this.trigger('minuteRollover');

		// Process expired timers
		if (this._timers.length > 0) {
			let e: GameTimerEx;
			while ((e = (this._timers[0] as GameTimerEx))._triggerAt <= this._current) {
				this._timers.pop();	// Remove from the list
				e.triggerTimer(); 			// (timer instances may be re-added when triggered if recurring)
			}
		}
	}

	/**
	 * Retrieve the currently scheduled game timers.
	 * @return A list of the currently scheduled game timers.
	 */
	get timers(): GameTimer[] {
		return this._timers.slice();
	}

	/**
	 * Finds the index in the entries array where the specified entry should be inserted.
	 *
	 * This method is called from the `GameTimer` class when a new
	 *
	 * @param	entry The item to find the insertion position for.
	 * @return	The index in the entries array where the specified entry should be inserted.
	 */
	private findEntryPosition(triggerAt: number): number {
		let entries = this._timers;
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
	}

	/**
	 * Creates and starts a one-shot timer.
	 *
	 * @param	delay		The number of in-game minutes before the timer expires.
	 * @param	listener	The EventListener to invoke when the timer expires.
	 *
	 * @return	A new GameTimer instance.
	 */
	setTimeout(delay: number, listener?: EventListener): GameTimer {
		return this.createTimer(delay, 1, listener);
	}

	/**
	 * Creates and starts an infinitely repeating interval timer.
	 *
	 * @param	delay		The number of in-game minutes between each repetition.
	 * @param	listener	The EventListener to invoke for each repetition.
	 *
	 * @return	A new GameTimer instance.
	 */
	setInterval(delay: number, listener?: EventListener): GameTimer {
		return this.createTimer(delay, 0, listener);
	}

	/**
	 * Creates a new GameTimer instance, but doesn't start it.
	 *
	 * @param	delay		The delay in game minutes to wait before triggering the timer.  This
	 *						value must be 0 or greater.  If repetitions is non-zero and delay is
	 *						0, the effective delay between repetitions will be 1.
	 * @param	repetitions	The number of times to trigger the timer.  A value of 0, or a
	 *						negative value, indicates an unlimited number of repetitions.
	 * @param	listener	The EventListener to invoke for each repetition.
	 *
	 * @return	A new GameTimer instance.
	 */
	createTimer(delay: number, repetitions: number = 1, listener?: EventListener): GameTimer {
		let timer: GameTimer = new GameTimer(this, delay, repetitions);
		if (listener != null)
			timer.on('timer', listener).start(false);
		return timer;
	}

}


export module GameClock {

	/**
	 * Enumeration of "standard" mappings of real-time (milliseconds) to game-time (minutes).
	 */
	export enum DefaultTickDelay {
		/**
		 * Value used to prevent the progress of in-game time.
		 */
		Paused = 0,

		/**
		 * Real-world milliseconds per normal in-game minute.
		 */
		Normal = 4000,

		/**
		 * Real-world milliseconds per in-game minute when working, sleeping or learning a spell.
		 */
		Fast = 16
	} // MinuteDelay

}
