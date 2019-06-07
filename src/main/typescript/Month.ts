
import { Parse } from "./Parse"
import { Configurable } from "./Configurable";

// TODO: Consider adding holidays/festivals/observance dates?  e.g. Bank holidays, Fireworks, etc

let MINUTES_IN_DAY: number = 24 * 60;

export interface WeatherTypeRefConfig {
	/**
	 * A weather type name defined elsewhere.
	 */
	readonly type: string;

	/**
	 * The weight for this weather type for the month.
	 * This value is used to determine a percentage chance that this weather
	 * type is chosen when a weather effect begins.
	 */
	readonly weight: number;
}

export interface WeatherConfig {
	/**
	 * Minimum and maximum duration for weather effects.
	 */
	readonly duration: {
		readonly min: number|string,
		readonly max: number|string
	};

	/**
	 * References to weather types assigned to the month.
	 */
	readonly types: ReadonlyArray<WeatherTypeRefConfig>;
}

export interface MonthConfig {
	/**
	 * The name of the month to be displayed in game.
	 */
	readonly name: string;

	/**
	 * The number of days in the month.
	 */
	readonly days?: number;

	/**
	 * The min and max base temperature for the month.
	 */
	readonly temperature?: {
		readonly min?: number|string;
		readonly max?: number|string;
	};

	/**
	 * Weather configuration for the month.
	 */
	readonly weather?: WeatherConfig;
}

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
	private readonly _weather: Weather;

	/**
	 * Constructs a new Month instance.
	 *
	 * @param	config	Object containing the properties to assign to the new instance.
	 * @param	startDayOfYear	The zero-based day of the year corresponding to the first day of
	 *							the month.
	 */
	constructor(config: MonthConfig, startDayOfYear: number) {
		this._startDayOfYear = startDayOfYear;

		this._name = Parse.str(config.name).trim();
		if (this._name == '')
			throw new Error("'name' cannot be empty string");

		let days: number = Parse.num(Parse.getProp(config, 31, "days"));
		if (!(days >= 1)) // Also catches NaN
			throw new Error("'days' must be 1 or greater");
		this._days = Math.trunc(days);

		this._minTemperature = Parse.temperature(Parse.getProp(config, 60, "temperature", "min"));
		if (Number.isNaN(this._minTemperature))
			throw new Error("'minTemperature' cannot be NaN");

		this._maxTemperature = Parse.temperature(Parse.getProp(config, 80, "temperature", "max"));

		this._weather = new Weather(config.weather);
	}

	get config(): MonthConfig {
		return {
			name: this.name,
			days: this.days,
			temperature: {
				min: this.minTemperature,
				max: this.maxTemperature
			},
			weather: this.weather.config
		};
	}

	/**
	 * Retrieves the name for this month.
	 * @return	The name for this month.
	 */
	get name(): string {
		return this._name;
	}

	/**
	 * Retrieves the 0-based starting day of the year for this month.
	 * @return	The 0-based starting day of the year for this month.
	 */
	get startDayOfYear(): number {
		return this._startDayOfYear;
	}

	/**
	 * Retrieves the number of days in this month.
	 * @return	The number of days in this month.
	 */
	get days(): number {
		return this._days;
	}

	/**
	 * Retrieves the number of minutes in this month.
	 * @return	The number of minutes in this month.
	 */
	get minutesInMonth(): number {
		return this._days * MINUTES_IN_DAY;
	}

	/**
	 * Retrieves the minimum temperature for this month.
	 * @return	The minimum temperature for this month.
	 */
	get minTemperature(): number {
		return this._minTemperature;
	}

	/**
	 * Retrieves the maximum temperature for this month.
	 * @return	The maximum temperature for this month.
	 */
	get maxTemperature(): number {
		return this._maxTemperature;
	}

	get weather(): Weather {
		return this._weather;
	}
}

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
	}

	get config(): WeatherTypeRefConfig {
		return {
			type: this.type,
			weight: this.weight
		};
	}

	/**
	 * Retrieves the weather type name value.
	 * @return	The weather type name value.
	 */
	get type(): string {
		return this._type;
	}

	/**
	 * Retrieves the weight value assigned to this type.
	 * @return	The weight value assigned to this type.
	 */
	get weight(): number {
		return this._weight;
	}
}

