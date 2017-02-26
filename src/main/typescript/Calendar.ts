import { Month } from "./Month";
import { GameDate } from "./GameDate";

/**
 * Describes an in-game calendar.
 *
 * Essentially, a Calendar instance is a collection of the Month definitions that make up a year of
 * game time.
 */
export class Calendar {

	/**
	 * The month definitions for the Calendar year.
	 */
	private _months: Month[];

	/**
	 * @see [[daysInYear]]
	 */
	private _daysInYear: number;

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
	constructor(monthConfigs: Object[]) {
		this._months = [];
		this._daysInYear = 0;

		for (let o of monthConfigs) {
			let month: Month = new Month(o, this._daysInYear);
			this._months.push(month);
			this._daysInYear += month.days;
		}

		if (this._daysInYear == 0)
			throw new Error("At least one month must be defined");
	} // constructor

	/**
	 * Retrieves the number of days in the year defined by this Calendar instance.
	 * @return	The number of days in the year defined by this Calendar instance.
	 */
	get daysInYear(): number {
		return this._daysInYear;
	} // daysInYear

	/**
	 * Retrieves the number of months in the year defined by this Calendar instance.
	 * @return	The number of months in the year defined by this Calendar instance.
	 */
	get numMonths(): number {
		return this._months.length;
	} // numMonths

	/**
	 * Retrieves the Month definition for the specified 0-based month index.
	 * @param	num	The index of the month to retrieve.
	 * @return	The Month definition for the specified 0-based month index.
	 */
	getMonth(num: number): Month {
		return this._months[num];
	} // getMonth

	/**
	 * Computes the corresponding date from a timestamp value (in game minutes).
	 * @param	timestamp	The tiemstamp to compute the date from.
	 * @return	The computed date.
	 */
	dateFromTimestamp(timestamp :number): GameDate {
		let minute: number = timestamp % 60;
		timestamp = Math.trunc(timestamp / 60);

		let hour: number = timestamp % 24;
		timestamp = Math.trunc(timestamp / 24);

		let year: number = timestamp % this._daysInYear;
		timestamp = Math.trunc(timestamp / this._daysInYear);

		let month: number = 0;
		for (let m of this._months) { 
			if (m.startDayOfYear + m.days >= timestamp) {
				break;
			}
			++month;
		}

		let day: number = timestamp - this._months[month].startDayOfYear + 1;

		return {
			year: year,
			month: month,
			day: day,
			hour: hour,
			minute: minute
		};
	} // dateFromTimestamp

	/**
	 * Computes a timestamp value (in game minutes) from the specified date.
	 * @param	date	The date to compute the timestamp from.
	 * @return	The computed timestamp value.
	 */
	timestampFromDate(date: GameDate): number {
		return (
				(date.year * this._daysInYear + this._months[date.month].startDayOfYear + date.day - 1)
				* 24
				+ date.hour
			) * 60 + date.minute;
	} // timestampFromDate

	/**
	 * Normalizes the given date, ensuring all of the date parts fall within their expected range.
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
	 */
	normalizeDate(date: GameDate): GameDate {
		return this.dateFromTimestamp(this.timestampFromDate(date));
	} // normalizeDate

} // Calendar
