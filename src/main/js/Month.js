
import { Parse } from "./Parse.js"
import { Configurable } from "./Configurable.js";

// TODO: Consider adding holidays/festivals/observance dates?  e.g. Bank holidays, Fireworks, etc

const MINUTES_IN_DAY = 24 * 60;

/**
 * @interface
 */
export class WeatherTypeRefConfig {
	/**
	 * A weather type name defined elsewhere.
	 * @readonly
	 * @type string
	 */
	type;

	/**
	 * The weight for this weather type for the month.
	 * This value is used to determine a percentage chance that this weather
	 * type is chosen when a weather effect begins.
	 * @readonly
	 * @type number
	 */
	weight;
}

/**
 * @interface
 */
export class WeatherConfig {
	/**
	 * Minimum and maximum duration for weather effects.
	 *
	 * If min is not provided, a default of 1 day will be applied.
	 * If max is not provided, a default of 3 days will be applied.
	 *
	 * @readonly
	 * @type {{ readonly min: number|string, readonly max: number|string }}
	 */
	duration;

	/**
	 * References to weather types assigned to the month.
	 * @readonly
	 * @type ReadonlyArray<WeatherTypeRefConfig>
	 */
	types;
}

/**
 * @interface
 */
export class MonthConfig {
	/**
	 * The name of the month to be displayed in game.
	 * @readonly
	 * @type string
	 */
	name;

	/**
	 * The number of days in the month.
	 *
	 * If omitted, the month will default to 31 days.
	 *
	 * @readonly
	 * @type number?
	 */
	days;

	/**
	 * The min and max base temperature for the month.
	 *
	 * If min is not provided, a default minimum temperature of 60 degrees F will be applied.
	 * If max is not provided, a default maximum temperature of 80 degrees F will be applied.
	 *
	 * @readonly
	 * @type {{ readonly min?: number|string, readonly max?: number|string }?}
	 */
	temperature;

	/**
	 * Weather configuration for the month.
	 *
	 * If not provided, no weather effects will be assigned.
	 *
	 * @readonly
	 * @type WeatherConfig?
	 */
	weather;
}

/**
 * Class representing a month of the game year.
 */
export class Month {

	/**
	 * @type string
	 */
	#name;

	/**
	 * @type number
	 */
	#startDayOfYear;

	/**
	 * @type number
	 */
	#days;

	/**
	 * @type number
	 */
	#minTemperature;

	/**
	 * @type number
	 */
	#maxTemperature;

	/**
	 * @readonly
	 * @type Weather
	 */
	#weather;

