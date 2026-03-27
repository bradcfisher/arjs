import { Parse } from "./Parse.js";
import { Stat, StatConfig } from "./Stat.js";
import { ClassRegistry } from "./Serializer.js";
import { Configurable } from "./Configurable.js";


/**
 * Enumeration of protection proficiency levels.
 * @enum {number}
 */
export const ProtectionProficiency = Object.freeze({
	/**
	 * (0) - Normal
	 * @readonly
	 */
	Normal: 0,

	/**
	 * (1) - High
	 * @readonly
	 */
	High: 1,

	/**
	 * (2) - Low
	 * @readonly
	 */
	Low: 2,

	/**
	 * (3) - Immune
	 * @readonly
	 */
	Immune: 3
}); // ProtectionProficiency

/**
 * @interface
 */
export class ProtectionStatConfig extends StatConfig {
	/**
	 * @readonly
	 * @type {(number|string|ProtectionProficiency)?}
	 */
	baseProficiency;

	/**
	 * @readonly
	 * @type {(number|string|ProtectionProficiency)?}
	 */
	overrideProficiency;
}

/**
 * Class for representing a protection from damage (eg. `blunt`, `sharp`, `earth`, `air`, etc.)
 *
 * @implements {Configurable<ProtectionStatConfig>}
 */
export class ProtectionStat
	extends Stat
{

	/**
	 * @readonly
	 * @type {ProtectionProficiency}
	 */
	#baseProficiency = ProtectionProficiency.Normal;

	/**
	 * @readonly
	 * @type {ProtectionProficiency?}
	 */
	#overrideProficiency;

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	static #initializeClass_ProtectionStat = (() => {
		ClassRegistry.registerClass(
			"ProtectionStat", ProtectionStat,
			(obj, serializer) => {
				serializer.writeProp(obj.config);
			},
			(obj, data, deserializer) => {
				obj.configure(deserializer.readProp(data));
			}
		);
	})();

	/**
	 * Constructs a new Protection instance.
	 * @param {ProtectionStatConfig?} config The config to inherit the protection values (base, proficiency) from.
	 */
	constructor(config) {
		super(config);
	}

	/**
	 *
	 * @param {ProtectionStatConfig} config
	 */
	configure(config) {
		super.configure(config);

		this.baseProficiency = Parse.num(Parse.getProp(config, ProtectionProficiency.Low, "baseProficiency"));
		this.overrideProficiency = Parse.num(Parse.getProp(config, ProtectionProficiency.Low, "overrideProficiency"));
	}

	/**
	 * @type {ProtectionStatConfig}
	 */
	get config() {
		let config = super.config;
		config.baseProficiency = this.baseProficiency;
		config.overrideProficiency = this.overrideProficiency;
		return config;
	}

	/**
	 * The base proficiency value for this protection.
	 *
	 * One of Normal, High, Low, Immune.
	 *
	 * @type {ProtectionProficiency}
	 */
	get baseProficiency() {
		return this.#baseProficiency;
	} // baseProficiency

	set baseProficiency(value) {
		this.#baseProficiency = value;
	} // proficiency

	/**
	 * The override proficiency value for this protection.
	 *
	 * When set, the override proficiency value is reported by `effectiveProficiency`
	 * instead of the `baseProficiency`.  This value will typically only be manipulated by
	 * an `activeEffect`, such as an Invulnerability Potion, etc.
	 *
	 * @type {ProtectionProficiency}
	 */
	get overrideProficiency() {
		return this.#overrideProficiency;
	} // overrideProficiency

	set overrideProficiency(value) {
		this.#overrideProficiency = value;
	} // overrideProficiency

	/**
	 * The proficiency value for this protection.
	 * @type {ProtectionProficiency}
	 */
	get effectiveProficiency() {
		return ((this.#overrideProficiency == null)
			? this.#baseProficiency
			: this.#overrideProficiency);
	} // effectiveProficiency

	/**
	 * Computes an adjusted damage value after application of this protection.
	 *
	 * The computation performed is:
	 *  - Multiply the damage by the damage proficiency factor (see [[getDamageProficiencyFactor]])
	 *  - Subtract Math.random() * this.base from the damage
	 *
	 * @param {number} damage The damage amount to adjust.
	 * @return Adjusted damage value after application of this protection.
	 */
	computeAdjustedDamage(damage) {
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
	 * @return {number} The computed efficiency factor.
	 */
	getDamageProficiencyFactor() {
		return proficiencyFactors[this.effectiveProficiency];
	} // getDamageProficiencyFactor

} // Protection


/**
 * @type {{[key: number]: number}}
 */
const proficiencyFactors = {}
proficiencyFactors[ProtectionProficiency.Immune] = 0;
proficiencyFactors[ProtectionProficiency.High] = 0.5;
proficiencyFactors[ProtectionProficiency.Normal] = 1;
proficiencyFactors[ProtectionProficiency.Low] = 2;
Object.freeze(proficiencyFactors);
