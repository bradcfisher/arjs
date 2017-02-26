import { Entity } from "./Entity"
import { CharacterStat } from "./CharacterStat"

/**
 * Class representing the player character.
 */
export class Character {

	/**
	 * @see [[name]]
	 */
	private _name: String = "?";

	/**
	 * @see [[gender]]
	 */
	private _gender: Character.Gender = Character.Gender.Male;

	/**
	 * @see [[stamina]]
	 */
	private _stamina: CharacterStat;

	/**
	 * @see [[charisma]]
	 */
	private _charisma: CharacterStat;

	/**
	 * @see [[strength]]
	 */
	private _strength: CharacterStat;

	/**
	 * @see [[intelligence]]
	 */
	private _intelligence: CharacterStat;

	/**
	 * @see [[wisdom]]
	 */
	private _wisdom: CharacterStat;

	/**
	 * @see [[skill]]
	 */
	private _skill: CharacterStat;

	/**
	 * @see [[speed]]
	 */
	private _speed: CharacterStat;

	/**
	 * @see [[alignment]]
	 */
	private _alignment: number;

	/**
	 * @see [[stealth]]
	 */
	private _stealth: number;

	/**
	 * @see [[level]]
	 */
	private _level: number;

	/**
	 * @see [[requiredExperience]]
	 */
	private _requiredExperience: number;

	/**
	 * @see [[experience]]
	 */
	private _experience: number;

	/**
	 * @see [[hp]]
	 */
	private _hp: number;

	/**
	 * @see [[hpMaximum]]
	 */
	private _hpMaximum: number;

