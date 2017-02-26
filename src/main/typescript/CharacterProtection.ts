
/**
 * Class for representing a character protection from damage (eg. `blunt`, `sharp`, `earth`, `air`, etc.)
 */
export class CharacterProtection {

	/**
	 * @see [[base]]
	 */
	private _base: number = 0;

	/**
	 * @see [[proficiency]]
	 */
	private _proficiency: CharacterProtection.Proficiency = CharacterProtection.Proficiency.Normal;

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
		if (this._proficiency == CharacterProtection.Proficiency.Low)
			return 2;

		if (this._proficiency == CharacterProtection.Proficiency.Normal)
			return 1;

		if (this._proficiency == CharacterProtection.Proficiency.High)
			return 0.5;

		return 0;
	} // getDamageProficiencyFactor

} // CharacterProtection

export module CharacterProtection {

	export enum Proficiency {
		Low,
		Normal,
		High,
		Immune
	} // Proficiency

} // CharacterProtection
