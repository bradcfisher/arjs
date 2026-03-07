import { Month, MonthConfig } from "./Month.js";
import { ClassRegistry } from "./Serializer.js";
import { Configurable } from "./Configurable.js";

/**
 * @interface
 */
export class GameDate {
	/**
	 * The 0-based year of the date.
	 * @readonly
	 * @type {number}
	 */
	year;

	/**
	 * The month of the date (name, 0-based number, or Calendar Month entry).
	 * @readonly
	 * @type {number | string | Month}
	 */
	month;

	/**
	 * The 1-based day of the month.
	 * @readonly
	 * @type {number}
	 */
	day;

	/**
	 * The hour of the day (0-23).
	 * @readonly
	 * @type {number}
	 */
	hour;

	/**
	 * The minute of the hour (0-59).
	 * @readonly
	 * @type {number}
	 */
	minute;
} // GameDate

/**
 * @interface
 */
export class NormalizedGameDate extends GameDate {
	/**
	 * The 0-based month number.
	 * @readonly
	 * @type {number}
	 */
	month;

	/**
	 * The Month structure from the Calendar.
	 * @readonly
	 * @type {Month}
	 */
	monthEntry;

	/**
	 * The timestamp (number of in-game minutes) that corresponds to this date.
	 * @readonly
	 * @type {number}
	 */
	current;
} // NormalizedGameDate


/**
 * Describes an in-game calendar.
 *
 * Essentially, a Calendar instance is a collection of the Month definitions that make up a year of
 * game time.
 *
 * @implements Configurable<ReadonlyArray<MonthConfig>>
 */
export class Calendar {

	/**
	 * The month definitions for the Calendar year.
	 * @readonly
	 * @type {Month[]}
	 */
	#months = [];

	/**
	 * The month definitions mapped by lower-cased name.
	 * @readonly
	 * @type {Map<string, Month>}
	 */
	#monthsByName = new Map();

	/**
	 * @type {number}
	 */
	#daysInYear = 0;

	/**
	 * Constructs a new Calendar from a JSON definition.
	 *
	 * ```typescript
	 * [
	 * 	{
	 *		... see Month.constructor ...
	 *	},
	 * ]
	 * ```
	 *
	 * @param {ReadonlyArray<MonthConfig>} monthConfigs The JSON definitons to use for configuring
	 *        each month of the new Calendar's year in the desired chronological order.
	 */
	constructor(monthConfigs) {
		if (monthConfigs != null) { // Should only be null when called from Deserializer
			this.configure(monthConfigs);
		}
	}

