
import { Parse } from "./Parse.js"
import { Configurable } from "./Configurable.js";

// TODO: Consider adding holidays/festivals/observance dates?  e.g. Bank holidays, Fireworks, etc

const MINUTES_IN_DAY = 24 * 60;

/**
 * A reference to a Weather type.
 * @interface
 */
export class WeatherTypeRefConfig {
	/**
	 * A weather type name defined within the GameState.
	 * @readonly
	 * @type {string}
	 */
	type;

	/**
	 * The weight for this weather type for the month.
	 * This value is used to determine a percentage chance that this weather
	 * type is chosen when a weather effect begins.
	 * @readonly
	 * @type {number}
	 */
	weight;
}

/**
 * The weather options defined for a game calendar month.
 * @interface
 */
export class WeatherOptionsConfig {
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
	 * @type {ReadonlyArray<WeatherTypeRefConfig>}
	 */
	types;
}

/**
 * Configuration describing a game calendar month.
 * @interface
 */
export class MonthConfig {
	/**
	 * The name of the month to be displayed in game.
	 * @readonly
	 * @type {string}
	 */
	name;

	/**
	 * The number of days in the month.
	 *
	 * If omitted, the month will default to 31 days.
	 *
	 * @readonly
	 * @type {number?}
	 */
	days;

	/**
	 * The min and max base temperature for the month.
	 * Values must be a number (interpreted as degrees Fahrenheit) or a temperature
	 * value parsable by {@link Parse.temperature}.
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
	 * @type {WeatherOptionsConfig?}
	 */
	weather;
}

/**
 * Class representing a month of the game year.
 */
export class Month {

	/**
	 * @type {string}
	 */
	#name;

	/**
	 * @type {number}
	 */
	#startDayOfYear;

	/**
	 * @type {number}
	 */
	#days;

	/**
	 * @type {number}
	 */
	#minTemperature;

	/**
	 * @type {number}
	 */
	#maxTemperature;

	/**
	 * @readonly
	 * @type {WeatherOptions}
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

		this.#name = Parse.prop(config, ["name"], null, Parse.str).trim();
		if (this.#name == '') {
			throw new Error("'name' cannot be empty string");
		}

		const days = Math.trunc(Parse.prop(config, ["days"], 31, Parse.num));
		if (!(days >= 1)) { // Also catches NaN
			throw new Error("'days' must be 1 or greater");
		}
		this.#days = days;

		this.#minTemperature = Parse.prop(config, ["temperature", "min"], 60, Parse.temperature);
		this.#maxTemperature = Parse.prop(config, ["temperature", "max"], 80, Parse.temperature);

		this.#weather = new WeatherOptions(config.weather);
	}

	/**
	 * @type {MonthConfig}
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
	 * The name for the month.
	 */
	get name() {
		return this.#name;
	}

	/**
	 * The 0-based starting day of the year for the month.
	 */
	get startDayOfYear() {
		return this.#startDayOfYear;
	}

	/**
	 * The number of days in the month.
	 */
	get days() {
		return this.#days;
	}

	/**
	 * The number of minutes in the month.
	 */
	get minutesInMonth() {
		return this.#days * MINUTES_IN_DAY;
	}

	/**
	 *  The minimum temperature for the month.
	 */
	get minTemperature() {
		return this.#minTemperature;
	}

	/**
	 * The maximum temperature for the month.
	 */
	get maxTemperature() {
		return this.#maxTemperature;
	}

	/**
	 * The weather options for the month.
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
	 * @type {string}
	 */
	#type;

	/**
	 * @type {number}
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

		if (!(weight > 0)) { // Catches NaN
			throw new Error("The weight must be greater than 0");
		}

		this.#weight = weight;
	}

	/**
	 * @type {WeatherTypeRefConfig}
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
 * @implements {Configurable<WeatherOptionsConfig>}
 */
export class WeatherOptions {
	/**
	 * @type {number}
	 */
	#minDuration = MINUTES_IN_DAY;		// 1 day

	/**
	 * @type {number}
	 */
	#maxDuration = MINUTES_IN_DAY * 3;	// 3 days

	/**
	 * @readonly
	 * @type {WeatherTypeRef[]}
	 */
	#types = [];

	/**
	 * @type {number}
	 */
	#totalWeight = 0;

	/**
	 * Constructs a new Weather instance.
	 *
	 * @param {WeatherOptionsConfig?} config configuration to apply to the new
	 *        instance. If not provided, will create an empty weather collection.
	 */
	constructor(config) {
		if (config != null) {
			this.configure(config);
		}
	}

	/**
	 * @param {WeatherOptionsConfig} config the configuration to apply.
	 */
	configure(config) {
		const minDuration = Parse.prop(config, ["duration", "min"], "1D", Parse.duration);
		if (minDuration <= 0) {
			throw new Error("'duration.min' must be greater than 0");
		}

		const maxDuration = Parse.prop(config, ["duration", "max"], "3D", Parse.duration);
		if (maxDuration <= 0) {
			throw new Error("'duration.max' must be greater than 0");
		}

		if (minDuration > maxDuration) {
			this.#minDuration = maxDuration;
			this.#maxDuration = minDuration;
		} else {
			this.#minDuration = minDuration;
			this.#maxDuration = maxDuration;
		}

		this.#totalWeight = 0; // May be updated by types parsing

		this.#types.length = 0;
		this.#types.push(...Parse.prop(config, ["types"], [],
			(val) => Parse.array(val, null, (/** @type WeatherTypeRefConfig */ item) => {
				this.#totalWeight += item.weight;

				return new WeatherTypeRef(
					Parse.prop(item, ["type"], null, Parse.str),
					Parse.prop(item, ["weight"], null, Parse.num)
				)
			}
		)));
	}

	/**
	 * @type {WeatherOptionsConfig}
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
	 * The minimum duration value for this weather instance.
	 */
	get minDuration() {
		return this.#minDuration;
	}

	/**
	 * The maximum duration value for this weather instance.
	 */
	get maxDuration() {
		return this.#maxDuration;
	}

	/**
	 * The list of weather types assigned to this month.
	 */
	get types() {
		return this.#types;
	}

	/**
	 * The total weight of all associated weather type reference entries.
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
		/** @type {WeatherTypeRef?} */
		let t = null;
		for (t of this.#types) {
			weight -= t.weight;
			if (weight <= 0) {
				return t;
			}
		}

		if (t == null) {
			throw new Error("Unable to determine weather type");
		}

		return t;
	}
}
