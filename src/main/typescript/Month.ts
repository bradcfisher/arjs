
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
	 * @see [[weather]]
	 */
	private _weather: Month.Weather;

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

		this.setName(Parse.str(Parse.getProp(config, undefined, "name")));
		this.setDays(Parse.num(Parse.getProp(config, 31, "days")));
		this.setMinTemperature(Parse.temperature(Parse.getProp(config, 60, "temperature", "min")));
		this.setMaxTemperature(Parse.temperature(Parse.getProp(config, 80, "temperature", "max")));
		this._weather = new Month.Weather(Parse.getProp(config, null, "weather"));
	} // constructor

	/**
	 * Retrieves the name for this month.
	 * @return	The name for this month.
	 */
	get name(): string {
		return this._name;
	} // name

	/**
	 * Sets the name for this month.
	 * @param	name	The new name for the month.  Cannot be empty.
	 */
	private setName(name: string): void {
		if (name == '')
			throw new Error("'name' cannot be empty string");
		this._name = name;
	} // setName

	/**
	 * Retrieves the 0-based starting day of the year for this month.
	 * @return	The 0-based starting day of the year for this month.
	 */
	get startDayOfYear(): number {
		return this._startDayOfYear;
	} // startDayOfYear

	/**
	 * Retrieves the number of days in this month.
	 * @return	The number of days in this month.
	 */
	get days(): number {
		return this._days;
	} // days

	/**
	 * Sets the number of days in this month.
	 * @param	days	The new number of days for the month.  Must be 1 or more.
	 */
	private setDays(days: number): void {
		if ((days < 1) || Number.isNaN(days))
			throw new Error("'days' must be 1 or greater");
		this._days = Math.trunc(days);
	} // setDays

	/**
	 * Retrieves the number of minutes in this month.
	 * @return	The number of minutes in this month.
	 */
	get minutesInMonth(): number {
		return this._days * Parse.MINUTES_IN_DAY;
	} // minutesInMonth()

	/**
	 * Retrieves the minimum temperature for this month.
	 * @return	The minimum temperature for this month.
	 */
	get minTemperature(): number {
		return this._minTemperature;
	} // minTemperature

	/**
	 * Sets the minimum temperature for this month.
	 * @param	minTemperature	The new minimum temperature for this month.
	 */
	private setMinTemperature(minTemperature: number): void {
		if (Number.isNaN(minTemperature))
			throw new Error("'minTemperature' cannot be NaN");
		this._minTemperature = minTemperature;
	} // setMinTemperature

	/**
	 * Retrieves the maximum temperature for this month.
	 * @return	The maximum temperature for this month.
	 */
	get maxTemperature(): number {
		return this._maxTemperature;
	} // maxTemperature

	/**
	 * Sets the maximum temperature for this month.
	 * @param	maxTemperature	The new maximum temperature for this month.
	 */
	private setMaxTemperature(maxTemperature: number): void {
		if (Number.isNaN(maxTemperature))
			throw new Error("'maxTemperature' cannot be NaN");
		this._maxTemperature = maxTemperature;
	} // setMaxTemperature

} // Month


export module Month {

	/**
	 * Class representing the weather type reference for a month.
	 * Weather types are defined elsewhere, and referenced from instances of this class by name.
	 */
	export class WeatherTypeRef {
		/**
		 * @see [[type]]
		 */
		private _type: string;

		/**
		 * @see [[weight]]
		 */
		private _weight: number;

		/**
		 * Constructs a new WeatherTypeRef.
		 * @param	type	The weather type name to refer to.
		 * @param	weight	The weight assigned to the reference.
		 */
		constructor(type: string, weight: number) {
			if (type == '')
				throw new Error("The type cannot be empty");
			this._type = type;

			if (weight <= 0)
				throw new Error("The weight must be greater than 0");
			this._weight = weight;
		} // constructor

		/**
		 * Retrieves the weather type name value.
		 * @return	The weather type name value.
		 */
		get type(): string {
			return this._type;
		} // type

		/**
		 * Retrieves the weight value assigned to this type.
		 * @return	The weight value assigned to this type.
		 */
		get weight(): number {
			return this._weight;
		} // weight
	} // WeatherTypeRef

	/**
	 * Class representing the weather characteristics for a month.
	 */
	export class Weather {
		/**
		 * @see [[minDuration]]
		 */
		private _minDuration: number = Parse.MINUTES_IN_DAY;		// 1 day

		/**
		 * @see [[maxDuration]]
		 */
		private _maxDuration: number = Parse.MINUTES_IN_DAY * 3;	// 3 days

		/**
		 * @see [[types]]
		 */
		private _types: ReadonlyArray<Month.WeatherTypeRef>;

		/**
		 * @see [[totalWeight]]
		 */
		private _totalWeight: number;

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
			let minDuration = Parse.duration(Parse.getProp(config, "1D", "duration", "min"));
			let maxDuration = Parse.duration(Parse.getProp(config, "3D", "duration", "max"));

			if (minDuration > maxDuration) {
				this.setMinDuration(maxDuration);
				this.setMaxDuration(minDuration);
			} else {
				this.setMinDuration(minDuration);
				this.setMaxDuration(maxDuration);
			}

			let types: WeatherTypeRef[] = [];
			this._types = types;
			this._totalWeight = 0;

			let typesConfig = Parse.getProp(config, null, "types");
			if (typesConfig != null) {
				for (let t of typesConfig) {
					let weight = Parse.getProp(t, undefined, "weight");
					this._totalWeight += weight;

					types.push(
						new WeatherTypeRef(
							Parse.getProp(t, undefined, "type"),
							weight
						)
					);
				}
			}
		} // constructor

		/**
		 * Retrieves the minimum duration value for this weather instance.
		 * @return	The minimum duration value for this weather instance.
		 */
		get minDuration(): number {
			return this._minDuration;
		} // minDuration

		/**
		 * Sets the minimum duration value for this weather instance.
		 * @param	minDuration	The new minimum duration value for this weather instance.
		 */
		private setMinDuration(minDuration: number) {
			if (Number.isNaN(minDuration))
				throw new Error("'minDuration' cannot be NaN");

			this._minDuration = minDuration;
		} // setMinDuration

		/**
		 * Retrieves the maximum duration value for this weather instance.
		 * @return	The maximum duration value for this weather instance.
		 */
		get maxDuration(): number {
			return this._maxDuration;
		} // maxDuration

		/**
		 * Sets the maximum duration value for this weather instance.
		 * @param	maxDuration	The new maximum duration value for this weather instance.
		 */
		private setMaxDuration(maxDuration: number) {
			if (Number.isNaN(maxDuration))
				throw new Error("'maxDuration' cannot be NaN");

			this._maxDuration = maxDuration;
		} // setMaxDuration

		/**
		 * Retrieves the total weight of all associated weather type reference entries.
		 * @return	The total weight of all associated weather type reference entries.
		 */
		get totalWeight(): number {
			return this._totalWeight;
		} // totalWeight

		/**
		 * Randomly selects a new weather type from the associated type references.
		 * @return	A new weather type selected from the associated type references.
		 */
		selectNewWeatherType(): WeatherTypeRef {
			let weight = Math.random() * this._totalWeight;
			let t: WeatherTypeRef|null = null;
			for (t of this._types) {
				weight -= t.weight;
				if (weight <= 0)
					return t;
			}
			if (t == null)
				throw new Error("Unable to determine weather type");
			return t;
		} // selectNewWeatherType
	} // Weather

} // Month
