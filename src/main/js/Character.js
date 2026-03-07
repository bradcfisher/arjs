
import { Stat } from "./Stat.js"
import { Denizen } from "./Denizen.js"

/**
 * @readonly
 * @enum {number}
 */
export const Gender = Object.freeze({
	/**
	 * (0) A male character
	 * @readonly
	 */
	Male: 0,

	/**
	 * (1) A female character
	 * @readonly
	 */
	Female: 1
}); // Gender

/**
 * Class representing the player character.
 */
export class Character
	extends Denizen
{

	/**
	 * @type {Gender}
	 */
	#gender = Gender.Male;

	/**
	 * @type {number}
	 */
	#level = 0;

	/**
	 * @type {number}
	 */
	#requiredExperience = 200;

	/**
	 * @type {number}
	 */
	#experience = 0;

	/**
	 * @type {boolean}
	 */
	#delusion = false;

	/**
	 * @type {number|undefined}
	 */
	#delusionHp;

	/**
	 * @type {number}
	 */
	#hunger = 0;

	/**
	 * @readonly
	 * @type {Stat}
	 */
	#hungerRate = new Stat(0.5);

	/**
	 * @type {number}
	 */
	#fatigue = 0;

	/**
	 * @readonly
	 * @type {Stat}
	 */
	#fatigueRate = new Stat(0.5);

	/**
	 * @type {number}
	 */
	#thirst = 0;

	/**
	 * @readonly
	 * @type {Stat}
	 */
	#thirstRate = new Stat(0.5);

	/**
	 * @type {number}
	 */
	#digestion = 0;

	/**
	 * @readonly
	 * @type {Stat}
	 */
	#digestionRate = new Stat(0.5);

	/**
	 * Constructs a new character.
	 *
	 * @param {string} name The character name.  Cannot be empty string.
	 * @param {Gender} gender The character gender.
	 */
	constructor(name, gender) {
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
	 * The character's gender.
	 */
	get gender() {
		return this.#gender;
	} // gender

	/**
	 * Sets the character's gender.
	 * @param {Gender} gender The new gender for the character.
	 */
	set gender(gender) {
		this.#gender = gender;
	} // gender

	/**
	 * The character's current level.
	 */
	get level() {
		return this.#level;
	} // level

	/**
	 * The amount of experience required for the character to reach to the next level.
	 */
	get requiredExperience() {
		return this.#requiredExperience;
	} // requiredExperience

	/**
	 * The character's experience.
	 */
	get experience() {
		return this.#experience;
	} // experience

	/**
	 * Adds to the character's experience.
	 * @param {number} experienceGain The amount of experience to add.  Values of 0 or less will be ignored.
	 */
	addExperience(experienceGain) {
		if (experienceGain > 0) {
			this.#experience += experienceGain;
			this.#checkLevelUp();
			// TODO: Should an event be dispatched to notify of any level change, or should the method return something to indicate a level change occurred?
		}
	} // addExperience

	/**
	 * Processes any pending level up actions, if any.
	 */
	#checkLevelUp() {
		while (this.#experience >= this.#requiredExperience) {
			this.#requiredExperience *= 2;
			++this.#level;

			// HP & Max HP both increase based on effective stamina (note bonus & penalty included!)
			const hpIncrease = Math.round(Math.random() * this.stamina.effective);
			this.hpMaximum += hpIncrease;
			this.hp += hpIncrease;

			this.#increaseStatForLevelUp(this.stamina);
			this.#increaseStatForLevelUp(this.charisma);
			this.#increaseStatForLevelUp(this.strength);
			this.#increaseStatForLevelUp(this.intelligence);
			this.#increaseStatForLevelUp(this.wisdom);
			this.#increaseStatForLevelUp(this.skill);
			this.#increaseStatForLevelUp(this.speed);

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
	 *
	 * @param {Stat} stat the stat to level up.
	 */
	#increaseStatForLevelUp(stat) {
		stat.base += 0.5 + 0.5 * Math.random() * (Stat.MAX_VALUE - stat.base) / Stat.MAX_VALUE;
	} // increaseStatForLevelUp

	/**
	 * Whether the character is delusional or not.
	 */
	get delusion() {
		return this.#delusion;
	}

	set delusion(value) {
		this.#delusion = value;
	}

	/**
	 * The HP displayed when the character is delusional.
	 */
	get delusionHp() {
		return this.#delusionHp;
	}

	set delusionHp(value) {
		if (typeof value === "number")
			this.#delusionHp = Math.max(value, 0);
		else
			this.#delusionHp = undefined;
	}

	/**
	 * The current hunger level for the character.
	 */
	get hunger() {
		return this.#hunger;
	}

	set hunger(value) {
		if (Number.isNaN(value)) {
			throw new Error("hunger must be a valid number");
		}

		this.#hunger = Math.max(0, value);
	}

	/**
	 * The amount by which the character's hunger increases for each hunger interval.
	 */
	get hungerRate() {
		return this.#hungerRate;
	}

	/**
	 * The current fatigue level for the character.
	 */
	get fatigue() {
		return this.#fatigue;
	}

	set fatigue(value) {
		if (Number.isNaN(value)) {
			throw new Error("fatigue must be a valid number");
		}

		this.#fatigue = Math.max(0, value);
	}

	/**
	 * The amount by which the character's fatigue increases for each fatigue interval.
	 */
	get fatigueRate() {
		return this.#fatigueRate;
	}

	/**
	 * The current thirst level for the character.
	 */
	get thirst() {
		return this.#thirst;
	}

	set thirst(value) {
		if (Number.isNaN(value)) {
			throw new Error("thirst must be a valid number");
		}

		this.#thirst = Math.max(0, value);
	}

	/**
	 * The amount by which the character's thirst increases for each thirst interval.
	 */
	get thirstRate() {
		return this.#thirstRate;
	}

	/**
	 * The current digestion level for the character.
	 */
	get digestion() {
		return this.#digestion;
	}

	set digestion(value) {
		if (Number.isNaN(value))
			throw new Error("digestion must be a valid number");

		this.#digestion = Math.max(0, value);
	}

	/**
	 * The amount by which the character's digestion increases for each digestion interval.
	 */
	get digestionRate() {
		return this.#digestionRate;
	}

} // Character
