import { Configurable } from "./Configurable.js";
import { Parse } from "./Parse.js";

/**
 * @interface
 */
export class TemperatureVariationConfig {
    /**
     * The lower bound of the temperature range.
     * Must be a number (interpreted as degrees Fahrenheit) or a temperature
	 * value parsable by {@link Parse.temperature}.
     * @readonly
     * @type {number|string}
     */
    min;

    /**
     * The upper bound of the temperature range.
     * Must be a number (interpreted as degrees Fahrenheit) or a temperature
	 * value parsable by {@link Parse.temperature}.
     * @readonly
     * @type {number|string}
     */
    max;
}

/**
 * @interface
 */
export class PercentageRangeConfig {
    /**
     * The lower bound of the range. May be specified as either a number or a
     * percentage parsable by {@link Parse.percent}.
     * @type {number|string}
     */
    min;

    /**
     * The upper bound of the range. May be specified as either a number or a
     * percentage parsable by {@link Parse.percent}.
     * @type {number|string}
     */
    max;
}

/**
 * @interface
 */
export class DurationRangeConfig {
    /**
     * The lower bound of the duration range.
     * Must be a number (interpreted as minutes) or a duration value parsable
     * by {@link Parse.duration}.
     * @readonly
     * @type {number|string}
     */
    min;

    /**
     * The upper bound of the duration range.
     * Must be a number (interpreted as minutes) or a duration value parsable
     * by {@link Parse.duration}.
     * @readonly
     * @type {number|string}
     */
    max;
}

/**
 * @interface
 */
export class LightningConfig {
    /**
     * The game clock frequency range for lightning effects.
     * If not provided, will default to an empty range, disabling lightning effects.
     * @type {DurationRangeConfig?}
     */
    frequency;

    /**
     * The real world clock duration range for lightning effects.
     * If not provided, a default range of 100ms to 230ms will be used.
     * @type {DurationRangeConfig?}
     */
    duration;

    /**
     * @type {string|URL|(string|URL)[]}
     */
    sound;
}

/**
 * @interface
 */
export class PrecipitationConfig {
    /**
     * The intensity of precipitation. May be specified as either a number or a
     * percentage parsable by {@link Parse.percent}.
     * Higher values result in more precipitation effects (rain or snow, depending
     * on the ambient temperature) and lower visibility distance.
     * Must be be between 0 and 1 (100%). Defaults to 0 if not provided.
     * @type {number|string|null}
     */
    intensity;

    /**
     * Sound effect(s) to select from to play for the duration of the precipitation.
     * If multiple sounds are provided, one is randomly chosen when the precipitation
     * begins.
     * The volume and playback rate of the sound is adjusted based on the intensity
     * of the precipitation.
     * @type {string|URL|(string|URL)[]|null}
     */
    sound;
}

/**
 * @interface
 */
export class WindConfig {
    /**
     * Wind intensity range. Defaults to an empty range if omitted, disabling
     * wind effects.
     * @readonly
     * @type {PercentageRangeConfig?}
     */
    intensity;

    /**
     * Frequency of wind direction and intensity changes. Defaults to an empty
     * range if omitted, disabling wind change effects.
     * @type {DurationRangeConfig?}
     */
    changeFrequency;

    /**
     * Sound effect(s) to select from to play for the duration of the wind.
     * If multiple sounds are provided, one is randomly chosen when the wind
     * begins.
     * The volume of the sound is adjusted based on the intensity of the wind.
     * @type {string|URL|(string|URL)[]|null}
     */
	sound;
}

/**
 * @interface
 */
export class WeatherTypeConfig {

    /**
     * The range for temperature variations. If omitted, no temperature variations
     * are applied.
     * @readonly
     * @type {TemperatureVariationConfig?}
     */
    temperatureVariation;

    /**
     * Range for density of clouds in the sky. If omitted, no clouds will be
     * generated.
     * A value of 0 means perfectly clear skies, while a value of 1 (100%)
     * indicates a completely cloud-covered sky.
     * @readonly
     * @type {PercentageRangeConfig?}
     */
    cloudDensity;

    /**
     * Precipitation intensity and sound effects. If omitted, there will be no
     * precipitation effect.
     * @readonly
     * @type {PrecipitationConfig?}
     */
    precipitation;

    /**
     * The frequency and duration of lightning. If omitted, there will be no
     * lightning effect.
     * @readonly
     * @type {LightningConfig?}
     */
    lightning;

    /**
     * Wind intensity and sound effects. If omitted, there will be no
     * wind effect.
     * @readonly
     * @type {WindConfig?}
     */
    wind;
}

/**
 * @implements {Configurable<TemperatureVariationConfig>}
 * @implements {TemperatureVariationConfig}
 */
export class TemperatureVariation {

    /**
     * @type {number}
     */
    #min;

    /**
     * @type {number}
     */
    #max;

    /**
     * Constructs a new TemperatureVariation using the provided configuration.
     * @param {TemperatureVariationConfig} config the configuration to apply.
     */
    constructor(config) {
        this.configure(config);
    }

