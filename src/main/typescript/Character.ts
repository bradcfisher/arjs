
import { Stat } from "./Stat"
import { Denizen } from "./Denizen"
import { MetabolismStat } from "./MetabolismStat";

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
	private _level: number = 0;

	/**
	 * @see [[requiredExperience]]
	 */
	private _requiredExperience: number = 200;

	/**
	 * @see [[experience]]
	 */
	private _experience: number = 0;

	/**
	 * @see [[delusion]]
	 */
	private _delusion: boolean = false;

	/**
	 * @see [[delusionHp]]
	 */
	private _delusionHp: number|undefined;

	/**
	 * @see [[hunger]]
	 */
	private _hunger: number = 0;

	/**
	 * @see [[hungerRate]]
	 */
	private readonly _hungerRate: MetabolismStat = new MetabolismStat(0.5);

	/**
	 * @see [[fatigue]]
	 */
	private _fatigue = 0;

	/**
	 * @see [[fatigueRate]]
	 */
	private readonly _fatigueRate: MetabolismStat = new MetabolismStat(0.5);

	/**
	 * @see [[thirst]]
	 */
	private _thirst = 0;

	/**
	 * @see [[thirstRate]]
	 */
	private readonly _thirstRate: MetabolismStat = new MetabolismStat(0.5);

	/**
	 * @see [[digestion]]
	 */
	private _digestion = 0;

	/**
	 * @see [[digestionRate]]
	 */
	private readonly _digestionRate: MetabolismStat = new MetabolismStat(0.5);

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

		this.hp = this.hpMaximum = 10;

		// TODO: Finish remaining character attributes
/*
		//this.treasureFinding: TreasureFinding = new TreasureFinding(0);
		// If you have treasure finding > 0, your chance to find treasure is increased
		// by your treasure finding level, if you find that treasure you will get the
		// maximum number of items possible for that monster, or at least 1 item in
		// the event the maximum possible is 0. Then your treasure finding level drops
		// by one.
		// TODO: Perhaps this should be a list of adjustments with timeouts?  For example, the Treasure Finding spell will expire and should remove any remaining treasure finding for the spell, but probably shouldn't remove any due to a potion, etc.

		morale/happiness?	// Reference on wikipedia & elsewhere.  Not sure how it's used?
							// Decreases over time & increases when completing jobs, etc?
							// What effects would it have?

		alcohol.bloodConcentration  // Can be cured over time, or by visiting healer
		alcohol.bloodDigestionRate = 3;

		alcohol.intestineConcentration
		alcohol.digestionRate
		alcohol.blackoutDuration // Number of game minutes before end of blackout

		coordination // When affected, bottom status screen randomly changes. (boolean? set by inebriation)
		balance  // When affected, random moves occur. (boolean? set by inebriation)

		warmth/temperature
		protectionFromLowTemperature - This probably doesn't exist in the original game, but could lead to some intersting items/effects
		protectionFromHighTemperature - Affected by clothing worn

		encumbrance: number;	// The character can carry a base weight of 224 units. The
								// encumbrance is defined by the following formula:
								// 	encumbrance = carried weight - (effective strength + 224)

		blindness: number  // affected by inebriation (0 = can see; >0 sight affected (decreased brightness of screen?) [0-255])
		clarity: boolean // affected by Cold/Hot effect
		delusion: boolean // Character is delusional (cure by visiting healer)

		invisibility: boolean // Invisible to all but magical and elemental monsters
			// Nullified/cancelled by rain or removing all of your clothing

		TODO: Need to track whether the character "knows" a particular potion?  Possibly only for potions held, and not for new potions?
		TODO: Need to track item inventory (treasure/potions/spells/etc)
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
			// TODO: Should an event be dispatched to notify of any level change, or should the method return something to indicate a level change occurred?
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
			this.hpMaximum += hpIncrease;
			this.hp += hpIncrease;

			this.increaseStatForLevelUp(this.stamina);
			this.increaseStatForLevelUp(this.charisma);
			this.increaseStatForLevelUp(this.strength);
			this.increaseStatForLevelUp(this.intelligence);
			this.increaseStatForLevelUp(this.wisdom);
			this.increaseStatForLevelUp(this.skill);
			this.increaseStatForLevelUp(this.speed);

			// TODO: Should an event be dispatched to notify of the level change, or should the method return something to indicate a level change occurred?
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

	get delusion(): boolean {
		return this._delusion;
	}

	set delusion(value: boolean) {
		this._delusion = value;
	}

	get delusionHp(): number|undefined {
		return this._delusionHp;
	}

	set delusionHp(value: number|undefined) {
		if (typeof value === "number")
			this._delusionHp = Math.max(value, 0);
		else
			this._delusionHp = undefined;
	}

	/**
	 * The current hunger level for the character.
	 */
	get hunger(): number {
		return this._hunger;
	}

	set hunger(value: number) {
		if (Number.isNaN(value))
			throw new Error("hunger must be a valid number");

		this._hunger = Math.max(0, value);
	}

	/**
	 * The amount at which the character's hunger increases for each hunger interval.
	 */
	hungerRate(): MetabolismStat {
		return this._hungerRate;
	}

	/**
	 * The current fatigue level for the character.
	 */
	get fatigue(): number {
		return this._fatigue;
	}

	set fatigue(value: number) {
		if (Number.isNaN(value))
			throw new Error("fatigue must be a valid number");

		this._fatigue = Math.max(0, value);
	}

	/**
	 * The amount at which the character's fatigue increases for each fatigue interval.
	 */
	fatigueRate(): MetabolismStat {
		return this._fatigueRate;
	}

	/**
	 * The current thirst level for the character.
	 */
	get thirst(): number {
		return this._thirst;
	}

	set thirst(value: number) {
		if (Number.isNaN(value))
			throw new Error("thirst must be a valid number");

		this._thirst = Math.max(0, value);
	}

	/**
	 * The amount at which the character's thirst increases for each thirst interval.
	 */
	thirstRate(): MetabolismStat {
		return this._thirstRate;
	}

	/**
	 * The current digestion level for the character.
	 */
	get digestion(): number {
		return this._digestion;
	}

	set digestion(value: number) {
		if (Number.isNaN(value))
			throw new Error("digestion must be a valid number");

		this._digestion = Math.max(0, value);
	}

	/**
	 * The amount at which the character's digestion increases for each digestion interval.
	 */
	digestionRate(): MetabolismStat {
		return this._digestionRate;
	}

} // Character


export module Character {
	export enum Gender {
		Male = 0,
		Female = 1
	} // Gender
} // Character