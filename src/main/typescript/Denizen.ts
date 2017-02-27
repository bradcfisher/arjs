import { Parse } from "./Parse";
import { Stat } from "./Stat";
import { Protections } from "./Protections";
import { TreasureHolder } from "./TreasureHolder";

export class Denizen
	extends TreasureHolder
{

	/**
	 * @see [[name]]
	 */
	private _name: String = "?";

	/**
	 * @see [[stamina]]
	 */
	private _stamina: Stat;

	/**
	 * @see [[charisma]]
	 */
	private _charisma: Stat;

	/**
	 * @see [[strength]]
	 */
	private _strength: Stat;

	/**
	 * @see [[intelligence]]
	 */
	private _intelligence: Stat;

	/**
	 * @see [[wisdom]]
	 */
	private _wisdom: Stat;

	/**
	 * @see [[skill]]
	 */
	private _skill: Stat;

	/**
	 * @see [[speed]]
	 */
	private _speed: Stat;

	/**
	 * @see [[protection]]
	 */
	private _protection: Protections;

	/**
	 * @see [[alignment]]
	 */
	private _alignment: number;

	/**
	 * @see [[stealth]]
	 */
	private _stealth: number;

	/**
	 * @see [[hp]]
	 */
	private _hp: number;

	constructor(clone?: any) {
		super();

		this._stamina = new Stat(Parse.getProp(clone, 0, "stamina"));
		this._charisma = new Stat(Parse.getProp(clone, 0, "charisma"));
		this._strength = new Stat(Parse.getProp(clone, 0, "strength"));
		this._intelligence = new Stat(Parse.getProp(clone, 0, "intelligence"));
		this._wisdom = new Stat(Parse.getProp(clone, 0, "wisdom"));
		this._skill = new Stat(Parse.getProp(clone, 0, "skill"));
		this._speed = new Stat(Parse.getProp(clone, 13, "speed"));

		this._protection = new Protections(clone ? clone.protections : undefined);

		this.alignment = Parse.getProp(clone, 128 / 255, "alignment")
		this.stealth = Parse.getProp(clone, 32 / 255, "stealth") // Used for computing awareness in combat
	} // constructor

	/**
	 * Retrieves the character's name.
	 * @return	The character's name.
	 */
	get name(): String {
		return this._name;
	} // name

	/**
	 * Sets the character's name.
	 * @param	name	The new name for the character.
	 */
	set name(name: String) {
		name = name.trim();
		if (!name.length)
			throw new Error("The name cannot be empty");
		this._name = name;
	} // name

	/**
	 * Retrieves the Denizen's `stamina` stat.
	 * @return	The Denizen's `stamina` stat.
	 */
	get stamina(): Stat {
		return this._stamina;
	} // stamina

	/**
	 * Retrieves the Denizen's `charisma` stat.
	 * @return	The Denizen's `charisma` stat.
	 */
	get charisma(): Stat {
		return this._charisma;
	} // charisma

	/**
	 * Retrieves the Denizen's `strength` stat.
	 * @return	The Denizen's `strength` stat.
	 */
	get strength(): Stat {
		return this._strength;
	} // strength

	/**
	 * Retrieves the Denizen's `intelligence` stat.
	 * @return	The Denizen's `intelligence` stat.
	 */
	get intelligence(): Stat {
		return this._intelligence;
	} // intelligence

	/**
	 * Retrieves the Denizen's `wisdom` stat.
	 * @return	The Denizen's `wisdom` stat.
	 */
	get wisdom(): Stat {
		return this._wisdom;
	} // wisdom

	/**
	 * Retrieves the Denizen's `skill` stat.
	 * @return	The Denizen's `skill` stat.
	 */
	get skill(): Stat {
		return this._skill;
	} // skill

	/**
	 * Retrieves the Denizen's `speed` stat.
	 * @return	The Denizen's `speed` stat.
	 */
	get speed(): Stat {
		return this._speed;
	} // speed

	/**
	 * Retrieves the Denizen's alignment.
	 * @return	The Denizen's alignment as a number between 0 (pure evil) and 1.0 (pure good).
	 */
	get alignment(): number {
		return this._alignment;
	} // alignment

	/**
	 * Sets the Denizen's alignment.
	 * @param	alignment	The new value for the Denizen's alignment as a number between
	 *						0 (pure evil) and 1.0 (pure good).  Out of range values are clamped.
	 */
	set alignment(alignment: number) {
		this._alignment = Math.min(Math.max(alignment, 0), 1);
	} // alignment

	/**
	 * Retrieves the Denizen's stealth.
	 * @return	The Denizen's stealth as a number between 0 (always noticed) and 1.0 (never
	 *			noticed).
	 */
	get stealth(): number {
		return this._stealth;
	} // stealth

	/**
	 * Sets the Denizen's stealth.
	 * @param	stealth	The new value for the Denizen's stealth as a number between
	 *						0 (always noticed) and 1.0 (never noticed).  Out of range values are
	 *						clamped.
	 */
	set stealth(stealth: number) {
		this._stealth = Math.min(Math.max(stealth, 0), 1);
	} // stealth

	/**
	 * Retrieves the Denizen's hit points.
	 * @return	The Denizen's hit points.
	 */
	get hp(): number {
		return this._hp;
	} // hp

	/**
	 * Updates the Denizen's hit points.
	 * @param	hp	The new value to assign to the Denizen's hit points.  Will be clamped to
	 *				0 if less than 0.
	 */
	set hp(hp: number) {
		this._hp = Math.max(hp, 0);
	} // hp

} // Denizen