    /**
     * @param {TemperatureVariationConfig} config the configuration to apply
     */
    configure(config) {
        this.#min = Parse.prop(config, ["min"], null, Parse.temperature);
        this.#max = Parse.prop(config, ["max"], null, Parse.temperature);
        if (this.#min > this.#max) {
            throw new Error("'min' must be less than or equal to 'max'");
        }
    }

    /**
     * @type {TemperatureVariationConfig}
     */
    get config() {
        return {
            min: this.min + "F",
            max: this.max + "F"
        };
    }

    /**
     * The lower bound of the temperature range, in degrees Fahrenheit.
     */
    get min() {
        return this.#min;
    }

    /**
     * The upper bound of the temperature range, in degrees Fahrenheit.
     */
    get max() {
        return this.#max;
    }

    isEmpty() {
        return this.min == this.max;
    }
}

/**
 * @implements {Configurable<PercentageRangeConfig>}
 * @implements {PercentageRangeConfig}
 */
export class PercentageRange {
    /**
     * @type {number}
     */
    #min;

    /**
     * @type {number}
     */
    #max;

    /**
     * Constructs a new PercentageRange using the provided configuration.
     * @param {PercentageRangeConfig} config the configuration to apply.
     */
    constructor(config) {
        this.configure(config);
    }

    /**
     * @param {PercentageRangeConfig} config the configuration to apply
     */
    configure(config) {
        this.#min = Parse.prop(config, ["min"], null, Parse.percent);
        this.#max = Parse.prop(config, ["max"], null, Parse.percent);
        if (this.#min > this.#max) {
            throw new Error("'min' must be less than or equal to 'max'");
        }
    }

    /**
     * @type {PercentageRangeConfig}
     */
    get config() {
        return {
            min: this.min,
            max: this.max
        };
    }

    /**
     * The lower bound of the range.
     */
    get min() {
        return this.#min;
    }

    /**
     * The upper bound of the range.
     */
    get max() {
        return this.#max;
    }

    isEmpty() {
        return this.min == this.max;
    }
}

/**
 * @implements {Configurable<DurationRangeConfig>}
 * @implements {DurationRangeConfig}
 */
export class DurationRange {
    /**
     * @type {number}
     */
    #min;

    /**
     * @type {number}
     */
    #max;

    /**
     * Constructs a new DurationRange using the provided configuration.
     * @param {DurationRangeConfig} config the configuration to apply.
     */
    constructor(config) {
        this.configure(config);
    }

    /**
     * @param {DurationRangeConfig} config the configuration to apply
     */
    configure(config) {
        this.#min = Parse.prop(config, ["min"], null, Parse.duration);
        this.#max = Parse.prop(config, ["max"], null, Parse.duration);
        if (this.#min > this.#max) {
            throw new Error("'min' must be less than or equal to 'max'");
        }
    }

    /**
     * @type {DurationRangeConfig}
     */
    get config() {
        return {
            min: this.min,
            max: this.max
        };
    }

    /**
     * The lower bound of the range in minutes.
     */
    get min() {
        return this.#min;
    }

    /**
     * The upper bound of the range in minutes.
     */
    get max() {
        return this.#max;
    }

    isEmpty() {
        return this.min == this.max;
    }
}

/**
 * @implements {Configurable<LightningConfig>}
 * @implements {LightningConfig}
 */
export class Lightning {
    /**
     * @type {DurationRange}
     */
    #frequency;

    /**
     * @type {DurationRange}
     */
    #duration;

    /**
     * @type {AudioClip[]}
     */
    #sound;

    /**
     * Constructs a new Lightning instance using the provided configuration.
     * @param {LightningConfig} config the configuration to apply.
     */
    constructor(config) {
        this.configure(config);
    }

    /**
     * @param {LightningConfig} config the configuration to apply
     */
    configure(config) {
        this.#frequency = Parse.prop(config, ["frequency"], {"min": 0, "max": 0},
            (val) => new DurationRange(val));
        this.#duration = Parse.prop(config, ["duration"], {"min": "100ms", "max": "230ms"},
            (val) => new DurationRange(val));

        // TODO: Parse sound
    }

    /**
     * @type {LightningConfig}
     */
    get config() {
        return {
            duration: this.#duration.config,
            frequency: this.#frequency.config,
            // TODO: sound
        };
    }

    /**
     * The game clock frequency range for lightning effects.
     */
    get frequency() {
        return this.#frequency;
    }

    /**
     * The real world clock duration range for lightning effects.
     */
    get duration() {
        return this.#duration;
    }

    /**
     * The sound clip(s) to randomly select from for the lightning effects.
     */
    get sound() {
        return this.#sound;
    }

}

/**
 * @implements {Configurable<PrecipitationConfig>}
 * @implements {PrecipitationConfig}
 */
export class Precipitation {
    /**
     * @type {number}
     */
    #intensity;

    /**
     * @type {AudioClip[]}
     */
    #sound;

    /**
     * Constructs a new Precipitation instance using the provided configuration.
     * @param {PrecipitationConfig} config the configuration to apply.
     */
    constructor(config) {
        this.configure(config);
    }

