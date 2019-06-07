import { Parse } from "./Parse";
import { GameState } from "./GameState";
import { ClassRegistry, Serializer, Deserializer, SerializedData } from "./Serializer";
import { Configurable } from "./Configurable";

export interface OptionChangeActionsConfig {
	/**
	 * Action to execute for a state change due to an increase in value (moving from
	 * lower state to higher state).
	 */
	readonly increase?: string|ActionCallback;

	/**
	 * Action to execute for a state change due to a decrease in value (moving from
	 * higher state to lower state).
	 */
	readonly decrease?: string|ActionCallback;

	/**
	 * Action to execute for a state change, regardless of increase or decrease.
	 */
	readonly always?: string|ActionCallback;
}

export interface OptionActionsConfig {
	/**
	 * Actions to execute for the Option when it becomes active.
	 * If a string, it will be parsed and executed for the 'always' state.
	 */
	readonly enter?: string|OptionChangeActionsConfig;

	/**
	 * Actions to execute for the Option when it becomes inactive.
	 * If a string, it will be parsed and executed for the 'always' state.
	 */
	readonly leave?: string|OptionChangeActionsConfig;

	/**
	 * Action to execute for the Option on each check interval it is active.
	 */
	readonly recurring?: string|ActionCallback;
}

export interface OptionConfig {
	/**
	 * The text to display for the `Option`.
	 * Must be unique for the set of options.
	 */
	readonly text: string;

	/**
	 * Whether the text should be displayed when the option is active or not.
	 */
	readonly textVisible?: boolean;

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
	 */
	readonly min?: number;

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
	 */
	readonly max?: number;

	/**
	 * The various actions associated with the option.
	 */
	readonly actions?: OptionActionsConfig;
}


interface ActionCallback extends Parse.ActionCallback {
	(gameState: GameState): void;
};

interface ComputationCallback extends Parse.ActionCallback {
	(gameState: GameState): number;
};

export interface OptionsConfig {
	/**
	 * Computation to calculate the value used to identify the current state.
	 */
	readonly computation: string|ComputationCallback;

	/**
	 * List of option configurations.
	 */
	readonly types: ReadonlyArray<OptionConfig>
}

function parseCallback<T extends Parse.ActionCallback>(action?: string|T): T|undefined {
	if (action != null) {
		if (typeof action === "function")
			return action;

		return Parse.action(action, undefined, ['gameState']) as T;
	}

	return undefined;
}

class ChangeActionCallbacks
	implements Configurable<OptionChangeActionsConfig>
{
	/**
	 * @see [[always]]
	 */
	private _always?: ActionCallback;

	/**
	 * @see [[increase]]
	 */
	private _increase?: ActionCallback;

	/**
	 * @see [[decrease]]
	 */
	private _decrease?: ActionCallback;

	constructor(actions?: string|OptionChangeActionsConfig) {
		this.configure(actions);
	}

	configure(actions?: string|OptionChangeActionsConfig): void {
		this._always = undefined;
		this._increase = undefined;
		this._decrease = undefined;

		if (actions != null) {
			if (typeof actions === "string") {
				this._always = parseCallback<ActionCallback>(actions);
			} else {
				this._always = parseCallback(actions.always);
				this._increase = parseCallback(actions.increase);
				this._decrease = parseCallback(actions.decrease);
			}
		}
	}

	get config(): OptionChangeActionsConfig {
		return {
			always: (this.always ? this.always.sourceCode : undefined),
			decrease: (this.decrease ? this.decrease.sourceCode : undefined),
			increase: (this.increase ? this.increase.sourceCode : undefined)
		};
	}

	/**
	 * Action to execute for a state change, regardless of increase or decrease.
	 */
	get always(): ActionCallback|undefined {
		return this._always;
	}

	/**
	 * Action to execute for a state change due to an increase in value (moving from
	 * lower state to higher state).
	 */
	get increase(): ActionCallback|undefined {
		return this._increase;
	}

	/**
	 * Action to execute for a state change due to a decrease in value (moving from
	 * higher state to lower state).
	 */
	get decrease(): ActionCallback|undefined {
		return this._decrease;
	}
}

