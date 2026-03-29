
import { Calendar, GameDate, NormalizedGameDate } from "./Calendar.js";
import { EventDispatcher, EventListener, EventDispatcherConfig } from "./EventDispatcher.js";
import { GameTimer, GameTimerConfig } from "./GameTimer.js";
import { Parse } from "./Parse.js";
import { MonthConfig, Month } from "./Month.js"
import { ClassRegistry } from "./Serializer.js";
import { Configurable } from "./Configurable.js";
/** @import { EventCallback } from "./EventDispatcher.js" */

/**
 * Configuration interface for delay between clock ticks/minutes (0 = time stands still).
 * @interface
 */
export class TickDelaysConfig {
	/**
	 * Rate when paused.
	 * Defaults to 0 if not provided, meaning time does not progress while paused.
	 * @readonly
	 * @type {number?}
	 */
	paused;

	/**
	 * Normal time rate.
	 * Defaults to 4000ms (1 game minute passes for every 4 real world seconds) if not provided.
	 * @readonly
	 * @type {number?}
	 */
	normal;

	/**
	 * Fast time rate, typically used while sleeping/working/etc.
	 * Defaults to 16ms.
	 * @readonly
	 * @type {number?}
	 */
	fast;
}

/**
 * Configuration interface for configuring time within the game.
 * @interface
 */
export class GameClockConfig extends EventDispatcherConfig {
	/**
	 * Game clock tick (minute) interval delays.
	 *
	 * If this property is not provided, the default tick delays as described for
	 * the TickDelaysConfig will be used.
	 * @readonly
	 * @type {TickDelaysConfig?}
	 */
	tickDelays;

	/**
	 * The current tick delay.
	 * If not specified, will default to "paused".
	 * @readonly
	 * @type {(number|"paused"|"normal"|"fast")?}
	 */
	tickDelay;

	/**
	 * The current time.
	 * If a number, the number of in-game minutes that have elapsed so far.
	 * @readonly
	 * @type {(GameDate|number)?}
	 */
	current;

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
	 *
	 * @readonly
	 * @type {ReadonlyArray<number|string>?}
	 */
	hourlyTemperatureAdjustment;

	/**
	 * The calendar months.
	 * @readonly
	 * @type {ReadonlyArray<MonthConfig>}
	 */
	months;

	/**
	 * Configurations of timers to associate with the clock.
	 * @readonly
	 * @type {ReadonlyArray<GameTimerConfig>?}
	 */
	timers;
}

/**
 * Configuration for game clock tick (minute) interval delays.
 */
export class TickDelays {

	/**
	 * @type {number}
	 */
	#paused = DefaultTickDelay.Paused;

	/**
	 * @type {number}
	 */
	#normal = DefaultTickDelay.Normal;

	/**
	 * @type {number}
	 */
	#fast = DefaultTickDelay.Fast;

	/**
	 * Constructs a new instance.
	 * @param {TickDelaysConfig?} config The configuration to inherit values from.
	 */
	constructor(config) {
		if (config != null) {
			if (config.paused != null) {
				this.#paused = Parse.num(config.paused);
			}

			if (config.normal != null) {
				this.#normal = Parse.num(config.normal);
			}

			if (config.fast != null) {
				this.#fast = Parse.num(config.fast);
			}
		}
	}

	/**
	 * Rate when paused.
	 * Defaults to 0 if not provided, meaning time does not progress while paused.
	 */
	get paused() {
		return this.#paused;
	}

	/**
	 * Normal time rate.
	 * Defaults to 4000ms (1 game minute passes for every 4 real world seconds) if not provided.
	 */
	get normal() {
		return this.#normal;
	}

