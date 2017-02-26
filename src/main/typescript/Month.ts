
import { Parse } from "./Parse"

/**
 * Class representing a month of the game year.
 */
export class Month {

	/**
	 * @see [[name]]
	 */
	private _name: string;

	/**
	 * @see [[startDayOfYear]]
	 */
	private _startDayOfYear: number;

	/**
	 * @see [[days]]
	 */
	private _days: number;

	/**
	 * @see [[minTemperature]]
	 */
	private _minTemperature: number;

	/**
	 * @see [[maxTemperature]]
	 */
	private _maxTemperature: number;

	/**
	 * Constructs a new Month instance.
	 *
	 * @param	config	Object containing the properties to assign to the new instance.
	 * ```typescript
	 *	{
	 *		"name": "Rebirth",
	 *		"days": 31,
	 *		"temperature": { "min": "0F", "max": "20F" },
	 *		"weather": {
	 *			"duration": { "min": "1D", "max": "5D" },
	 *			"types": [
	 *				{ "type": "sun-0", "weight": 1 },
	 *				{ "type": "sun-1", "weight": 2 },
	 *				{ "type": "sun-2", "weight": 2 },
	 *				{ "type": "precipitation-0", "weight": 1 },
	 *				{ "type": "precipitation-1", "weight": 2 },
	 *				{ "type": "precipitation-2", "weight": 2 },
	 *				{ "type": "storm-0", "weight": 1 },
	 *				{ "type": "storm-1", "weight": 2 },
	 *				{ "type": "storm-2", "weight": 3 }
	 *			]
	 *		}
	 *	}
	 * ```
	 *
	 * @param	startDayOfYear	The zero-based day of the year corresponding to the first day of
	 *							the month.
	 */
	constructor(config: Object, startDayOfYear: number) {
		this._startDayOfYear = startDayOfYear;

		this.setName(Parse.str(Parse.getProp(config, "name")));
		this.setDays(Parse.num(Parse.getProp(config, "days"), 31));
		this.setMinTemperature(Parse.temperature(Parse.getProp(config, "temperature", "min"), 60));
		this.setMaxTemperature(Parse.temperature(Parse.getProp(config, "temperature", "max"), 80));
	} // constructor

	get name(): string {
		return this._name;
	} // name

	private setName(name: string) {
		if (name == '')
			throw new Error("'name' cannot be empty string");
		this._name = name;
	} // setName

	get startDayOfYear(): number {
		return this._startDayOfYear;
	} // startDayOfYear

	get days(): number {
		return this._days;
	} // days

	private setDays(days: number) {
		if ((days < 1) || Number.isNaN(days))
			throw new Error("'days' must be 1 or greater");
		this._days = days;
	} // setDays

	get minutesInMonth(): number {
		return this._days * Parse.MINUTES_IN_DAY;
	} // minutesInMonth()

	get minTemperature(): number {
		return this._minTemperature;
	} // minTemperature

	private setMinTemperature(minTemperature: number) {
		if (Number.isNaN(minTemperature))
			throw new Error("'minTemperature' cannot be NaN");
		this._minTemperature = minTemperature;
	} // setMinTemperature

	get maxTemperature(): number {
		return this._maxTemperature;
	} // maxTemperature

	private setMaxTemperature(maxTemperature: number) {
		if (Number.isNaN(maxTemperature))
			throw new Error("'maxTemperature' cannot be NaN");
		this._maxTemperature = maxTemperature;
	} // setMaxTemperature

} // Month


export module Month {

	export class Weather {
		private _minDuration: number = Parse.MINUTES_IN_DAY;		// 1 day
		private _maxDuration: number = Parse.MINUTES_IN_DAY * 3;	// 3 days
		//private _types: Month.Weather.Type[];

		/**
		 * Constructs a new Weather instance.
		 *
		 * @param	config	Object containing the properties to assign to the new instance.
		 * ```typescript
		 *	{
		 *		"duration": { "min": "1D", "max": "5D" },
		 *		"types": [
		 *			{ "type": "sun-0", "weight": 1 },
		 *			{ "type": "sun-1", "weight": 2 },
		 *			{ "type": "sun-2", "weight": 2 },
		 *			{ "type": "precipitation-0", "weight": 1 },
		 *			{ "type": "precipitation-1", "weight": 2 },
		 *			{ "type": "precipitation-2", "weight": 2 },
		 *			{ "type": "storm-0", "weight": 1 },
		 *			{ "type": "storm-1", "weight": 2 },
		 *			{ "type": "storm-2", "weight": 3 }
		 *		]
		 *	}
		 * ```
		 */
		constructor(config: Object) {
			let minDuration = Parse.duration(Parse.getProp(config, "duration", "min"), "1D");
			let maxDuration = Parse.duration(Parse.getProp(config, "duration", "min"), "3D");

			if (minDuration > maxDuration) {
				this.setMinDuration(maxDuration);
				this.setMaxDuration(minDuration);
			} else {
				this.setMinDuration(minDuration);
				this.setMaxDuration(maxDuration);
			}

			// TODO: parse types...
		} // constructor

		get minDuration(): number {
			return this._minDuration;
		} // minDuration

		private setMinDuration(minDuration: number) {
			if (Number.isNaN(minDuration))
				throw new Error("'minDuration' cannot be NaN");

			this._minDuration = minDuration;
		} // setMinDuration

		get maxDuration(): number {
			return this._maxDuration;
		} // maxDuration

		private setMaxDuration(maxDuration: number) {
			if (Number.isNaN(maxDuration))
				throw new Error("'maxDuration' cannot be NaN");

			this._maxDuration = maxDuration;
		} // setMaxDuration
	} // Weather

} // Month