export class OptionActions
	implements Configurable<OptionActionsConfig>
{
	/**
	 * @see [[enter]]
	 */
	private readonly _enter: ChangeActionCallbacks = new ChangeActionCallbacks();

	/**
	 * @see [[leave]]
	 */
	private readonly _leave: ChangeActionCallbacks = new ChangeActionCallbacks();

	/**
	 * @see [[recurring]]
	 */
	private _recurring?: ActionCallback;

	constructor(config?: OptionActionsConfig) {
		if (config != null)
			this.configure(config);
	}

	configure(config: OptionActionsConfig): void {
		this._enter.configure(config.enter);
		this._leave.configure(config.leave);
		this._recurring = parseCallback(config.recurring);
	}

	get config(): OptionActionsConfig {
		return {
			enter: this.enter.config,
			leave: this.leave.config,
			recurring: (this.recurring ? this.recurring.sourceCode : undefined)
		};
	}

	/**
	 * Actions to execute for the Option when it becomes active.
	 */
	get enter(): ChangeActionCallbacks {
		return this._enter;
	}

	/**
	 * Actions to execute for the Option when it becomes inactive.
	 */
	get leave(): ChangeActionCallbacks {
		return this._leave;
	}

	/**
	 * Action to execute for the Option on each check interval it is active.
	 */
	get recurring(): ActionCallback|undefined {
		return this._recurring;
	}
}

// Accumulator function (may modify the option)
type OptionAccumulator = (opt: Option) => void;

export class Option {
	/**
	 * @see [[text]]
	 */
	private _text: string;

	/**
	 * @see [[textVisible]]
	 */
	private _textVisible: boolean = true;

	/**
	 * @see [[min]]
	 */
	private _min: number = 0;

	/**
	 * @see [[max]]
	 */
	private _max: number = 0;

	/**
	 * @see [[actions]]
	 */
	private readonly _actions: OptionActions;

	constructor(config: OptionConfig, accumulate: OptionAccumulator, minMaxParser?: (value: any) => number) {
		this._text = Parse.str(config.text);
		this._textVisible = Parse.bool(config.textVisible == null ? true : config.textVisible);
		this._actions = new OptionActions(config.actions);

		if (minMaxParser == null)
			minMaxParser = Parse.num;

		this._min = Number.NaN;
		if (config.min != null)
			this._min = minMaxParser(config.min);

		this._max = Number.NaN;
		if (config.max != null)
			this._max = minMaxParser(config.max);

		accumulate(this);
	}