	/**
	 * Constructs a new character.
	 *
	 * @param	name	The character name.  Cannot be empty string.
	 * @param	gender	The character gender.
	 */
	constructor(name: String, gender: Character.Gender) {
		this.name = name;
		this.gender = gender;

		this._stamina = new CharacterStat();
		this._charisma = new CharacterStat();
		this._strength = new CharacterStat();
		this._intelligence = new CharacterStat();
		this._wisdom = new CharacterStat();
		this._skill = new CharacterStat();
		this._speed = new CharacterStat(13);

		this.alignment = 128 / 255;
		this.stealth = 32 / 255;	// Used for computing awareness in combat

		this._level = 0;

		this._requiredExperience = 200;	// For level up
		this._experience = 0;

		this.hp = this.hpMaximum = 10;

		// TODO: Finish remaining character attributes
		/*
		//treasure finding = luck?
		//this.treasureFinding = 0;
		//this.luck = 0;

		hunger
		hungerRate		// Determines how quickly the character gets hungry
		thirst
		thirstRate		// Determines how quickly the character gets thirsty
		fatigue			// Determines when sleep is needed
		fatigueRate		// Determines how quickly the character gets tired
		morale/happiness?	// Reference on wikipedia & elsewhere.  Not sure how it's used?
							// Decreases over time & increases when completing jobs, etc?
							// What effects would it have?
		digestion
		alcohol.bloodConcentration
		alcohol.intestineConcentration
		alcohol.digestionRate
		coordination
		balance
		warmth
		encumbrance
		clarity
		delusion
		invisibility
		paralysis

		protections (base & efficiency)
			Blunt
			Sharp
			Earth
			Air
			Fire
			Water
			Mental
			Power
			Good/Cleric
			Evil
			Cold

	// The following can also be stored in a guild locker?  Should break out as separate object.
		this.gold = 0;		//0-65535
		this.silver = 0;	//0-65535
		this.copper = 0;	//0-65535
		//gems (0-65535)
		//jewels (0-65535)
		//food packets (0-255)
		//water flasks (0-255)
		//torches (0-255)
		//crystals (0-255)
		//keys (0-255)
		//compasses (0-255)
		//timepieces (0-255)

		*/
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
	 * Retrieves the character's gender.
	 * @return	The character's gender.
	 */
	get gender(): Character.Gender {
		return this._gender;
	} // gender

	/**
	 * Sets the character's gender.
	 * @param	gender	The new gender for the character.
	 */
	set gender(gender: Character.Gender) {
		this._gender = gender;
	} // gender

	/**
	 * Retrieves the character's `stamina` stat.
	 * @return	The character's `stamina` stat.
	 */
	get stamina(): CharacterStat {
		return this._stamina;
	} // stamina

	/**
	 * Retrieves the character's `charisma` stat.
	 * @return	The character's `charisma` stat.
	 */
	get charisma(): CharacterStat {
		return this._charisma;
	} // charisma

	/**
	 * Retrieves the character's `strength` stat.
	 * @return	The character's `strength` stat.
	 */
	get strength(): CharacterStat {
		return this._strength;
	} // strength

	/**
	 * Retrieves the character's `intelligence` stat.
	 * @return	The character's `intelligence` stat.
	 */
	get intelligence(): CharacterStat {
		return this._intelligence;
	} // intelligence

	/**
	 * Retrieves the character's `wisdom` stat.
	 * @return	The character's `wisdom` stat.
	 */
	get wisdom(): CharacterStat {
		return this._wisdom;
	} // wisdom

	/**
	 * Retrieves the character's `skill` stat.
	 * @return	The character's `skill` stat.
	 */
	get skill(): CharacterStat {
		return this._skill;
	} // skill

	/**
	 * Retrieves the character's `speed` stat.
	 * @return	The character's `speed` stat.
	 */
	get speed(): CharacterStat {
		return this._speed;
	} // speed

	/**
	 * Retrieves the character's alignment.
	 * @return	The character's alignment as a number between 0 (pure evil) and 1.0 (pure good).
	 */
	get alignment(): number {
		return this._alignment;
	} // alignment

	/**
	 * Sets the character's alignment.
	 * @param	alignment	The new value for the character's alignment as a number between
	 *						0 (pure evil) and 1.0 (pure good).  Out of range values are clamped.
	 */
	set alignment(alignment: number) {
		this._alignment = Math.min(Math.max(alignment, 0), 1);
	} // alignment

	/**
	 * Retrieves the character's stealth.
	 * @return	The character's stealth as a number between 0 (always noticed) and 1.0 (never
	 *			noticed).
	 */
	get stealth(): number {
		return this._stealth;
	} // stealth

	/**
	 * Sets the character's stealth.
	 * @param	stealth	The new value for the character's stealth as a number between
	 *						0 (always noticed) and 1.0 (never noticed).  Out of range values are
	 *						clamped.
	 */
	set stealth(stealth: number) {
		this._stealth = Math.min(Math.max(stealth, 0), 1);
	} // stealth

	/**
	 * Retrieves the character's current level.
	 * @return	The character's current level.
	 */
	get level(): number {
		return this._level;
	} // level

	/**
	 * Retrieves the amount of experience required for the character to reach to the next level.
	 * @return	The amount of experience required for the character to reach to the next level.
	 */
	get requiredExperience(): number {
		return this._requiredExperience;
	} // requiredExperience

	/**
	 * Retrieves the character's experience.
	 * @return	The character's experience.
	 */
	get experience(): number {
		return this._experience;
	} // experience

	/**
	 * Adds to the character's experience.
	 * @param	experienceGain	The amount of experience to add.  Values of 0 or less will be ignored.
	 */
	addExperience(experienceGain: number): void {
		if (experienceGain > 0) {
			this._experience += experienceGain;
			this.checkLevelUp();
		}
	} // addExperience

	/**
	 * Processes any pending level up actions, if any.
	 */
	private checkLevelUp(): void {
		while (this._experience >= this._requiredExperience) {
			this._requiredExperience *= 2;
			++this._level;

			// HP & Max HP both increase based on effective stamina (note bonus & penalty included!)
			let hpIncrease: number = Math.round(Math.random() * this.stamina.effective);
			this._hpMaximum += hpIncrease;
			this._hp += hpIncrease;

			this.increaseStatForLevelUp(this.stamina);
			this.increaseStatForLevelUp(this.charisma);
			this.increaseStatForLevelUp(this.strength);
			this.increaseStatForLevelUp(this.intelligence);
			this.increaseStatForLevelUp(this.wisdom);
			this.increaseStatForLevelUp(this.skill);
			this.increaseStatForLevelUp(this.speed);
		}
	} // checkLevelUp

	/**
	 * Increases the specified stat for a level up.
	 *
	 * The stat increase is computed as:
	 * ```typescript
	 * base += 0.5 + 0.5 * Math.random() * (MAX_STAT_VALUE - base) / MAX_STAT_VALUE;
	 * ```
	 *
	 * Therefore, the higher the base stat value is, the lower the amount that may awarded.
	 */
	private increaseStatForLevelUp(stat: CharacterStat): void {
		stat.base += 0.5 + 0.5 * Math.random() * (CharacterStat.MAX_VALUE - stat.base) / CharacterStat.MAX_VALUE;
	} // increaseStatForLevelUp

	/**
	 * Retrieves the character's hit points.
	 * @return	The character's hit points.
	 */
	get hp(): number {
		return this._hp;
	} // hp

	/**
	 * Updates the character's hit points.
	 * @param	hp	The new value to assign to the character's hit points.  Will be clamped between
	 *				0 and the value of `hpMaximum`.
	 */
	set hp(hp: number) {
		this._hp = Math.min(Math.max(hp, 0), this._hpMaximum);
	} // hp

	/**
	 * Retrieves the character's maximum hit points.
	 * @return	The character's maximum hit points.
	 */
	get hpMaximum(): number {
		return this._hpMaximum;
	} // hpMaximum

	/**
	 * Updates the character's maximum hit points.
	 *
	 * If the new maximum is less than the current `hp`, the `hp` will also be clamped to the new
	 * maximum value.
	 *
	 * @param	hpMaximum	The new value to assign to the character's maximum hit points.  If less
	 *						than 1, will be clamped to 1.
	 */
	set hpMaximum(hpMaximum: number) {
		this._hpMaximum = Math.max(1, hpMaximum);
		if (this._hp > this._hpMaximum)
			this._hp = this._hpMaximum;
	} // hpMaximum

} // Character

export module Character {
	export enum Gender {
		Male = 0,
		Female = 1
	} // Gender
} // Character