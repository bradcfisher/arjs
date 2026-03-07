import { Parse } from "./Parse.js";
import { GameState } from "./GameState.js";
import { ClassRegistry } from "./Serializer.js";
import { Configurable } from "./Configurable.js";

/**
 * @interface
 */
export class OptionChangeActionsConfig {
	/**
	 * Action to execute for a state change due to an increase in value (moving from
	 * lower state to higher state).
	 * @readonly
	 * @type {(string|ActionCallback)?}
	 */
	increase;

	/**
	 * Action to execute for a state change due to a decrease in value (moving from
	 * higher state to lower state).
	 * @readonly
	 * @type {(string|ActionCallback)?}
	 */
	decrease;

	/**
	 * Action to execute for a state change, regardless of increase or decrease.
	 * @readonly
	 * @type {(string|ActionCallback)?}
	 */
	always;
}

/**
 * @interface
 */
export class OptionActionsConfig {
	/**
	 * Actions to execute for the Option when it becomes active.
	 * If a string, it will be parsed and executed for the 'always' state.
	 * @readonly
	 * @type {(string|OptionChangeActionsConfig)?}
	 */
	enter;

	/**
	 * Actions to execute for the Option when it becomes inactive.
	 * If a string, it will be parsed and executed for the 'always' state.
	 * @readonly
	 * @type {(string|OptionChangeActionsConfig)?}
	 */
	leave;

	/**
	 * Action to execute for the Option on each check interval it is active.
	 * @readonly
	 * @type {(string|ActionCallback)?}
	 */
	recurring;
}

/**
 * @interface
 */
export class OptionConfig {
	/**
	 * The text to display for the `Option`.
	 * Must be unique for the set of options.
	 * @readonly
	 * @type {string}
	 */
	text;

	/**
	 * Whether the text should be displayed when the option is active or not.
	 * @readonly
	 * @type {boolean?}
	 */
	textVisible;

	/**
	 * The minimum value that the option will become active at (inclusive).
	 *
	 * For the first option in a set:
	 * - If `min` is not provided, and a `weight` is provided, a value of 0 will be used.
	 * - If neither a `min` nor `weight` is provided, a value of -Infinity will be used.
	 *
	 * For options after the first:
	 * - If `min` is not provided, it will default to the `max` from the previous entry.
	 * - If `min` is provided, if must equal the `max` from the previous entry (that is,
	 * gaps are not permitted).
	 *
	 * @readonly
	 * @type {number?}
	 */
	min;

	/**
	 * The maximum value that the option will become active at (exclusive).
	 *
	 * If a `max` is provided:
	 * - If `weight` is provided, it must equal (`max` - `min`)
	 * - If `weight` is not provided, it will be computed as (`max` - `min`)
	 *
	 * When a `max` is not provided:
	 * - If `weight` is provided, `max` will be computed as (`min` + `weight`)
	 * - If `weight` is not provided, both `max` and `weight` will default to +Infinity
	 *   and no further options will be permitted in the set.
	 *
	 * @readonly
	 * @type {number?}
	 */
	max;

	/**
	 * The various actions associated with the option.
	 *
	 * @readonly
	 * @type {OptionActionsConfig?}
	 */
	actions;
}

/**
 * @callback ActionCallback
 * @extends {ParseActionCallback}
 * @param {GameState} gameState
 * @return {void}
 */

/**
 * @callback ComputationCallback
 * @extends {ParseActionCallback}
 * @param {GameState} gameState
 * @return {number}
 */

/**
 * @interface
 */
export class OptionsConfig {
	/**
	 * Computation to calculate the value used to identify the current state.
	 * @readonly
	 * @type {string|ComputationCallback}
	 */
	computation;

	/**
	 * List of option configurations.
	 * @readonly
	 * @type {ReadonlyArray<OptionConfig>}
	 */
	types;
}

/**
 * @template T extends Parse.ActionCallback
 * @param {(string|T)?} action
 * @returns {T|undefined}
 */
