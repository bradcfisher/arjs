import { Parse } from "./Parse";
import { ClassRegistry, Serializer, Deserializer } from "./Serializer"
import { StatAdjustments } from "./StatAdjustments";
import { Configurable } from "./Configurable";

interface StatAdjustmentsEx {
	getAdjustmentExpiration(adjustment: StatAdjustment): number;
	setAdjustmentExpiration(adjustment: StatAdjustment, expiration: number|undefined): void;
}

/**
 * Configuration interface for stat adjustments.
 */
export interface StatAdjustmentConfig {
	/**
	 * Type identifier for the adjustment.
	 */
	readonly type: string;

	/**
	 * Display name to use for the adjustment. (optional)
	 */
	readonly name?: string;

	/**
	 * The amount of the adjustment.
	 * Thsi value must be greater than 0.
	 */
	readonly amount: number;

	/**
	 * The current expiration delay for the adjustment. (optional)
	 * If provided, the value must be greater than 0.
	 */
	readonly expiration?: string|number;
}

/**
 * Represents an adjustment (bonus or penalty) to a Denizen stat.
 */
export class StatAdjustment
	implements StatAdjustmentConfig, Configurable<StatAdjustmentConfig>
{

	/**
	 * @see [[root]];
	 */
	private readonly _root: StatAdjustments&StatAdjustmentsEx;

	/**
	 * @see [[amount]]
	 */
	private _amount: number = 1;

	/**
	 * @see [[type]]
	 */
	private _type: string = "?";

	/**
	 * @see [[name]]
	 */
	private _name: string = "";

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	private static _initializeClass_StatAdjustment: void = (() => {
		ClassRegistry.registerClass(
			"StatAdjustment", StatAdjustment,
			(obj: StatAdjustment, serializer: Serializer): void => {
				serializer.writeProp(obj.config);
			},
			(obj: StatAdjustment, data: any, deserializer: Deserializer): void => {
				obj.configure(deserializer.readProp(data) as StatAdjustmentConfig);
			}
		);
	})();

	/**
	 * Constructs a new instance.
	 *
	 * @param config The configuration object to clone properties from.
	 */
	constructor(root: StatAdjustments, config?: StatAdjustmentConfig) {
		this._root = root as StatAdjustments&StatAdjustmentsEx;
		if (config != null) {
			this.configure(config);
		}
	}

	/**
	 * Updates this instances values using a configuration object.
	 * @param config The configuration to clone properties from.
	 */
	configure(config: StatAdjustmentConfig): void {
		this.type = Parse.str(config.type);
		this.name = Parse.str(config.name == null ? this.name : config.name);
		this.amount = Parse.num(config.amount);
		this.expiration = (config.expiration == null ? Number.NaN : Parse.duration(config.expiration));
	}

	/**
	 * Retrieves a snapshot of the current adjustment state.
	 * @return A snapshot of the current adjustment state.
	 */
	get config(): StatAdjustmentConfig {
		return {
			type: this.type,
			name: this.name,
			amount: this.amount,
			expiration: Number.isNaN(this.expiration) ? undefined : this.expiration
		};
	}

	/**
	 * Retrieves the parent adjustments collection that this adjustment belongs to.
	 * @return The parent adjustments collection that this adjustment belongs to.
	 */
	get root(): StatAdjustments {
		return this._root;
	}

	/**
	 * Retrieves the amount of the adjustment.
	 * @return The amount of the adjustment.
	 */
	get amount(): number {
		return this._amount;
	}

	/**
	 * Sets the amount of the adjustment.
	 * @param value The new adjustment amount.  Must be greater than 0, and any
	 *			fractional portion will be dropped.
	 * @throws Error if the value is NaN or not greater than 0.
	 */
	set amount(value: number) {
		if (!(value > 0)) // Also catches NaN
			throw new Error("amount must be greater than 0");

		this._amount = Math.trunc(value);
	}

	/**
	 * Retrieves the type identifier for the adjustment.
	 * Adjustments with the same `type` and `name` will be combined when applied to a stat.
	 * @return The type identifier for the adjustment.
	 */
	get type(): string {
		return this._type;
	}

	/**
	 * Sets the type identifier for the adjustment.
	 * @param value	The new type identifier.
	 */
	set type(value: string) {
		this._type = value;
	}

	/**
	 * Retrieves the name of the adjustment.
	 * Adjustments with the same `type` and `name` will be combined when applied to a stat.
	 * @return The name of the adjustment.
	 */
	get name(): string {
		return this._name;
	}

	/**
	 * Sets the name of the adjustment.
	 * @param value	The new adjustment name.  This value is trimmed of leading and trailing
	 *				whitespace.
	 */
	set name(value: string) {
		this._name = value.trim();
	}

	/**
	 * Retrieves the expiration delay for this adjustment.
	 * @return The expiration delay for this adjustment, or `NaN` if the adjustment does not
	 *		expire.
	 */
	get expiration(): number {
		return (this._root as StatAdjustmentsEx).getAdjustmentExpiration(this);
	}

	set expiration(value: number) {
		if (value != this.expiration) {
			if (value < 0)
				throw new Error("expiration must be greater than 0");
			else if (Number.isNaN(value))
				value = 0;

			(this._root as StatAdjustmentsEx).setAdjustmentExpiration(this, value);
		}
	}
}

ClassRegistry.registerClass(
	"StatAdjustment", StatAdjustment,
	(adj: StatAdjustment, serializer: Serializer): void => {
		serializer.writeObject(adj.config);
	},
	(adj: StatAdjustment, data: any, deserializer: Deserializer): void => {
		adj.configure(deserializer.readObject(data) as StatAdjustmentConfig);
	}
);