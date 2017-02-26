
/**
 * Class for representing a character stat like `strength`, `intelligence`, etc.
 *
 * Stat values range from a minimum of 0 to a maximum of 255.
 */
export class CharacterStat {

	/**
	 * The maximum value allowed for a character stat.
	 */
	static readonly MIN_VALUE: number = 0;

	/**
	 * The minimum value allowed for a character stat.
	 */
	static readonly MAX_VALUE: number = 255;

	/**
	 * @see [[base]]
	 */
	private _base: number;

	/**
	 * @see [[bonus]]
	 */
	private _bonus: number = 0;

	/**
	 * @see [[penalty]]
	 */
	private _penalty: number = 0;

	/**
	 * @see [[displayed]]
	 */
	private _displayed?: number;

	/**
	 * Constructs a new CharacterStat instance with the specified base value.
	 * The stat is created with no bonus or penalty.
	 * @param	base	The initial base value for the stat.  If not specified, the stat will be
	 *					initialized to 0.
	 */
	constructor(base?: number) {
		this.base = (base === undefined ? CharacterStat.MIN_VALUE : base);
	} // constructor

	/**
	 * Retrieves the base value for this stat.
	 * @return	The base value for this stat.
	 */
	get base(): number {
		return this._base;
	} // base

	/**
	 * Sets the base value for this stat.
	 * @param	base	The new base value for this stat.
	 */
	set base(base: number) {
		this._base = Math.max(base, CharacterStat.MIN_VALUE);
	} // base

	/**
	 * Retrieves the current bonus for this stat.
	 * @return	The current bonus for this stat (always an integer).
	 */
	get bonus(): number {
		return this._bonus;
	} // bonus

	/**
	 * Sets the current bonus for this stat.
	 * @param	bonus	The new bonus to apply to this stat.  Any fractional portion of this value
	 *					will be dropped, and negative values will be clamped to 0.
	 */
	set bonus(bonus: number) {
		this._bonus = Math.max(Math.trunc(bonus), 0);
	} // bonus

	/**
	 * Retrieves the current penalty for this stat.
	 * @return	The current penalty for this stat (always an integer).
	 */
	get penalty(): number {
		return this._penalty;
	} // penalty

	/**
	 * Sets the current penalty for this stat.
	 * @param	bonus	The new penalty to apply to this stat.  Any fractional portion of this value
	 *					will be dropped, and negative values will be clamped to 0.
	 */
	set penalty(penalty: number) {
		this._penalty = Math.max(Math.trunc(penalty), 0);
	} // penalty

	/**
	 * Retrieves the current value to display for this stat.
	 * If a custom display value is assigned to this stat, then that value will be returned.
	 * Otherwise, returns the effective value for the stat.
	 * A custom display value is generally only assigned when the character is delusional, etc.
	 * @return	The current value to display for this stat (always an integer).
	 */
	get displayed(): number {
		return (this._displayed !== undefined ? this._displayed : this.effective);
	} // displayed

	/**
	 * Sets the override current value to display for this stat.
	 * A custom display value is generally only assigned when the character is delusional, etc.
	 * @param	displayed	The new override value to display for this stat, or `undefined`/`null`
	 *						to remove any existing override value.
	 */
	overrideDisplay(displayed: number|undefined|null):void {
		this._displayed = (displayed == null
			? undefined
			: Math.min(
				Math.max(
					Math.trunc(displayed),
					CharacterStat.MIN_VALUE
				),
				CharacterStat.MAX_VALUE
			)
		);
	} // overrideDisplay

	/**
	 * Retrieves the effective value for this stat.
	 * The effective value is computed as `Math.trunc(base) + bonus - penalty` and is clamped to 0.
	 * @return	The effective value for this stat.
	 */
	get effective(): number {
		return Math.min(
			Math.max(
				Math.trunc(this._base) + this._bonus - this._penalty,
				CharacterStat.MIN_VALUE
			),
			CharacterStat.MAX_VALUE
		);
	} // effective

} // CharacterStat
