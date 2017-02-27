
/**
 * Class for representing a protection from damage (eg. `blunt`, `sharp`, `earth`, `air`, etc.)
 */
export class Protection {

	/**
	 * @see [[base]]
	 */
	private _base: number = 0;

	/**
	 * @see [[proficiency]]
	 */
	private _proficiency: Protection.Proficiency = Protection.Proficiency.Normal;

	/**
	 * Constructs a new Protection instance.
	 * @param	config	The config to inherit the protection values (base, proficiency) from.
	 * Example:
	 * ```typescript
	 * {
	 *   base: 25,
	 *   proficiency: "Normal"
	 * }
	 ```
	 */
	constructor(config?: any) {
		if (config) {
			if (config.base != null)
				this.base = config.base;

			if (config.proficiency != null)
				this.proficiency = config.proficiency;
		}
	} // constructor

	/**
	 * Retrieves the base value for this protection.
	 * @return	The base value for this protection.
	 */
	get base(): number {
		return this._base;
	} // base

	/**
	 * Sets a new base value for this protection.
	 * @param	base	The new base value for this protection, with a minimum bound of 0.
	 */
	set base(base: number) {
		this._base = Math.max(base, 0);
	} // base

	/**
	 * Retrieves the proficiency value for this protection.
	 * @return	The proficiency value for this protection.
	 */
	get proficiency(): number {
		return this._proficiency;
	} // proficiency

	/**
	 * Sets a new proficiency value for this protection.
	 * The proficiency 
	 * @param	base	The new proficiency value for this protection, bounded between 0 and 1.
	 */
	set proficiency(proficiency: number) {
		this._proficiency = Math.min(Math.max(proficiency, 0), 1);
	} // proficiency

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
		return Math.max(damage - Math.random() * this._base, 0);
	} // computeAdjustedDamage

	/**
	 * Proficiency factor is based on proficiency:
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
		return [1, 0.5, 2, 0][this._proficiency];
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