	/**
	 * Configures this object using the specified month configurations.
	 * @param {ReadonlyArray<MonthConfig>} monthConfigs
	 */
	configure(monthConfigs) {
		this.#months.length = 0;
		this.#monthsByName.clear();
		this.#daysInYear = 0;

		for (let o of monthConfigs) {
			const month = new Month(o, this.#daysInYear);
			this.#months.push(month);
			const name = month.name.toLowerCase();
			if (this.#monthsByName.hasOwnProperty(name))
				throw new Error("Duplicate month name '"+ month.name +"'");
			this.#monthsByName.set(name, month);
			this.#daysInYear += month.days;
		}

		if (this.#daysInYear == 0) {
			throw new Error("At least one month must be defined");
		}
	}

	/**
	 * Retrieves the configuration for this Calendar.
	 *
	 * @return {ReadonlyArray<MonthConfig>} A list of month configuration objects.
	 */
	get config() {
		return this.#months.map((month) => month.config);
	}

	/**
	 * The number of days in the year defined by this Calendar instance.
	 */
	get daysInYear() {
		return this.#daysInYear;
	}

	/**
	 * The number of months in the year defined by this Calendar instance.
	 */
	get numMonths() {
		return this.#months.length;
	}

	/**
	 * Retrieves the Month definition for the specified 0-based month index or by name.
	 * @param {number|string} indexOrName The index or name of the month to retrieve.
	 * @return {Month|undefined} The matching Month definition, or undefined if not found.
	 */
	getMonth(indexOrName) {
		const index = Number(indexOrName);
		return (Number.isNaN(index)
			? this.#monthsByName.get(String(indexOrName).toLowerCase())
			: this.#months[index]);
	}

	/**
	 * Computes the corresponding date from a timestamp value (in game minutes).
	 * @param {number} timestamp The timestamp to compute the date from.
	 * @return {NormalizedGameDate} The computed date.
	 */
	timestampToDate(timestamp) {
		let ts = timestamp;
		const minute = ts % 60;
		ts = Math.trunc(ts / 60); // Remove seconds

		const hour = ts % 24;
		ts = Math.trunc(ts / 24); // Remove hours

		const year = Math.trunc(ts / this.#daysInYear);
		ts = ts % this.#daysInYear;  // ts = Day of year

		let month = 0;
		let monthEntry = this.#months[0];
		for (let m of this.#months) {
			if (m.startDayOfYear + m.days > ts) {
				monthEntry = m;
				break;
			}
			++month;
		}

		const day = ts - monthEntry.startDayOfYear + 1;

		return {
			year: year,
			month: month,
			day: day,
			hour: hour,
			minute: minute,
			monthEntry: monthEntry,
			current: timestamp
		};
	}

	/**
	 * Computes a timestamp value (in game minutes) from the specified date.
	 * @param {GameDate} date The date to compute the timestamp from.
	 * @return {number} The computed timestamp value.
	 * @throws Error if the `date`'s month is not valid.
	 */
	dateToTimestamp(date) {
		const month =
			(date.month instanceof Month ? date.month : this.getMonth(date.month));
		if (month == null) {
			throw new Error("Invalid month: "+ date.month);
		}
		return (
				(date.year * this.#daysInYear + month.startDayOfYear + date.day - 1)
				* 24
				+ date.hour
			) * 60 + date.minute;
	}

	/**
	 * Normalizes the given date, ensuring all of the date parts are numeric and fall within their
	 * expected range.
	 *
	 * This method can be useful when performing date arithmetic (eg. adding days, months, years,
	 * etc) which may have caused the date properties to go outside their range.
	 *
	 * ```typescript
	 * // No change, all date properties already in range
	 * calendar.normalizeDate({ year: 0, month: 0, day: 1, hour: 0, minute: 0 });
	 *
	 * // Adjusts hour and minute properties
	 * // Result: { year: 0, month: 0, day: 1, hour: 2, minute: 5 }
	 * calendar.normalizeDate({ year: 0, month: 0, day: 1, hour: 0, minute: 125 });
	 * ```
	 *
	 * @param {GameDate} date The date to normalize.
	 *
	 * @return {NormalizedGameDate} The date object passed in, with the properties normalized.
	 * @throws Error if the date cannot be converted to a valid timestamp by {@link dateToTimestamp}.
	 */
	normalizeDate(date) {
		return this.timestampToDate(this.dateToTimestamp(date));
	}

	/**
	 * Converts a game date object to a string.
	 * @param {GameDate} date The date to convert to a string.
	 * @return {string} String version of the date (eg. "01:23 of day 12 in the month of
	 * 			Sowings in year 1 since abduction.")
	 * @throws Error if the `date` cannot be normalized.
	 */
	dateToString(date) {
		let normalizedDate = this.normalizeDate(date);

		// TODO: What should happen if the month is not in the range [0; numMonths[?  Should it mod the month value or throw an error?
		return (normalizedDate.hour < 10 ? '0' : '') + normalizedDate.hour +
			":"+ (normalizedDate.minute < 10 ? '0' : '') + normalizedDate.minute +
			" of day "+ normalizedDate.day +
			" in the month of "+ normalizedDate.monthEntry.name +
			" in year "+ normalizedDate.year +" since abduction.";
	}

}


/**
 * Static initializer for registering deserializer with private member access.
 */
(() => {
	ClassRegistry.registerClass(
		"Calendar", Calendar,
		(calendar, serializer) => {
			serializer.writeProp("months", calendar.config);
		},
		(calendar, data, deserializer) => {
			calendar.configure(deserializer.readProp(data, "months"));
		}
	);
})();