	// This class isn't Configurable due to the require constructor args,
	// but this method is still convenient for the serialization in Options
	get config(): OptionConfig {
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
	get text(): string {
		return this._text;
	}

	/**
	 * Whether the text should be displayed when the option is active or not.
	 */
	get textVisible(): boolean {
		return this._textVisible;
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
	get min(): number {
		return this._min;
	}

	/**
	 * The maximum value that the option will become active at (exclusive).
	 *
	 * If a `max` is provided, it must be greater than or equal to `min`
	 *
	 * When a `max` is not provided, it will default to +Infinity and no further
	 * options will be permitted in the set.
	 */
	get max(): number {
		return this._max;
	}

	/**
	 * The various actions associated with the option.
	 */
	get actions(): OptionActions {
		return this._actions;
	}

	/**
	 * Returns an "accumulator" function used to track state as options are added
	 * to a parent set.
	 */
	static accumulator(): OptionAccumulator {
		let names: Set<string> = new Set();
		let started: boolean = false;
		let closed: boolean = false;
		let rangeMin: number = Number.NEGATIVE_INFINITY;
		let rangeMax: number = Number.NaN;

		return (option: Option) => {
			if (closed)
				throw new Error("Previous entry missing max.");

			if (names.has(option.text))
				throw new Error("Duplicate option text '"+ option.text +"'");
			names.add(option.text);

			let hasMin: boolean = !Number.isNaN(option._min);
			let hasMax: boolean = !Number.isNaN(option._max);

			if (!started) {
				started = true;
				if (hasMin) {
					rangeMin = option._min;
				} else {
					option._min = rangeMin;
				}
			} else if (hasMin) {
				if (option._min != rangeMax) {
					throw new Error("min must match max from previous entry");
				}
			} else {
				option._min = rangeMax;
			}

			if (hasMax) {
				if (option._max < option._min) {
					throw new Error("max ("+ option._max +") must be greater or equal to than min ("+ option._min +")");
				}
			} else {
				option._max = Number.POSITIVE_INFINITY;
				closed = true;
			}

			rangeMax = option._max;
		};
	}
}

/**
 * A set of configuration options.
 */
export class Options
	implements Configurable<OptionsConfig>
{
	private _computation!: ComputationCallback;
	private _types: Option[] = [];

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	private static _initializeClass_Options: void = (() => {
		ClassRegistry.registerClass(
			"Options", Options,
			(obj: Options, serializer: Serializer): void => {
				serializer.writeProp(obj.config);
			},
			(obj: Options, data: SerializedData, deserializer: Deserializer): void => {
				obj.configure(deserializer.readProp(data) as OptionsConfig);
			}
		);
	})();

	constructor(config?: OptionsConfig) {
		if (config != null)
			this.configure(config);
	}

	protected get minMaxParseFunction(): undefined|((value:any) => number) {
		return undefined;
	}

	configure(config: OptionsConfig) {
		this.computation = Parse.required(parseCallback(config.computation), "computation");

		let accumulator: OptionAccumulator = Option.accumulator();
		this._types = Parse.array(
			config.types, [],
			(item: OptionConfig): Option => new Option(item, accumulator, this.minMaxParseFunction)
		);
	}

	get config(): OptionsConfig {
		return {
			computation: this.computation.sourceCode,
			types: this._types.map((item) => item.config)
		};
	}

	/**
	 * Computation to calculate the value used to identify the current state.
	 */
	get computation(): ComputationCallback {
		return this._computation;
	}

	set computation(value: ComputationCallback) {
		this._computation = value;
	}

	/**
	 * List of option configurations.
	 */
	get types(): ReadonlyArray<Option> {
		return this._types;
	}
}

export interface TemperatureOptionsConfig
	extends OptionsConfig
{
	// TODO: Add a temperature units (F/C) configuration?
}

export class TemperatureOptions
	extends Options
	implements Configurable<TemperatureOptionsConfig>
{
	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	private static _initializeClass_TemperatureOptions: void = (() => {
		ClassRegistry.registerClass(
			"TemperatureOptions", TemperatureOptions,
			(obj: TemperatureOptions, serializer: Serializer): void => {
				serializer.writeProp(obj.config);
			},
			(obj: TemperatureOptions, data: SerializedData, deserializer: Deserializer): void => {
				obj.configure(deserializer.readProp(data) as TemperatureOptionsConfig);
			}
		);
	})();

	constructor(config?: TemperatureOptionsConfig) {
		super(config);
	}

	protected get minMaxParseFunction(): undefined|((value:any) => number) {
		return Parse.temperature;
	}
}

export interface RecurringOptionsConfig
	extends OptionsConfig
{
	readonly interval?: string|number;
	readonly defaultRate: number;
}

export class RecurringOptions
	extends Options
	implements Configurable<RecurringOptionsConfig>
{
	private _defaultRate: number = 0;
	private _interval: number = 0;

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	private static _initializeClass_RecurringOptions: void = (() => {
		ClassRegistry.registerClass(
			"RecurringOptions", RecurringOptions,
			(obj: RecurringOptions, serializer: Serializer): void => {
				serializer.writeProp(obj.config);
			},
			(obj: RecurringOptions, data: SerializedData, deserializer: Deserializer): void => {
				obj.configure(deserializer.readProp(data) as RecurringOptionsConfig);
			}
		);
	})();

	constructor(config?: RecurringOptionsConfig) {
		super(config);
	}

	configure(config: RecurringOptionsConfig): void {
		super.configure(config);

		this.interval = Parse.duration(config.interval, "15M");
		this.defaultRate = Parse.num(config.defaultRate);
	}

	get config(): RecurringOptionsConfig {
		let config: any = super.config;
		config.defaultRate = this.defaultRate;
		config.interval = this.interval;
		return config;
	}

	get interval(): number {
		return this._interval;
	}

	set interval(value: number) {
		if (!(value > 0))
			throw new Error("interval must be greater than 0");

		this._interval = value;
	}

	get defaultRate(): number {
		return this._defaultRate;
	}

	set defaultRate(value: number) {
		if (Number.isNaN(value))
			throw new Error("defaultRate cannot be NaN");

		this._defaultRate = value;
	}
}


/*

Inebriation: InebriationOptions<MaxOption> (will need subtype for separate defaultRate values)

*/

