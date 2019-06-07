import { Parse } from "./Parse";
import { Stat, StatConfig } from "./Stat";
import { ClassRegistry, Serializer, Deserializer } from "./Serializer";
import { Configurable } from "./Configurable";

export interface ProtectionStatConfig extends StatConfig {
	baseProficiency?: number|string|Protection.Proficiency;
	overrideProficiency?: number|string|Protection.Proficiency;
}

/**
 * Class for representing a protection from damage (eg. `blunt`, `sharp`, `earth`, `air`, etc.)
 */
export class ProtectionStat
	extends Stat
	implements Configurable<ProtectionStatConfig>
{

	/**
	 * @see [[baseProficiency]]
	 * @see [[effectiveProficiency]]
	 */
	private _baseProficiency: Protection.Proficiency = Protection.Proficiency.Normal;

	/**
	 * @see [[overrideProficiency]]
	 * @see [[effectiveProficiency]]
	 * @see [[activeEffect]]
	 */
	private _overrideProficiency?: Protection.Proficiency;

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	private static _initializeClass_ProtectionStat: void = (() => {
		ClassRegistry.registerClass(
			"ProtectionStat", ProtectionStat,
			(obj: ProtectionStat, serializer: Serializer): void => {
				serializer.writeProp(obj.config);
			},
			(obj: ProtectionStat, data: any, deserializer: Deserializer): void => {
				obj.configure(deserializer.readProp(data) as ProtectionStatConfig);
			}
		);
	})();

	/**
	 * Constructs a new Protection instance.
	 * @param	config	The config to inherit the protection values (base, proficiency) from.
	 */
	constructor(config?: ProtectionStatConfig) {
		super(config);
	}

	configure(config: ProtectionStatConfig): void {
		super.configure(config);

		this.baseProficiency = Parse.num(Parse.getProp(config, Protection.Proficiency.Low, "baseProficiency"));
		this.overrideProficiency = Parse.num(Parse.getProp(config, Protection.Proficiency.Low, "overrideProficiency"));
	}

	get config(): ProtectionStatConfig {
		let config: any = super.config;
		config.baseProficiency = this.baseProficiency;
		config.overrideProficiency = this.overrideProficiency;
		return config;
	}

	/**
	 * Retrieves the base proficiency value for this protection.
	 * @return	The base proficiency value for this protection.
	 */
	get baseProficiency(): Protection.Proficiency {
		return this._baseProficiency;
	} // baseProficiency

	/**
	 * Sets a new base proficiency value for this protection.
	 * @param	value	The new proficiency value for this protection.
	 * 					One of Normal, High, Low, Immune.
	 */
	set baseProficiency(value: Protection.Proficiency) {
		this._baseProficiency = value;
	} // proficiency

	/**
	 * Retrieves the override proficiency value for this protection.
	 *
	 * When set, the override proficiency value is reported by `effectiveProficiency`
	 * instead of the `baseProficiency`.  This value will typically only be manipulated by
	 * an `activeEffect`, such as an Invulnerability Potion, etc.
	 *
	 * @return	The override proficiency value for this protection.
	 */
	get overrideProficiency(): Protection.Proficiency|undefined {
		return this._overrideProficiency;
	} // overrideProficiency

	/**
	 * Sets a new override proficiency value for this protection.
	 * @param	value	The new override proficiency value for this protection.
	 * 					One of Normal, High, Low, Immune.
	 */
	set overrideProficiency(value: Protection.Proficiency|undefined) {
		this._overrideProficiency = value;
	} // overrideProficiency

	/**
	 * Retrieves the proficiency value for this protection.
	 * @return	The proficiency value for this protection.
	 */
	get effectiveProficiency(): Protection.Proficiency {
		return ((this._overrideProficiency == null)
			? this._baseProficiency
			: this._overrideProficiency);
	} // effectiveProficiency

	/**
	 * Computes an adjusted damage value after application of this protection.
	 *
	 * The computation performed is:
	 *  - Multiply the damage by the damage proficiency factor (see [[getDamageProficiencyFactor]])
	 *  - Subtract Math.random() * this._base from the damage
	 *
	 * @param	damage	The damage amount to adjust.
	 * @return	Adjusted damage value after application of this protection.
	 */
	computeAdjustedDamage(damage: number): number {
		damage *= this.getDamageProficiencyFactor();
		return Math.max(damage - Math.random() * this.base, 0);
	} // computeAdjustedDamage

	/**
	 * Proficiency factor is based on the effective proficiency:
	 *
	 *	Proficiency		Factor
	 *	Low				x2
	 *	Normal			x1
	 *	High			x0.5
	 *	Immune			x0
	 *
	 * @return	The computed efficiency factor.
	 */
	getDamageProficiencyFactor(): number {
		return proficiencyFactors[this.effectiveProficiency];
	} // getDamageProficiencyFactor

} // Protection

export module Protection {

	/**
	 * Enumeration of protection proficiency levels.
	 */
	export enum Proficiency {
		Normal = 0,
		High = 1,
		Low = 2,
		Immune = 3
	} // Proficiency

} // Protection

let proficiencyFactors: {[key: number]:number} = (
	function(proficiencyFactors: {[key: number]:number}): {[key: number]:number} {
		proficiencyFactors[Protection.Proficiency.Immune] = 0;
		proficiencyFactors[Protection.Proficiency.High] = 0.5;
		proficiencyFactors[Protection.Proficiency.Normal] = 1;
		proficiencyFactors[Protection.Proficiency.Low] = 2;
		return proficiencyFactors;
	}
)({});