	/**
	 * Fast time rate, typically used while sleeping/working/etc.
	 * Defaults to 16ms.
	 */
	get fast() {
		return this.#fast;
	}
}

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
 * GameTimer timer = clock.timer(30, 0).on("timer", function(event) {
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
 *
 * @implements {NormalizedGameDate}
 * @implements {Configurable<GameClockConfig>}
 */
export class GameClock
	extends EventDispatcher
{

	/**
	 * @type {number}
	 */
	#current = 0;

	/**
	 * @type {number}
	 */
	#year = 0;

	/**
	 * @type {number}
	 */
	#month = 1;

	/**
	 * @type {Month}
	 */
	#monthEntry;

	/**
	 * @type {number}
	 */
	#day = 1;

	/**
	 * @type {number}
	 */
	#hour = 0;

	/**
	 * @type {number}
	 */
	#minute = 0;

	/**
	 * @type {number}
	 */
	#lastTick = Number.NaN;

	/**
	 * @type {number}
	 */
	#tickDelay;

	/**
	 * List of currently scheduled timers, ordered by ascending trigger time.
	 *
	 * This is an internal property managed by the GameTimer class when a timer is added or
	 * removed from the clock.
	 *
	 * @readonly
	 * @type {GameTimer[]}
	 */
	_timers = [];

	/**
	 * @type {TickDelays}
	 */
	#tickDelays;

	/**
	 * @type {Calendar}
	 */
	#calendar;

	/**
	 * @type {number[]}
	 */
	#hourlyTemperatureAdjustment;

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	static #initializeClass_GameClock = (() => {
			ClassRegistry.registerClass(
				"GameClock", GameClock,
				(obj, serializer) => {
					serializer.writeProp(obj.config);
				},
				(obj, data, deserializer) => {
					obj.configure(deserializer.readProp(data));
				}
			);
		})();

	/**
	 * Constructs a new instance based on a configuration.
	 * @param {GameClockConfig?} config The clock configuration to inherit initial values from.
	 */
	constructor(config) {
		super();
		if (config != null) { // Should only be null when called from Deserialiser
			this.configure(config);
		}
	}

	/**
	 * Parses a tickDelay value.
	 * @param {string|number|undefined|null} value The value to parse.  Either a duration value, or "paused", "normal", "fast".
	 * @returns {number} The parsed value.
	 * @throws Error if the value cannot be parsed.
	 */
	#parseTickDelay(value) {
		if (typeof value !== "number") {
			switch (value) {
				case "normal":	return this.#tickDelays.normal;
				case "fast":	return this.#tickDelays.fast;
				case "paused":	return this.#tickDelays.paused;
			}
		}
		return Parse.duration(value, this.tickDelays.paused, "ms");
	}

	/**
	 *
	 * @param {GameClockConfig} config
	 */
	configure(config) {
		// Note that the _timers property will already be populated with the timers
		// at this point.  The Deserializer is depth-first, so the timers are deserialized
		// before the clock's configure method is called.

		//super.configure(config);

		this.#calendar = new Calendar(Parse.prop(config, ["months"], null, Parse.array));
		this.#tickDelays = new TickDelays(config.tickDelays);
		this.#tickDelay = this.#parseTickDelay(config.tickDelay);

		this.hourlyTemperatureAdjustment = Parse.array(
			config.hourlyTemperatureAdjustment,
			[],
			Parse.temperature
		);

		if (config.current != null)
			this.setCurrent(config.current);

		this.#lastTick = performance.now();
	}

	/**
	 * @type {GameClockConfig}
	 */
	get config() {
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
	 * The configured game Calendar.
	 */
	get calendar() {
		return this.#calendar;
	}


	/**
	 * The number of in-game minutes that have elapsed so far.
	 *
	 * Updating this property will throw an error if there are any active timers when the update occurs.
	 * Values less than zero will be clamped to 0.
	 */
	get current() {
		return this.#current;
	}

	set current(current) {
		if (this._timers.length > 0) {
			throw new Error("Unable to set current time when active timers exist");
		}

		this.#lastTick = performance.now();
		this.setCurrent(this.#calendar.timestampToDate(current));
	}

	/**
	 * Sets the current game time from a timestamp value.
	 *
	 * NOTE: Many time-based events will not fire when setting the current time in this way, such
	 *       as hourly or daily triggers.
	 *
	 * @overload
	 *
	 * @param {number} timestamp the new timestamp value to assign.
	 */
	/**
	 * Sets the current game time from a GameDate object.
	 *
	 * NOTE: Many time-based events will not fire when setting the current time in this way, such
	 *       as hourly or daily triggers.
	 *
	 * @overload
	 *
	 * @param {GameDate} date the date to calculate the new time from.  The new timestamp
	 * 				is calculated from the date using the clock's associated Calendar.
	 */
	/**
	 * Sets the current game time from a GameDate object or timestamp value.
	 *
	 * NOTE: Many time-based events will not fire when setting the current time in this way, such
	 *       as hourly or daily triggers.
	 *
	 * @overload
	 *
	 * @param {GameDate|number} dateOrTimestamp the date to calculate the new time from, or the timestamp
	 *        to assign.  When a GameDate is provided, the new timestamp is calculated
	 *        from the date using the clock's associated Calendar.
	 */
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
	 * @overload
	 *
	 * @param {number} year The new year value.
	 * @param {number} month The new month value.
	 * @param {number} day The new day of month.
	 * @param {number} hour The new hour.
	 * @param {number} minute The new minute.
	 */
	setCurrent(yearDateOrTimestamp, month, day, hour, minute) {
		/** @type {GameDate} */
		let date;
		const year = Number(yearDateOrTimestamp);
		if (!Number.isNaN(year)) {
			if (month === undefined && day === undefined && hour === undefined && minute === undefined) {
				date = this.#calendar.timestampToDate(yearDateOrTimestamp);
			} else {
				date = {
					year: yearDateOrTimestamp,
					month: (month === undefined ? 0 : month),
					day: (day === undefined ? 1 : day),
					hour: (hour === undefined ? 0 : hour),
					minute: (minute === undefined ? 0 : minute)
				};
			}
		} else {
			date = yearDateOrTimestamp;
		}

		const normalizedDate = this.#calendar.normalizeDate(date);

		this.#year = normalizedDate.year;
		this.#month = normalizedDate.month;
		this.#monthEntry = normalizedDate.monthEntry;
		this.#day = normalizedDate.day;
		this.#hour = normalizedDate.hour;
		this.#minute = normalizedDate.minute;
		this.#current = normalizedDate.current;
	}

	/**
	 * The current year in game time (0-based).
	 */
	get year() {
		return this.#year;
	}

	/**
	 * The current month in game time (0-based).
	 */
	get month() {
		return this.#month;
	}

	/**
	 * The current month month's Calendar entry object.
	 */
	get monthEntry() {
		return this.#monthEntry;
	}

	/**
	 * The current day in game time (1-based).
	 */
	get day() {
		return this.#day;
	}

	/**
	 * The current hour in game time (0 to 23).
	 */
	get hour() {
		return this.#hour;
	}

	/**
	 * The current minute in game time (0 to 59).
	 */
	get minute() {
		return this.#minute;
	} // minute

	/**
	 * The minute configuration values.
	 */
	get tickDelays() {
		return this.#tickDelays;
	}

	set tickDelay(delay) {
		if (this.#tickDelay <= 0) {
			this.#lastTick = performance.now();
		}
		this.#tickDelay = Math.max(delay, 0);
	}

	/**
	 * The real-world time for each minute in game time, in milliseconds.  A value of
	 * zero indicates that game time progression is currently disabled.
	 */
	get tickDelay() {
		return this.#tickDelay;
	}

	/**
	 * Retrieves the temperature adjustments applied for specific hours during the day.
	 *
	 * This table always has 24 entries in it, one for each hour of the day. If the provided value has
	 * fewer than 24 entries, additional entries will be created with a value of 0.  If there are more
	 * than 24 entries, the additional entries will be ignored.
	 *
	 * Each entry represents a delta value to add to the current outdoor temperature
	 * during the corresponding hour.  A positive value will increase the temperature,
	 * while a negative value will decrease it.
	 *
	 * The values in this list are specified in degrees F.
	 *
	 * @type {ReadonlyArray<number>}
	 */
	get hourlyTemperatureAdjustment() {
		return this.#hourlyTemperatureAdjustment;
	}

	set hourlyTemperatureAdjustment(value) {
		for (let temp of value) {
			if (Number.isNaN(temp)) {
				throw new Error("NaN is not a valid temperature adjustment value.");
			}
		}

		const v = value.slice();

		const len = v.length;
		if (len != 24) {
			v.length = 24;
			if (len < 24)
				v.fill(0, 24);
		}

		this.#hourlyTemperatureAdjustment = v;
	}

	/**
	 * Updates the in-game time based on the current `tickDelay` and the elapsed real time since the
	 * last call and processes any timers that expired.
	 *
	 * For example, if the `tickDelay` is set to `DefaultTickDelay.Normal`, and the first
	 * call to `update()` occurred at T=0, then:
	 * - If the next call to `update()` occurred at T+8.5seconds, the in-game time will be advanced by
	 *   two minutes.
	 * - If the next call to `update()` occurred at T1=T+2seconds, the in-game time will not be
	 *   advanced. However if `update()` is called again at T2=T1+2.3seconds (eg T+4.3seconds), the
	 *   in-game time will be advanced by one minute.
	 */
	update() {
		if (this.#tickDelay <= 0)
			return;

		let now = performance.now();
		let elapsed = now - this.#lastTick;

		while (elapsed > this.#tickDelay) {
			this.#handleTick();
			elapsed -= this.#tickDelay;
		}

		this.#lastTick = now - elapsed;
	}

	/**
	 * Updates the month entry based on the current value of the month property.
	 */
	#updateMonthEntry() {
		const month = this.#calendar.getMonth(this.#month);
		if (month == null) {
			throw new Error("Unable to determine month: "+ this.#month);
		}
		this.#monthEntry = month;
	}

	/**
	 * Increments the in-game time by one "minute" and processes timers that have expired.
	 */
	#handleTick() {
		++this.#current;

		++this.#minute;
		if (this.#minute == 60) {
			this.#minute = 0;
			++this.#hour;

			if (this.#hour == 24) {
				this.#hour = 0;
				++this.#day;

				if (this.#day > this.#monthEntry.days) {
					this.#day = 1;
					++this.#month;
					if (this.#month == this.#calendar.numMonths) {
						++this.#year;
						this.#month = 0;
						this.#updateMonthEntry();
						this.triggerEvent('yearRollover');
					} else {
						this.#updateMonthEntry();
					}

					this.triggerEvent('monthRollover');
				}

				this.triggerEvent('dayRollover');
			}

		this.triggerEvent('hourRollover');
		}

		this.triggerEvent('minuteRollover');

		// Process expired timers
		if (this._timers.length > 0) {
			/** @type {GameTimer} */
			let e;
			while ((e = this._timers[0]).triggerAt <= this.#current) {
				this._timers.pop();	// Remove from the list
				e._triggerTimer(); 			// (timer instances may be re-added when triggered if recurring)
			}
		}
	}

	/**
	 * The currently scheduled game timers.
	 */
	get timers() {
		return this._timers.slice();
	}

	/**
	 * Finds the position in the scheduled timers array where the specified entry should be inserted.
	 *
	 * This is an internal method called from the `GameTimer` class when a timer is added or removed from
	 * the clock.
	 *
	 * @param {number} entry The item to find the insertion position for.
	 * @return {number} The index in the timers array where the specified entry should be inserted.
	 */
	_findEntryPosition(triggerAt) {
		const entries = this._timers;
		let s = 0, e = entries.length, p = (s + e) >> 1;
		while (s != e) {
			let v = entries[p].triggerAt;
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
	 * @param {number} delay The number of in-game minutes before the timer expires.
	 * @param {(EventListener|function)?} listener The EventListener to invoke when the timer expires.
	 *
	 * @return {GameTimer} A new GameTimer instance.
	 */
	setTimeout(delay, listener) {
		return this.createTimer(delay, 1, listener);
	}

	/**
	 * Creates and starts an infinitely repeating interval timer.
	 *
	 * @param {number} delay The number of in-game minutes between each repetition.
	 * @param {(EventListener|function)?} listener The EventListener to invoke for each repetition.
	 *
	 * @return {GameTimer} A new GameTimer instance.
	 */
	setInterval(delay, listener) {
		return this.createTimer(delay, 0, listener);
	}

	/**
	 * Creates a new GameTimer instance, but doesn't start it.
	 *
	 * @param {number} delay The delay in game minutes to wait before triggering the timer.  This
	 *        value must be 0 or greater.  If repetitions is non-zero and delay is
	 *        0, the effective delay between repetitions will be 1.
	 * @param {number} repetitions The number of times to trigger the timer.  A value of 0, or a
	 *        negative value, indicates an unlimited number of repetitions.
	 * @param {(EventListener|EventCallback)?} listener The EventListener to invoke for each repetition.
	 *
	 * @return {GameTimer} A new GameTimer instance.
	 */
	createTimer(delay, repetitions = 1, listener) {
		const timer = new GameTimer(this, delay, repetitions);
		if (listener != null)
			timer.on('timer', listener).start(false);
		return timer;
	}

}


/**
 * Enumeration of "standard" mappings of real-time (milliseconds) to game-time (minutes).
 */
export const DefaultTickDelay = Object.freeze({
	/**
	 * Value used to prevent the progress of in-game time.
	 */
	Paused: 0,

	/**
	 * Real-world milliseconds per normal in-game minute.
	 */
	Normal: 4000,

	/**
	 * Real-world milliseconds per in-game minute when working, sleeping or learning a spell.
	 */
	Fast: 16
}); // MinuteDelay