function parseCallback(action) {
	if (action != null) {
		if (typeof action === "function") {
			return action;
		}

		return Parse.action(action, undefined, ['gameState']);
	}

	return undefined;
}

/**
 * @implements {Configurable<OptionChangeActionsConfig>}
 */
class ChangeActionCallbacks {

	#always;

	/**
	 * @type {ActionCallback?}
	 */
	#increase;

	/**
	 * @type {ActionCallback?}
	 */
	#decrease;

	/**
	 *
	 * @param {(string|OptionChangeActionsConfig)?} actions
	 */
	constructor(actions) {
		this.configure(actions);
	}

	/**
	 *
	 * @param {(string|OptionChangeActionsConfig)?} actions
	 */
	configure(actions) {
		this.#always = undefined;
		this.#increase = undefined;
		this.#decrease = undefined;

		if (actions != null) {
			if (typeof actions === "string") {
				this._always = parseCallback<ActionCallback>(actions);
			} else {
				this._always = parseCallback(actions.always);
				this.#increase = parseCallback(actions.increase);
				this.#decrease = parseCallback(actions.decrease);
			}
		}
	}

	/**
	 * @type OptionChangeActionsConfig
	 */
	get config() {
		return {
			always: (this.always ? this.always.sourceCode : undefined),
			decrease: (this.decrease ? this.decrease.sourceCode : undefined),
			increase: (this.increase ? this.increase.sourceCode : undefined)
		};
	}

	/**
	 * Action to execute for a state change, regardless of increase or decrease.
	 * @type {ActionCallback|undefined}
	 */
	get always() {
		return this.#always;
	}

	/**
	 * Action to execute for a state change due to an increase in value (moving from
	 * lower state to higher state).
	 * @type {ActionCallback|undefined}
	 */
	get increase() {
		return this.#increase;
	}

	/**
	 * Action to execute for a state change due to a decrease in value (moving from
	 * higher state to lower state).
	 * @type {ActionCallback|undefined}
	 */
	get decrease() {
		return this.#decrease;
	}
}

/**
 * @implements {Configurable<OptionActionsConfig>}
 */
export class OptionActions {
	/**
	 * @readonly
	 * @type {ChangeActionCallbacks}
	 */
	#enter = new ChangeActionCallbacks();

	/**
	 * @readonly
	 * @type {ChangeActionCallbacks}
	 */
	#leave = new ChangeActionCallbacks();

	/**
	 * @type {ActionCallback?}
	 */
	#recurring;

	/**
	 *
	 * @param {OptionActionsConfig?} config
	 */
	constructor(config) {
		if (config != null) {
			this.configure(config);
		}
	}

	/**
	 *
	 * @param {OptionActionsConfig} config
	 */
	configure(config) {
		this.#enter.configure(config.enter);
		this.#leave.configure(config.leave);
		this.#recurring = parseCallback(config.recurring);
	}

	/**
	 * @type {OptionActionsConfig}
	 */
	get config() {
		return {
			enter: this.enter.config,
			leave: this.leave.config,
			recurring: (this.recurring ? this.recurring.sourceCode : undefined)
		};
	}

	/**
	 * Actions to execute for the Option when it becomes active.
	 */
	get enter() {
		return this.#enter;
	}

	/**
	 * Actions to execute for the Option when it becomes inactive.
	 */
	get leave() {
		return this.#leave;
	}

	/**
	 * Action to execute for the Option on each check interval it is active.
	 */
	get recurring() {
		return this.#recurring;
	}
}

/**
 * Accumulator function (may modify the option)
 * @callback OptionAccumulator
 * @param {Option} opt
 * @return {void}
 */

export class Option {
	/**
	 * @type {string}
	 */
	#text;

	/**
	 * @type {boolean}
	 */
	#textVisible = true;

	/**
	 * @type {number}
	 */
	#min = 0;

	/**
	 * @type {number}
	 */
	#max = 0;

	/**
	 * @readonly
	 * @type {OptionActions}
	 */
	#actions;