	/**
	 * Constructs a new Month instance.
	 *
	 * @param {MonthConfig} config Object containing the properties to assign to the new instance.
	 * @param {number} startDayOfYear The zero-based day of the year corresponding to the first day of
	 *        the month.
	 */
	constructor(config, startDayOfYear) {
		this.#startDayOfYear = startDayOfYear;

		this.#name = Parse.str(config.name).trim();
		if (this.#name == '')
			throw new Error("'name' cannot be empty string");

		const days = Parse.num(Parse.getProp(config, 31, "days"));
		if (!(days >= 1)) { // Also catches NaN
			throw new Error("'days' must be 1 or greater");
		}
		this.#days = Math.trunc(days);

		this.#minTemperature = Parse.temperature(Parse.getProp(config, 60, "temperature", "min"));
		if (Number.isNaN(this.#minTemperature))
			throw new Error("'minTemperature' cannot be NaN");

		this.#maxTemperature = Parse.temperature(Parse.getProp(config, 80, "temperature", "max"));

		this.#weather = new Weather(config.weather);
	}

	/**
	 * @type MonthConfig
	 */
	get config() {
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
	 * @return {string} The name for this month.
	 */
	get name() {
		return this.#name;
	}

	/**
	 * Retrieves the 0-based starting day of the year for this month.
	 * @return {number} The 0-based starting day of the year for this month.
	 */
	get startDayOfYear() {
		return this.#startDayOfYear;
	}

	/**
	 * Retrieves the number of days in this month.
	 * @return {number} The number of days in this month.
	 */
	get days() {
		return this.#days;
	}

	/**
	 * Retrieves the number of minutes in this month.
	 * @return {number} The number of minutes in this month.
	 */
	get minutesInMonth() {
		return this.#days * MINUTES_IN_DAY;
	}

	/**
	 * Retrieves the minimum temperature for this month.
	 * @return {number} The minimum temperature for this month.
	 */
	get minTemperature() {
		return this.#minTemperature;
	}

	/**
	 * Retrieves the maximum temperature for this month.
	 * @return {number} The maximum temperature for this month.
	 */
	get maxTemperature() {
		return this.#maxTemperature;
	}

	/**
	 * @type Weather
	 */
	get weather() {
		return this.#weather;
	}
}

/**
 * Class representing the weather type reference for a month.
 * Weather types are defined elsewhere, and referenced from instances of this class by name.
 */
export class WeatherTypeRef {
	/**
	 * @type string
	 */
	#type;

	/**
	 * @type number
	 */
	#weight;

	/**
	 * Constructs a new WeatherTypeRef.
	 * @param {string} type The weather type name to refer to.
	 * @param {number} weight The weight assigned to the reference.
	 */
	constructor(type, weight) {
		if (type == '') {
			throw new Error("The type cannot be empty");
		}
		this.#type = type;

		if (weight <= 0) {
			throw new Error("The weight must be greater than 0");
		}

		this.#weight = weight;
	}

	/**
	 * @type WeatherTypeRefConfig
	 */
	get config() {
		return {
			type: this.type,
			weight: this.weight
		};
	}

	/**
	 * The weather type name.
	 */
	get type() {
		return this.#type;
	}

	/**
	 * The weight value assigned to this type.
	 *
	 * Weight values must be greater than 0.
	 */
	get weight() {
		return this.#weight;
	}
}

/**
 * Class representing the weather characteristics for a month.
 */
export class Weather {
	/**
	 * @type number
	 */
	#minDuration = MINUTES_IN_DAY;		// 1 day

	/**
	 * @type number
	 */
	#maxDuration = MINUTES_IN_DAY * 3;	// 3 days

	/**
	 * @readonly
	 * @type WeatherTypeRef[]
	 */
	#types = [];

	/**
	 * @type number
	 */
	#totalWeight = 0;

	/**
	 * Constructs a new Weather instance.
	 *
	 * @param {WeatherConfig?} config Object containing the properties to assign to the new instance.
	 *        If not provided, will create an empty weather collection.
	 */
	constructor(config) {
		if (config != null) {
			this.#configure(config);
		}
	}

	/**
	 *
	 * @param {WeatherConfig} config
	 */
	#configure(config) {
		let minDuration = Parse.duration(Parse.getProp(config, "1D", "duration", "min"));
		let maxDuration = Parse.duration(Parse.getProp(config, "3D", "duration", "max"));

		if (minDuration > maxDuration) {
			this.#setMinDuration(maxDuration);
			this.#setMaxDuration(minDuration);
		} else {
			this.#setMinDuration(minDuration);
			this.#setMaxDuration(maxDuration);
		}

		this.#totalWeight = 0; // May be updated by types parsing

		this.#types.length = 0;
		this.#types.push(...Parse.array(
			config.types, [], (/** @type WeatherTypeRefConfig */ item) => {
				this.#totalWeight += item.weight;

				return new WeatherTypeRef(
					item.type,
					item.weight
				)
			}
		));
	}

	/**
	 * @type WeatherConfig
	 */
	get config() {
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
	 * @return {number} The minimum duration value for this weather instance.
	 */
	get minDuration() {
		return this.#minDuration;
	}

	/**
	 * Sets the minimum duration value for this weather instance.
	 * @param {number} minDuration The new minimum duration value for this weather instance.
	 */
	#setMinDuration(minDuration) {
		if (Number.isNaN(minDuration)) {
			throw new Error("'minDuration' cannot be NaN");
		}

		if (minDuration <= 0) {
			throw new Error("'minDuration' must be greater than 0");
		}

		this.#minDuration = minDuration;
	}

	/**
	 * Retrieves the maximum duration value for this weather instance.
	 * @return {number} The maximum duration value for this weather instance.
	 */
	get maxDuration() {
		return this.#maxDuration;
	}

	/**
	 * Sets the maximum duration value for this weather instance.
	 * @param {number} maxDuration The new maximum duration value for this weather instance.
	 */
	#setMaxDuration(maxDuration) {
		if (Number.isNaN(maxDuration)) {
			throw new Error("'maxDuration' cannot be NaN");
		}

		if (maxDuration <= 0) {
			throw new Error("'maxDuration' must be greater than 0");
		}

		this.#maxDuration = maxDuration;
	}

	/**
	 * Retrieves the list of weather types assigned to this month.
	 * @type ReadonlyArray<WeatherTypeRef>
	 */
	get types() {
		return this.#types;
	}

	/**
	 * Retrieves the total weight of all associated weather type reference entries.
	 * @return {number} The total weight of all associated weather type reference entries.
	 */
	get totalWeight() {
		return this.#totalWeight;
	}

	/**
	 * Randomly selects a new weather type from the associated type references.
	 * @return {WeatherTypeRef} A new weather type selected from the associated type references.
	 */
	selectNewWeatherType() {

// TODO: If there are no entries, what should be returned?

		let weight = Math.random() * this.#totalWeight;
		/** @type WeatherTypeRef|null */
		let t = null;
		for (t of this.#types) {
			weight -= t.weight;
			if (weight <= 0)
				return t;
		}
		if (t == null)
			throw new Error("Unable to determine weather type");
		return t;
	}
}
