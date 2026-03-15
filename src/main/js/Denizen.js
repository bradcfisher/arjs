import { Parse } from "./Parse.js";
import { Stat, StatConfig } from "./Stat.js";
import { Protections, ProtectionsConfig } from "./Protections.js";
import { EffectTarget } from "./Effect.js";
import { ActiveEffectConfig } from "./Effect.js";
import { ActiveEffects, ReadonlyActiveEffects } from "./ActiveEffects.js";
import { Configurable } from "./Configurable.js";
import { ClassRegistry } from "./Serializer.js";

/**
 * @interface
 */
export class DenizenConfig
	//extends ItemHolderConfig
{
	/**
	 * @readonly
	 * @type {string}
	 */
	name;

	/**
	 * @readonly
	 * @type {StatConfig?}
	 */
	stamina;

	/**
	 * @readonly
	 * @type {StatConfig?}
	 */
	charisma;

	/**
	 * @readonly
	 * @type {StatConfig?}
	 */
	strength;

	/**
	 * @readonly
	 * @type {StatConfig?}
	 */
	intelligence;

	/**
	 * @readonly
	 * @type {StatConfig?}
	 */
	wisdom;

	/**
	 * @readonly
	 * @type {StatConfig?}
	 */
	skill;

	/**
	 * @readonly
	 * @type {StatConfig?}
	 */
	speed;

	/**
	 * @readonly
	 * @type {StatConfig?}
	 */
	stealth;

	/**
	 * @readonly
	 * @type {ProtectionsConfig?}
	 */
	protection;

	/**
	 * @readonly
	 * @type {number?}
	 */
	alignment;

	/**
	 * @readonly
	 * @type {number?}
	 */
	hp;

	/**
	 * @readonly
	 * @type {number?}
	 */
	hpMaximum;

	/**
	 * @readonly
	 * @type {number?}
	 */
	paralysis; // (only during encounter, remaining turns)

	/**
	 * @readonly
	 * @type {ReadonlyArray<ActiveEffectConfig>?}
	 */
	effects;
}

/**
 * @abstract
 * @implements {EffectTarget}
 * @implements {Configurable<DenizenConfig>}
 */