	/**
	 *
	 * @param {OptionConfig} config
	 * @param {OptionAccumulator} accumulate
	 * @param {((value: any) => number)?} minMaxParser
	 */
	constructor(config, accumulate, minMaxParser) {
		this.#text = Parse.str(config.text);
		this.#textVisible = Parse.bool(config.textVisible == null ? true : config.textVisible);
		this.#actions = new OptionActions(config.actions);

		if (minMaxParser == null) {
			minMaxParser = Parse.num;
		}

		this.#min = Number.NaN;
		if (config.min != null) {
			this.#min = minMaxParser(config.min);
		}

		this.#max = Number.NaN;
		if (config.max != null) {
			this.#max = minMaxParser(config.max);
		}

		accumulate(this);
	}

	// This class isn't Configurable due to the require constructor args,
	// but this method is still convenient for the serialization in Options
	/**
	 * @type {OptionConfig}
	 */
	get config() {
		return {
			text: this.text,
			textVisible: this.textVisible,
			min: this.min,
			max: this.max,
			actions: this.actions.config
		};
	}

	/**
	 * The text to display for the `Option`.
	 * Must be unique for the set of options.
	 */
	get text() {
		return this.#text;
	}

	/**
	 * Whether the text should be displayed when the option is active or not.
	 */
	get textVisible() {
		return this.#textVisible;
	}

	/**
	 * The minimum value that the option will become active at (inclusive).
	 *
	 * For the first option in a set:
	 * - If `min` is not provided, a value of -Infinity will be used.
	 *
	 * For options after the first:
	 * - If `min` is not provided, it will default to the `max` from the previous entry.
	 * - If `min` is provided, if must equal the `max` from the previous entry (that is,
	 * gaps are not permitted).
	 */
	get min() {
		return this.#min;
	}

	/**
	 * The maximum value that the option will become active at (exclusive).
	 *
	 * If a `max` is provided, it must be greater than or equal to `min`
	 *
	 * When a `max` is not provided, it will default to +Infinity and no further
	 * options will be permitted in the set.
	 */
	get max() {
		return this.#max;
	}

	/**
	 * The various actions associated with the option.
	 */
	get actions() {
		return this.#actions;
	}

	/**
	 * Returns an "accumulator" function used to track state as options are added
	 * to a parent set.
	 *
	 * @return {OptionAccumulator}
	 */
	static accumulator() {
		/** @type {Set<string>} */
		const names = new Set();
		let started = false;
		let closed = false;
		let rangeMin = Number.NEGATIVE_INFINITY;
		let rangeMax = Number.NaN;

		return (option) => {
			if (closed) {
				throw new Error("Previous entry missing max.");
			}

			if (names.has(option.text)) {
				throw new Error("Duplicate option text '"+ option.text +"'");
			}

			names.add(option.text);

			const hasMin = !Number.isNaN(option.#min);
			const hasMax = !Number.isNaN(option.#max);

			if (!started) {
				started = true;
				if (hasMin) {
					rangeMin = option.#min;
				} else {
					option.#min = rangeMin;
				}
			} else if (hasMin) {
				if (option.#min != rangeMax) {
					throw new Error("min must match max from previous entry");
				}
			} else {
				option.#min = rangeMax;
			}

			if (hasMax) {
				if (option.#max < option.#min) {
					throw new Error("max ("+ option.#max +") must be greater or equal to than min ("+ option.#min +")");
				}
			} else {
				option.#max = Number.POSITIVE_INFINITY;
				closed = true;
			}

			rangeMax = option.#max;
		};
	}
}

/**
 * A set of configuration options.
 * @implements {Configurable<OptionsConfig>}
 */
export class Options {
	/**
	 * @type {ComputationCallback}
	 */
	#computation;

	/**
	 * @type {Option[]}
	 */
	#types = [];

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	static #initializeClass_Options = (() => {
		ClassRegistry.registerClass(
			"Options", Options,
			(obj, serializer) => {
				serializer.writeProp(obj.config);
			},
			(obj, data, deserializer) => {
				obj.configure(deserializer.readProp(data));
			}
		);
	})();

	/**
	 *
	 * @param {OptionsConfig?} config
	 */
	constructor(config) {
		if (config != null) {
			this.configure(config);
		}
	}

	/**
	 * @protected
	 * @type {undefined|((value:any) => number)}
	 */
	get minMaxParseFunction() {
		return undefined;
	}

	/**
	 *
	 * @param {OptionsConfig} config
	 */
	configure(config) {
		this.computation = Parse.required(parseCallback(config.computation), "computation");

		const accumulator = Option.accumulator();
		this.#types = Parse.array(
			config.types, [],
			(item) => new Option(item, accumulator, this.minMaxParseFunction)
		);
	}

