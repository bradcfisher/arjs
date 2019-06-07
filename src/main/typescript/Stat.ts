import { Parse } from "./Parse"
import { StatAdjustments } from "./StatAdjustments"
import { StatAdjustmentConfig } from "./StatAdjustment";
import { Configurable } from "./Configurable";
import { ClassRegistry, Serializer, Deserializer } from "./Serializer";

export interface StatConfig {
	readonly base?: number;
	readonly bonus?: ReadonlyArray<StatAdjustmentConfig>;
	readonly penalty?: ReadonlyArray<StatAdjustmentConfig>;
	readonly displayed?: number;
}

/**
 * Class for representing a character stat like `strength`, `intelligence`, etc.
 *
 * Stat values range from a minimum of 0 to a maximum of 255.
 */
export class Stat
	implements Configurable<StatConfig>
{

	/**
	 * The minimum value allowed for a character stat.
	 */
	static readonly MIN_VALUE: number = 0;

	/**
	 * The maximum value allowed for a character stat.
	 */
	static readonly MAX_VALUE: number = 255;

	/**
	 * @see [[base]]
	 */
	private _base: number = Stat.MIN_VALUE;

	/**
	 * @see [[bonus]]
	 */
	private readonly _bonus: StatAdjustments = new StatAdjustments();

	/**
	 * @see [[penalty]]
	 */
	private readonly _penalty: StatAdjustments = new StatAdjustments();

	/**
	 * @see [[displayed]]
	 */
	private _displayed?: number;

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	private static _initializeClass_Stat: void = (() => {
		ClassRegistry.registerClass(
			"Stat", Stat,
			(obj: Stat, serializer: Serializer): void => {
				serializer.writeProp(obj.config);
			},
			(obj: Stat, data: any, deserializer: Deserializer): void => {
				obj.configure(deserializer.readProp(data) as StatConfig);
			}
		);
	})();

	/**
	 * Constructs a new Stat instance with the specified base value.
	 * The stat is created with no bonus or penalty.
	 *
	 * @param	config	Configuration to apply to the stat, or the initial base value for the stat.
	 *					If not specified, the stat will be initialized to 0. If a vase value is
	 *					specified, it will be clamped to a minimum of `Stat.MIN_VALUE` and maximum
	 *					of `Stat.MAX_VALUE`.
	 */
	constructor(config?: StatConfig|number) {
		if (typeof config === "number")
			config = { "base": Parse.num(config) };

		if (config != null)
			this.configure(config);
	}

	configure(config: StatConfig): void {
		this.base = Parse.num(Parse.getProp(config, Stat.MIN_VALUE, "base"));
		this._bonus.configure(config.bonus);
		this._penalty.configure(config.penalty);
		this.displayed = Parse.num(Parse.getProp(config, null, "displayed"), Number.NaN);
	}

	get config(): StatConfig {
		return {
			base: this._base,
			bonus: this._bonus.config,
			penalty: this._penalty.config,
			displayed: this._displayed
		};
	}

	/**
	 * Retrieves the base value for this stat.
	 * @return	The base value for this stat.
	 */
	get base(): number {
		return this._base;
	}

	/**
	 * Sets the base value for this stat.
	 * @param	base	The new base value for this stat.  The specified value will be clamped
	 *					to a minimum of `Stat.MIN_VALUE` and maximum of `Stat.MAX_VALUE`.
	 */
	set base(base: number) {
		this._base = Math.min(Math.max(base, Stat.MIN_VALUE), Stat.MAX_VALUE);
	}

	/**
	 * Retrieves the current bonus adjustment state for this stat.
	 * @return	The current bonus adjustment state for this stat.
	 */
	get bonus(): StatAdjustments {
		return this._bonus;
	}

	/**
	 * Retrieves the current penalty adjustment state for this stat.
	 * @return	The current penalty adjustment state for this stat.
	 */
	get penalty(): StatAdjustments {
		return this._penalty;
	}

	/**
	 * Retrieves the current value to display for this stat.
	 * If a custom display value is assigned to this stat, then that value will be returned.
	 * Otherwise, returns the effective value for the stat.
	 * A custom display value is generally only assigned when the character is delusional.
	 * @return	The current value to display for this stat (always an integer).
	 */
	get displayed(): number {
		return (this._displayed !== undefined ? this._displayed : this.effective);
	}

	/**
	 * Sets the override current value to display for this stat.
	 * A custom display value is generally only assigned when the character is delusional.
	 * @param	displayed	The new override value to display for this stat, or `NaN`
	 *						to remove any existing override value.  The value provided is
	 *						truncated and clamped to a minimum of `Stat.MIN_VALUE` and
	 *						maximum of `Stat.MAX_VALUE`.
	 */
	set displayed(value: number) {
		this._displayed = (value == null || Number.isNaN(value)
			? undefined
			: Math.min(
				Math.max(
					Math.trunc(value),
					Stat.MIN_VALUE
				),
				Stat.MAX_VALUE
			)
		);
	}

	/**
	 * Retrieves the effective value for this stat.
	 *
	 * The effective value is computed as `Math.trunc(base) + Math.trunc(bonus - penalty)`
	 * to a minimum of `Stat.MIN_VALUE` and maximum of `Stat.MAX_VALUE`.
	 *
	 * @return	The effective value for this stat.
	 */
	get effective(): number {
		return Math.min(
			Math.max(
				Math.trunc(this._base + Math.trunc(this._bonus.amount - this._penalty.amount)),
				Stat.MIN_VALUE
			),
			Stat.MAX_VALUE
		);
	}

} // Stat
