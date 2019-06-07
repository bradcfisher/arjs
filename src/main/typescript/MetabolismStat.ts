import { Stat, StatConfig } from "./Stat";
import { ClassRegistry, Serializer, Deserializer } from "./Serializer";

/**
 * Stat subclass which allows fractional effective values and reverses the calculation for bonus and penaly.
 */
export class MetabolismStat extends Stat {

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	private static _initializeClass_MetabolismStat: void = (() => {
		ClassRegistry.registerClass(
			"MetabolismStat", MetabolismStat,
			(obj: MetabolismStat, serializer: Serializer): void => {
				serializer.writeProp(obj.config);
			},
			(obj: MetabolismStat, data: any, deserializer: Deserializer): void => {
				obj.configure(deserializer.readProp(data) as StatConfig);
			}
		);
	})();

	/**
	 * Retrieves the effective value for this stat.
	 *
	 * The effective value is computed as `base - bonus + penalty` and is clamped
	 * to a minimum of `Stat.MIN_VALUE` and maximum of `Stat.MAX_VALUE`.
	 *
	 * @return	The effective value for this stat.
	 */
	get effective(): number {
		return Math.min(
			Math.max(
				this.base - this.bonus.amount + this.penalty.amount,
				Stat.MIN_VALUE
			),
			Stat.MAX_VALUE
		);
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
		(<any>this)._displayed = (value == null || Number.isNaN(value)
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

}
