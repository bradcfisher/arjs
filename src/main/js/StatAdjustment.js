import { Parse } from "./Parse.js";
import { ClassRegistry } from "./Serializer.js"
import { StatAdjustments } from "./StatAdjustments.js";
import { Configurable } from "./Configurable.js";

/**
 * Configuration interface for stat adjustments.
 * @interface
 */
export class StatAdjustmentConfig {
	/**
	 * Type identifier for the adjustment.
	 * @type {string}
	 * @readonly
	 */
	type;

	/**
	 * Display name to use for the adjustment. (optional)
	 * @type {string?}
	 * @readonly
	 */
	name;

	/**
	 * The amount of the adjustment.
	 * This value must be greater than 0.
	 * @type {number}
	 * @readonly
	 */
	amount;

	/**
	 * The current expiration delay for the adjustment. (optional)
	 *
	 * If provided, the value must be greater than 0.
	 * If omitted, no expiration period is applied.
	 *
	 * @type {(string|number)?}
	 * @readonly
	 */
	expiration;
}

/**
 * Represents an adjustment (bonus or penalty) to a Denizen stat.
 * @implements {StatAdjustmentConfig}
 * @implements {Configurable<StatAdjustmentConfig>}
 */
export class StatAdjustment {

	/**
	 * @type {StatAdjustments}
	 * @reaodnly
	 */
	#root;

	/**
	 * @type {number}
	 */
	#amount = 1;

	/**
	 * @type {string}
	 */
	#type = "?";

	/**
	 * @type {string}
	 */
	#name = "";

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	static #initializeClass_StatAdjustment = (() => {
		ClassRegistry.registerClass(
			"StatAdjustment", StatAdjustment,
			(obj, serializer) => {
				serializer.writeProp(obj.config);
			},
			(obj, data, deserializer) => {
				obj.configure(deserializer.readProp(data));
			}
		);
	})();

	/**
	 * Constructs a new instance.
	 *
	 * @param {StatAdjustments} root
	 * @param {StatAdjustmentConfig?} config The configuration object to clone properties from.
	 */
	constructor(root, config) {
		this.#root = root;
		if (config != null) {
			this.configure(config);
		}
	}

	/**
	 * Updates this instance's values using a configuration object.
	 * @param {StatAdjustmentConfig} config The configuration to clone properties from.
	 */
	configure(config) {
		this.type = Parse.str(config.type);
		this.name = Parse.str(config.name == null ? this.name : config.name);
		this.amount = Parse.num(config.amount);
		this.expiration = (config.expiration == null ? Number.NaN : Parse.duration(config.expiration));
	}

	/**
	 * Retrieves a snapshot of the current adjustment state.
	 * @return {StatAdjustmentConfig} A snapshot of the current adjustment state.
	 */
	get config() {
		return {
			type: this.type,
			name: this.name,
			amount: this.amount,
			expiration: Number.isNaN(this.expiration) ? undefined : this.expiration
		};
	}

	/**
	 * The parent adjustments collection that this adjustment belongs to.
	 */
	get root() {
		return this.#root;
	}

	/**
	 * The amount of the adjustment.
	 * Must be greater than 0.
	 * @throws Error if the value is NaN or not greater than 0.
	 */
	get amount() {
		return this.#amount;
	}

	set amount(value) {
		if (!(value > 0)) { // Also catches NaN
			throw new Error("amount must be greater than 0");
		}

		this.#amount = Math.trunc(value);
	}

	/**
	 * The type identifier for the adjustment.
	 * Adjustments with the same `type` and `name` will be combined when applied to a stat.
	 */
	get type() {
		return this.#type;
	}

	set type(value) {
		this.#type = value;
	}

	/**
	 * The name of the adjustment.
	 * Adjustments with the same `type` and `name` will be combined when applied to a stat.
	 * Assigned values are trimmed of leading and trailing whitespace.
	 */
	get name() {
		return this.#name;
	}

	set name(value) {
		this.#name = value.trim();
	}

	/**
	 * The expiration delay for this adjustment, or `NaN` if the adjustment does not expire.
	 */
	get expiration() {
		return this.#root._getAdjustmentExpiration(this);
	}

	set expiration(value) {
		if (value != this.expiration) {
			if (value < 0) {
				throw new Error("expiration must be greater than 0");
			} else if (Number.isNaN(value)) {
				value = 0;
			}

			this.#root._setAdjustmentExpiration(this, value);
		}
	}
}