    /**
     * @param {PrecipitationConfig} config the configuration to apply
     */
    configure(config) {
        this.#intensity = Parse.prop(config, ["intensity"], 0, Parse.percent);

        // TODO: Parse sound
    }

    /**
     * @type {PrecipitationConfig}
     */
    get config() {
        return {
            intensity: this.#intensity,
            // TODO: sound
        };
    }

    /**
     * The intensity of precipitation.
     * Higher values result in more precipitation effects (rain or snow, depending
     * on the ambient temperature) and lower visibility distance.
     */
    get intensity() {
        return this.#intensity;
    }

    /**
     * Sound effect(s) to select from to play for the duration of the precipitation.
     * If multiple sounds are provided, one is randomly chosen when the precipitation
     * begins.
     * The volume and playback rate of the sound is adjusted based on the intensity
     * of the precipitation.
     */
    get sound() {
        return this.#sound;
    }
}

/**
 * @implements {Configurable<WindConfig>}
 * @implements {WindConfig}
 */
export class Wind {
    /**
     * @type {PercentageRange}
     */
    #intensity;

    /**
     * @type {DurationRange}
     */
    #changeFrequency;

    /**
     * @type {AudioClip[]}
     */
    #sound;

    /**
     * Constructs a new Wind instance using the provided configuration.
     * @param {WindConfig} config the configuration to apply.
     */
    constructor(config) {
        this.configure(config);
    }

    /**
     * @param {WindConfig} config the configuration to apply
     */
    configure(config) {
        this.#intensity = Parse.prop(config, ["intensity"], {"min":0, "max":0},
            (rangeConfig) => new PercentageRange(rangeConfig));

        this.#changeFrequency = Parse.prop(config, ["changeFrequency"], {"min":0, "max":0},
            (rangeConfig) => new DurationRange(rangeConfig));

        // TODO: Parse sound
    }

    /**
     * @type {WindConfig}
     */
    get config() {
        return {
            intensity: this.#intensity.config,
            changeFrequency: this.#changeFrequency.config,
            // TODO: sound
        };
    }

    /**
     * Wind intensity range.
     */
    get intensity() {
        return this.#intensity;
    }

    /**
     * Frequency of wind direction and intensity changes.
     */
    get changeFrequency() {
        return this.#changeFrequency;
    }

    /**
     * Sound effect(s) to select from to play for the duration of the wind.
     * If multiple sounds are provided, one is randomly chosen when the wind
     * begins.
     * The volume of the sound is adjusted based on the intensity of the wind.
     */
	get sound() {
        return this.#sound;
    }
}

/**
 * @implements {Configurable<WeatherTypeConfig>}
 * @implements {WeatherTypeConfig}
 */
export class WeatherType {
    /**
     * @type {TemperatureVariation}
     */
    #temperatureVariation;

    /**
     * @type {PercentageRange}
     */
    #cloudDensity;

    /**
     * @type {Precipitation}
     */
    #precipitation;

    /**
     * @type {Lightning}
     */
    #lightning;

    /**
     * @type {Wind}
     */
    #wind;

    /**
     * Constructs a new WeatherType instance using the provided configuration.
     * @param {WeatherTypeConfig} config the configuration to apply.
     */
    constructor(config) {
        this.configure(config);
    }

    /**
     * @param {WeatherTypeConfig} config the configuration to apply
     */
    configure(config) {
        this.#temperatureVariation =
            Parse.prop(config, ["temperatureVariation"], {"min":0,"max":0},
                (val) => new TemperatureVariation(val));

        this.#cloudDensity =
            Parse.prop(config, ["cloudDensity"], {"min":0,"max":0},
                (val) => new PercentageRange(val));

        this.#precipitation =
            Parse.prop(config, ["precipitation"], {},
                (val) => new Precipitation(val));

        this.#lightning =
            Parse.prop(config, ["lightning"], {}, (val) => new Lightning(val));

        this.#wind = Parse.prop(config, ["wind"], {}, (val) => new Wind(val));
    }

    /**
     * @type {WeatherTypeConfig}
     */
    get config() {
        return {
            "temperatureVariation": this.#temperatureVariation.config,
            "cloudDensity": this.#cloudDensity.config,
            "precipitation": this.#precipitation.config,
            "lightning": this.#lightning.config,
            "wind": this.#wind.config
        };
    }

    /**
     * The range for temperature variations.
     */
    get temperatureVariation() {
        return this.#temperatureVariation;
    }

    /**
     * Range for density of clouds in the sky.
     * A value of 0 means perfectly clear skies, while a value of 1 (100%)
     * indicates a completely cloud-covered sky.
     */
    get cloudDensity() {
        return this.#cloudDensity;
    }

    /**
     * Precipitation intensity and sound effects.
     */
    get precipitation() {
        return this.#precipitation;
    }

    /**
     * The frequency and duration of lightning.
     */
    get lightning() {
        return this.#lightning;
    }

    /**
     * Wind intensity and sound effects.
     */
    get wind() {
        return this.#wind;
    }
}