	/**
	 * @type {OptionsConfig}
	 */
	get config() {
		return {
			computation: this.computation.sourceCode,
			types: this.#types.map((item) => item.config)
		};
	}

	/**
	 * Computation to calculate the value used to identify the current state.
	 */
	get computation() {
		return this.#computation;
	}

	set computation(value) {
		this._computation = value;
	}

	/**
	 * List of option configurations.
	 * @type {ReadonlyArray<Option>}
	 */
	get types() {
		return this.#types;
	}
}

/**
 * @interface
 */
export class TemperatureOptionsConfig
	extends OptionsConfig
{
	// TODO: Add a temperature units (F/C) configuration?
}

/**
 * @implements {Configurable<TemperatureOptionsConfig>}
 */
export class TemperatureOptions
	extends Options
{
	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	static #initializeClass_TemperatureOptions = (() => {
		ClassRegistry.registerClass(
			"TemperatureOptions", TemperatureOptions,
			(obj, serializer) => {
				serializer.writeProp(obj.config);
			},
			(obj, data, deserializer) => {
				obj.configure(deserializer.readProp(data));
			}
		);
	})();

	/**
	 *
	 * @param {TemperatureOptionsConfig?} config
	 */
	constructor(config) {
		super(config);
	}

	/**
	 * @protected
	 * @type {undefined|((value:any) => number)}
	 */
	get minMaxParseFunction() {
		return Parse.temperature;
	}
}

/**
 * @interface
 */
export class RecurringOptionsConfig
	extends OptionsConfig
{
	/**
	 * @readonly
	 * @type {(string|number)?}
	 */
	interval;

	/**
	 * @readonly
	 * @type {number}
	 */
	defaultRate;
}

/**
 * @implements {Configurable<RecurringOptionsConfig>}
 */
export class RecurringOptions
	extends Options
{
	/**
	 * @type {number}
	 */
	#defaultRate = 0;

	/**
	 * @type {number}
	 */
	#interval = 0;

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	static #initializeClass_RecurringOptions = (() => {
		ClassRegistry.registerClass(
			"RecurringOptions", RecurringOptions,
			(obj, serializer) => {
				serializer.writeProp(obj.config);
			},
			(obj, data, deserializer) => {
				obj.configure(deserializer.readProp(data));
			}
		);
	})();

	/**
	 *
	 * @param {RecurringOptionsConfig?} config
	 */
	constructor(config) {
		super(config);
	}

	/**
	 *
	 * @param {RecurringOptionsConfig} config
	 */
	configure(config) {
		super.configure(config);

		this.interval = Parse.duration(config.interval, "15M");
		this.defaultRate = Parse.num(config.defaultRate);
	}

	/**
	 * @type {RecurringOptionsConfig}
	 */
	get config() {
		const config = super.config;
		config.defaultRate = this.defaultRate;
		config.interval = this.interval;
		return config;
	}

	get interval() {
		return this.#interval;
	}

	set interval(value) {
		if (!(value > 0)) {
			throw new Error("interval must be greater than 0");
		}

		this.#interval = value;
	}

	get defaultRate() {
		return this.#defaultRate;
	}

	set defaultRate(value) {
		if (Number.isNaN(value)) {
			throw new Error("defaultRate cannot be NaN");
		}

		this._defaultRate = value;
	}
}


/*

Inebriation: InebriationOptions<MaxOption> (will need subtype for separate defaultRate values)

*/

