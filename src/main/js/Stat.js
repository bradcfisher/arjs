import { Parse } from "./Parse.js"
import { StatAdjustments } from "./StatAdjustments.js"
import { StatAdjustmentConfig } from "./StatAdjustment.js";
import { Configurable } from "./Configurable.js";
import { ClassRegistry, Deserializer } from "./Serializer.js";

/**
 * @interface
 */
export class StatConfig {

	/**
	 * @readonly
	 * @type {number?}
	 */
	base;

	/**
	 * @readonly
	 * @type {ReadonlyArray<StatAdjustmentConfig>?}
	 */
	bonus;

	/**
	 * @readonly
	 * @type {ReadonlyArray<StatAdjustmentConfig>?}
	 */
	penalty;

	/**
	 * @readonly
	 * @type {number}
	 */
	displayed;
}

/**
 * Base class for representing both player stats like `strength`, `intelligence`, as well as
 * metabolism change rates such as 'hunger', 'thrist', etc.
 *
 * Stat values range from a minimum of 0 to a maximum of 255.
 *
 * @abstract
 * @implements {Configurable<StatConfig>}
 */
export class Stat {

	/**
	 * The minimum value allowed for a stat.
	 * @readonly
	 * @type {number}
	 */
	static MIN_VALUE = 0;

	/**
	 * The maximum value allowed for a stat.
	 * @readonly
	 * @type {number}
	 */
	static MAX_VALUE = 255;

	/**
	 * @type {number}
	 */
	#base = Stat.MIN_VALUE;

	/**
	 * @readonly
	 * @type {StatAdjustments}
	 */
	#bonus = new StatAdjustments();

	/**
	 * @readonly
	 * @type {StatAdjustments}
	 */
	#penalty = new StatAdjustments();

	/**
	 * @type {number?}
	 */
	#displayed;

	/**
	 * Constructs a new Stat instance with the specified base value.
	 * The stat is created with no bonus or penalty.
	 *
	 * @param {(StatConfig|number)?} config	Configuration to apply to the stat, or the initial base
	 *        value for the stat. If not specified, the stat will be initialized to 0. If a base value
	 *        is specified, it will be clamped to a minimum of `Stat.MIN_VALUE` and maximum of
	 *        `Stat.MAX_VALUE`.
	 */
	constructor(config) {
		if (typeof config === "number")
			config = { "base": Parse.num(config) };

		if (config != null) {
			this.configure(config);
		}
	}

	/**
	 *
	 * @param {StatConfig} config
	 */
	configure(config) {
		this.base = Parse.num(Parse.getProp(config, Stat.MIN_VALUE, "base"));
		this.#bonus.configure(config ? config.bonus : null);
		this.#penalty.configure(config ? config.penalty : null);
		this.displayed = Parse.num(Parse.getProp(config, null, "displayed"), Number.NaN);
	}

	/**
	 * @type {StatConfig}
	 */
	get config() {
		return {
			base: this.#base,
			bonus: this.#bonus.config,
			penalty: this.#penalty.config,
			displayed: this.#displayed
		};
	}

	/**
	 * The base value for this stat.
	 */
	get base() {
		return this.#base;
	}

	/**
	 * Sets the base value for this stat.
	 * @param {number} base The new base value for this stat.  The specified value will be clamped
	 *        to a minimum of `Stat.MIN_VALUE` and maximum of `Stat.MAX_VALUE`.
	 */
	set base(base) {
		this.#base = Math.min(Math.max(base, Stat.MIN_VALUE), Stat.MAX_VALUE);
	}

	/**
	 * The current bonus adjustment state for this stat.
	 */
	get bonus() {
		return this.#bonus;
	}

	/**
	 * The current penalty adjustment state for this stat.
	 */
	get penalty() {
		return this.#penalty;
	}

	/**
	 * The current value to display for this stat.
	 * If a custom display value is assigned to this stat, then that value will be returned.
	 * Otherwise, returns the effective value for the stat.
	 * A custom display value is generally only assigned when the player is delusional.
	 */
	get displayed() {
		return (this.#displayed != null ? this.#displayed : this.effective);
	}

	/**
	 * Sets the override current value to display for this stat.
	 * A custom display value is generally only assigned when the player is delusional.
	 * @param {number} displayed The new override value to display for this stat, or `NaN`
	 *        to remove any existing override value.  The value provided is clamped to a
	 *        minimum of `Stat.MIN_VALUE` and maximum of `Stat.MAX_VALUE`.
	 */
	set displayed(value) {
		this.#displayed = (value == null || Number.isNaN(value)
			? undefined
			: Math.min(
				Math.max(
					value,
					Stat.MIN_VALUE
				),
				Stat.MAX_VALUE
			)
		);
	}

	/**
	 * The effective value for this stat.
	 *
	 * The effective value is computed as `base + bonus - penalty`
	 * to a minimum of `Stat.MIN_VALUE` and maximum of `Stat.MAX_VALUE`.
	 */
	get effective() {
		return Math.min(
			Math.max(
				this.#base + this.#bonus.amount - this.#penalty.amount,
				Stat.MIN_VALUE
			),
			Stat.MAX_VALUE
		);
	}

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	static #initializeClass_Stat = (() => {
		ClassRegistry.registerClass(
			"Stat", Stat,
			(obj, serializer) => {
				serializer.writeProp(obj.config);
			},
			(obj, data, deserializer) => {
				obj.configure(deserializer.readProp(data));
			}
		);
	})();

} // Stat