export class Denizen
	//extends ItemHolder
{
	/**
	 * @type {string}
	 */
	#name = "?";

	/**
	 * @readonly
	 * @type {Stat}
	 */
	#stamina = new Stat();

	/**
	 * @readonly
	 * @type {Stat}
	 */
	#charisma = new Stat();

	/**
	 * @readonly
	 * @type {Stat}
	 */
	#strength = new Stat();

	/**
	 * @readonly
	 * @type {Stat}
	 */
	#intelligence = new Stat();

	/**
	 * @readonly
	 * @type {Stat}
	 */
	#wisdom = new Stat();

	/**
	 * @readonly
	 * @type {Stat}
	 */
	#skill = new Stat();

	/**
	 * @readonly
	 * @type {Map<string, Stat>}
	 */
	#primaryStats = new Map();

	/**
	 * @readonly
	 * @type {Stat}
	 */
	#speed = new Stat();

	/**
	 * @readonly
	 * @type {Protections}
	 */
	#protection = new Protections();

	/**
	 * @readonly
	 * @type {number}
	 */
	#alignment = 0.5;

	/**
	 * @readonly
	 * @type {Stat}
	 */
	#stealth = new Stat();

	/**
	 * @readonly
	 * @type {number}
	 */
	#hp = 1;

	/**
	 * @readonly
	 * @type {number}
	 */
	#hpMaximum = 1;

	/**
	 * @readonly
	 * @type {number}
	 */
	#paralysis = 0;

	/**
	 * @readonly
	 * @type {ReadonlyActiveEffects}
	 */
	#effects = new ActiveEffects(this);

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	static #initializeClass_Denizen = (() => {
		ClassRegistry.registerClass(
			"Denizen", Denizen,
			(obj, serializer) => {
				serializer.writeProp(obj.config);
			},
			(obj, data, deserializer) => {
				obj.configure(deserializer.readProp(data));
			}
		);
	})();

	/**
	 * Constructs a new Denizen instance.
	 * @param {DenizenConfig?} config The configuration object to clone values from.
	 */
	constructor(config) {
		//super(config);
		if (config != null) {
			this.configure(config);
		}

		this.primaryStats.set("stamina", this.#stamina);
		this.primaryStats.set("charisma", this.#charisma);
		this.primaryStats.set("strength", this.#strength);
		this.primaryStats.set("intelligence", this.#intelligence);
		this.primaryStats.set("wisdom", this.#wisdom);
		this.primaryStats.set("skill", this.#skill);
	}

	/**
	 *
	 * @param {DenizenConfig} config
	 */
	configure(config) {
		//super.configure(config);

		this.#stamina.configure(Parse.getProp(config, 0, "stamina"));
		this.#charisma.configure(Parse.getProp(config, 0, "charisma"));
		this.#strength.configure(Parse.getProp(config, 0, "strength"));
		this.#intelligence.configure(Parse.getProp(config, 0, "intelligence"));
		this.#wisdom.configure(Parse.getProp(config, 0, "wisdom"));
		this.#skill.configure(Parse.getProp(config, 0, "skill"));
		this.#speed.configure(Parse.getProp(config, 13, "speed"));
		this.#stealth.configure(Parse.getProp(config, 32, "stealth"));

		this.#protection.configure(config.protection);

		this.alignment = Parse.num(Parse.getProp(config, 0, "alignment"))

		this.hp = Parse.num(Parse.getProp(config, 1, "hp"));
		this.hpMaximum = Parse.num(Parse.getProp(config, 1, "hpMaximum"));
		this.paralysis = Parse.num(Parse.getProp(config, 0, "paralysis"));

		this.#effects.configure(config.effects);
	}

	/**
	 * @return {DenizenConfig}
	 */
	get config() {
		// TODO: make sure to call the super class' config and merge it in
		return {
			name: this.name,
			stamina: this.stamina.config,
			charisma: this.charisma.config,
			strength: this.strength.config,
			intelligence: this.intelligence.config,
			wisdom: this.wisdom.config,
			skill: this.skill.config,
			speed: this.speed.config,
			stealth: this.stealth.config,
			protection: this.protection.config,
			alignment: this.alignment,
			hp: this.hp,
			hpMaximum: this.hpMaximum,
			paralysis: this.paralysis,
			effects: this.effects.config
		}
	}

	/**
	 * The Denizen's name.
	 */
	get name() {
		return this.#name;
	}

	set name(name) {
		name = name == null ? "" : String(name).trim();
		if (!name.length) {
			throw new Error("The name cannot be empty");
		}
		this.#name = name;
	} // name

	/**
	 * The Denizen's `stamina` stat.
	 */
	get stamina() {
		return this.#stamina;
	}

	/**
	 * The Denizen's `charisma` stat.
	 */
	get charisma() {
		return this.#charisma;
	}

	/**
	 * The Denizen's `strength` stat.
	 */
	get strength() {
		return this.#strength;
	}

	/**
	 * The Denizen's `intelligence` stat.
	 */
	get intelligence() {
		return this.#intelligence;
	}

	/**
	 * The Denizen's `wisdom` stat.
	 */
	get wisdom() {
		return this.#wisdom;
	}

	/**
	 * The Denizen's `skill` stat.
	 */
	get skill() {
		return this.#skill;
	}

	/**
	 * A map of the Denizen's primary stats (stamina/charisma/strength/intelligence/wisdom/skill), keyed by name.
	 */
	get primaryStats() {
		return this.#primaryStats;
	}

	/**
	 * The Denizen's `speed` stat.
	 */
	get speed() {
		return this.#speed;
	}

	/**
	 * The Denizen's `protection` values.
	 */
	get protection() {
		return this.#protection;
	}

	/**
	 * The Denizen's alignment as a number between 0 (pure evil) and 1.0 (pure good).
	 * TODO: In other places (e.g. Item), alignment is defined as <0 is evil, 0 is neutral, >0 is good (presumably 2's complement signed byte?)
	 */
	get alignment() {
		return this.#alignment;
	}

	set alignment(alignment) {
		this.#alignment = Math.min(Math.max(alignment, 0), 1);
	}

	/**
	 * The Denizen's `stealth` stat (AKA unnoticeability).
	 */
	get stealth() {
		return this.#stealth;
	}

	/**
	 * The Denizen's hit points.
	 * Updates will be clamped between 0 and the value of `hpMaximum`.
	 */
	get hp() {
		return this.#hp;
	}

	set hp(value) {
		this.#hp = Math.max(Math.min(value, this.#hpMaximum), 0);
	}

	/**
	 * The Denizen's maximum hit points.
	 *
	 * If this is updated and the new maximum is less than the current `hp`, the `hp` will also be clamped to the new
	 * maximum value.
	 *
	 * Values less than 1 will be clamped to 1.
	 */
	get hpMaximum() {
		return this.#hpMaximum;
	}

	set hpMaximum(hpMaximum) {
		this.#hpMaximum = Math.max(1, hpMaximum);
		if (this.hp > this.#hpMaximum)
			this.hp = this.#hpMaximum;
	}

	/**
	 * The number of encounter turns the Denizen is paralyzed.
	 *
	 * Updates will be clamped to a minimum of 0.
	 */
	get paralysis() {
		return this.#paralysis;
	}

	set paralysis(value) {
		this.#paralysis = Math.max(0, value);
	}

	/**
	 * The currently active effects for this Denizen.
	 */
	get effects() {
		return this.#effects;
	}
}