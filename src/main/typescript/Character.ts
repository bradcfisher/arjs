import { Entity } from "./Entity"
import { Stat } from "./Stat"
import { Denizen } from "./Denizen"

/**
 * Class representing the player character.
 */
export class Character
	extends Denizen
{

	/**
	 * @see [[gender]]
	 */
	private _gender: Character.Gender = Character.Gender.Male;

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
		super();

		this.name = name;
		this.gender = gender;

		this._requiredExperience = 200;	// For level up
		this._experience = 0;

		this.hp = this.hpMaximum = 10;
		this._level = 0;

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
		paralysis (remaining turns)
*/
	} // constructor

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
	 * Updates the character's hit points.
	 * @param	hp	The new value to assign to the character's hit points.  Will be clamped between
	 *				0 and the value of `hpMaximum`.
	 */
	set hp(hp: number) {
		super.hp = Math.min(hp, this._hpMaximum);
	} // hp

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
			this.hp += hpIncrease;

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
	private increaseStatForLevelUp(stat: Stat): void {
		stat.base += 0.5 + 0.5 * Math.random() * (Stat.MAX_VALUE - stat.base) / Stat.MAX_VALUE;
	} // increaseStatForLevelUp

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
		if (this.hp > this._hpMaximum)
			this.hp = this._hpMaximum;
	} // hpMaximum

} // Character

export module Character {
	export enum Gender {
		Male = 0,
		Female = 1
	} // Gender
} // Character