/**
 * Class representing the weather characteristics for a month.
 */
export class Weather {
	/**
	 * @see [[minDuration]]
	 */
	private _minDuration: number = MINUTES_IN_DAY;		// 1 day

	/**
	 * @see [[maxDuration]]
	 */
	private _maxDuration: number = MINUTES_IN_DAY * 3;	// 3 days

	/**
	 * @see [[types]]
	 */
	private readonly _types: WeatherTypeRef[] = [];

	/**
	 * @see [[totalWeight]]
	 */
	private _totalWeight: number = 0;

	/**
	 * Constructs a new Weather instance.
	 *
	 * @param	config	Object containing the properties to assign to the new instance.
	 * 					If not provided, will create an empty weather collection.
	 */
	constructor(config?: WeatherConfig) {
		if (config != null)
			this.configure(config);
	}

	private configure(config: WeatherConfig): void {
		let minDuration = Parse.duration(Parse.getProp(config, "1D", "duration", "min"));
		let maxDuration = Parse.duration(Parse.getProp(config, "3D", "duration", "max"));

		if (minDuration > maxDuration) {
			this.setMinDuration(maxDuration);
			this.setMaxDuration(minDuration);
		} else {
			this.setMinDuration(minDuration);
			this.setMaxDuration(maxDuration);
		}

		this._totalWeight = 0; // May be updated by types parsing

		this._types.length = 0;
		this._types.push(...Parse.array(
			config.types, [], (item: WeatherTypeRefConfig): WeatherTypeRef => {
				this._totalWeight += item.weight;

				return new WeatherTypeRef(
					item.type,
					item.weight
				)
			}
		));
	}

	get config(): WeatherConfig {
		return {
			duration: {
				min: this.minDuration,
				max: this.maxDuration
			},
			types: this.types.map((type) => type.config)
		};
	}

	/**
	 * Retrieves the minimum duration value for this weather instance.
	 * @return	The minimum duration value for this weather instance.
	 */
	get minDuration(): number {
		return this._minDuration;
	}

	/**
	 * Sets the minimum duration value for this weather instance.
	 * @param	minDuration	The new minimum duration value for this weather instance.
	 */
	private setMinDuration(minDuration: number) {
		if (Number.isNaN(minDuration))
			throw new Error("'minDuration' cannot be NaN");

		this._minDuration = minDuration;
	}

	/**
	 * Retrieves the maximum duration value for this weather instance.
	 * @return	The maximum duration value for this weather instance.
	 */
	get maxDuration(): number {
		return this._maxDuration;
	}

	/**
	 * Sets the maximum duration value for this weather instance.
	 * @param	maxDuration	The new maximum duration value for this weather instance.
	 */
	private setMaxDuration(maxDuration: number) {
		if (Number.isNaN(maxDuration))
			throw new Error("'maxDuration' cannot be NaN");

		this._maxDuration = maxDuration;
	}

	/**
	 * Retrieves the list of weather types assigned to this month.
	 */
	get types(): ReadonlyArray<WeatherTypeRef> {
		return this._types;
	}

	/**
	 * Retrieves the total weight of all associated weather type reference entries.
	 * @return	The total weight of all associated weather type reference entries.
	 */
	get totalWeight(): number {
		return this._totalWeight;
	}

	/**
	 * Randomly selects a new weather type from the associated type references.
	 * @return	A new weather type selected from the associated type references.
	 */
	selectNewWeatherType(): WeatherTypeRef {

// TODO: If there are no entries, what should be returned?

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
	}
}
