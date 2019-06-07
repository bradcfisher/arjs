import { Month, MonthConfig } from "./Month";
import { ClassRegistry, Serializer, Deserializer } from "./Serializer";
import { Configurable } from "./Configurable";

export interface GameDate {
	/**
	 * The 0-based year of the date.
	 */
	readonly year: number;

	/**
	 * The month of the date (name, 0-based number, or Calendar Month entry).
	 */
	readonly month: number|string|Month;

	/**
	 * The 1-based day of the month.
	 */
	readonly day: number;

	/**
	 * The hour of the day (0-23).
	 */
	readonly hour: number;

	/**
	 * The minute of the hour (0-59).
	 */
	readonly minute: number;
} // GameDate

export interface NormalizedGameDate extends GameDate {
	/**
	 * The 0-based month number.
	 */
	readonly month: number;

	/**
	 * The Month structure from the Calendar.
	 */
	readonly monthEntry: Month;

	/**
	 * The timestamp (number of in-game minutes) that corresponds to this date.
	 */
	readonly current: number;
} // NormalizedGameDate


/**
 * Describes an in-game calendar.
 *
 * Essentially, a Calendar instance is a collection of the Month definitions that make up a year of
 * game time.
 */
export class Calendar
	implements Configurable<ReadonlyArray<MonthConfig>>
{

	/**
	 * The month definitions for the Calendar year.
	 */
	private readonly _months: Month[] = [];

	/**
	 * The month definitions mapped by lower-cased name.
	 */
	private readonly _monthsByName: Map<string, Month> = new Map();

	/**
	 * @see [[daysInYear]]
	 */
	private _daysInYear: number = 0;

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	private static _initializeClass_Calendar: void = (() => {
		ClassRegistry.registerClass(
			"Calendar", Calendar,
			(calendar: Calendar, serializer: Serializer): void => {
				serializer.writeProp("months", calendar.config);
			},
			(calendar: Calendar, data: any, deserializer: Deserializer): void => {
				calendar.configure(deserializer.readProp(data, "months") as ReadonlyArray<MonthConfig>);
			}
		);
	})();

	/**
	 * Constructs a new Calendar from a JSON definition.
	 *
	 * @param	monthConfigs	The JSON definitons to use for configuring each month of the new
	 *							Calendar's year in the desired chronological order.
	 * ```typescript
	 * [
	 * 	{
	 *		... see [[Month.constructor]]...
	 *	},
	 * ]
	 * ```
	 */
	constructor(monthConfigs: ReadonlyArray<MonthConfig>) {
		if (monthConfigs != null) // Should only be numm when called from Deserializer
			this.configure(monthConfigs);
	}

	/**
	 * Configures this object using the specified month configurations.
	 * @param monthConfigs
	 */
	configure(monthConfigs: ReadonlyArray<MonthConfig>): void {
		this._months.length = 0;
		this._monthsByName.clear();
		this._daysInYear = 0;

		for (let o of monthConfigs) {
			let month: Month = new Month(o, this._daysInYear);
			this._months.push(month);
			let name: string = month.name.toLowerCase();
			if (this._monthsByName.hasOwnProperty(name))
				throw new Error("Duplicate month name '"+ month.name +"'");
			this._monthsByName.set(name, month);
			this._daysInYear += month.days;
		}

		if (this._daysInYear == 0)
			throw new Error("At least one month must be defined");
	}

	/**
	 * Retrieves the configuration for this Calendar.
	 * @return A list of month configuration objects.
	 */
	get config(): ReadonlyArray<MonthConfig> {
		return this._months.map((month) => month.config);
	}

	/**
	 * Retrieves the number of days in the year defined by this Calendar instance.
	 * @return	The number of days in the year defined by this Calendar instance.
	 */
	get daysInYear(): number {
		return this._daysInYear;
	}

	/**
	 * Retrieves the number of months in the year defined by this Calendar instance.
	 * @return	The number of months in the year defined by this Calendar instance.
	 */
	get numMonths(): number {
		return this._months.length;
	}

	/**
	 * Retrieves the Month definition for the specified 0-based month index or by name.
	 * @param	indexOrName	The index or name of the month to retrieve.
	 * @return	The matching Month definition, or undefined if not found.
	 */
	getMonth(indexOrName: number|string): Month|undefined {
		let index: number = Number(indexOrName);
		return (Number.isNaN(index)
			? this._monthsByName.get(String(indexOrName).toLowerCase())
			: this._months[index]);
	}

	/**
	 * Computes the corresponding date from a timestamp value (in game minutes).
	 * @param	timestamp	The timestamp to compute the date from.
	 * @return	The computed date.
	 */
	timestampToDate(timestamp :number): NormalizedGameDate {
		let ts: number = timestamp;
		let minute: number = ts % 60;
		ts = Math.trunc(ts / 60); // Remove seconds

		let hour: number = ts % 24;
		ts = Math.trunc(ts / 24); // Remove hours

		let year: number = Math.trunc(ts / this._daysInYear);
		ts = ts % this._daysInYear;  // ts = Day of year

		let month: number = 0;
		let monthEntry: Month = this._months[0];
		for (let m of this._months) {
			if (m.startDayOfYear + m.days > ts) {
				monthEntry = m;
				break;
			}
			++month;
		}

		let day: number = ts - monthEntry.startDayOfYear + 1;

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
	 * @param	date	The date to compute the timestamp from.
	 * @return	The computed timestamp value.
	 * @throws 	Error if the `date`'s month is not valid.
	 */
	dateToTimestamp(date: GameDate): number {
		let month: Month|undefined =
			(date.month instanceof Month ? date.month : this.getMonth(date.month));
		if (month == null) {
			throw new Error("Invalid month: "+ date.month);
		}
		return (
				(date.year * this._daysInYear + month.startDayOfYear + date.day - 1)
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
	 * @param	date	The date to normalize.
	 *
	 * @return	The date object passed in, with the properties normalized.
	 * @throws	Error if the date cannot be converted to a valid timestamp by [[dateToTimestamp]].
	 */
	normalizeDate(date: GameDate): NormalizedGameDate {
		return this.timestampToDate(this.dateToTimestamp(date));
	}

	/**
	 * Converts a game date object to a string.
	 * @param	date	The date to convert to a string.
	 * @return	String version of the date (eg. "01:23 of day 12 in the month of
	 * 			Sowings in year 1 since abduction.")
	 * @throws Error if the `date` cannot be normalized.
	 */
	dateToString(date: GameDate): string {
		let normalizedDate = this.normalizeDate(date);

		// TODO: What should happen if the month is not in the range [0; numMonths[?  Should it mod the month value or throw an error?
		return (normalizedDate.hour < 10 ? '0' : '') + normalizedDate.hour +
			":"+ (normalizedDate.minute < 10 ? '0' : '') + normalizedDate.minute +
			" of day "+ normalizedDate.day +
			" in the month of "+ normalizedDate.monthEntry.name +
			" in year "+ normalizedDate.year +" since abduction.";
	}

}
