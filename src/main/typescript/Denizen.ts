import { Parse } from "./Parse";
import { Stat, StatConfig } from "./Stat";
import { Protections, ProtectionsConfig } from "./Protections";
import { EffectTarget } from "./Effect";
import { ActiveEffectConfig } from "./Effect";
import { ActiveEffects, ReadonlyActiveEffects } from "./ActiveEffects";
import { Configurable } from "./Configurable";
import { Serializer, ClassRegistry, Deserializer } from "./Serializer";

export interface DenizenConfig
	//extends ItemHolderConfig
{
	readonly name: String;
	readonly stamina?: StatConfig;
	readonly charisma?: StatConfig;
	readonly strength?: StatConfig;
	readonly intelligence?: StatConfig;
	readonly wisdom?: StatConfig;
	readonly skill?: StatConfig;
	readonly speed?: StatConfig;
	readonly stealth?: StatConfig;
	readonly protection?: ProtectionsConfig;
	readonly alignment?: number;
	readonly hp?: number;
	readonly hpMaximum?: number;
	readonly paralysis?:number; // (only during encounter, remaining turns)
	readonly effects?: ReadonlyArray<ActiveEffectConfig>;
}

export abstract class Denizen
	//extends ItemHolder
	implements EffectTarget, Configurable<DenizenConfig>
{
	/**
	 * @see [[name]]
	 */
	private _name: String = "?";

	/**
	 * @see [[stamina]]
	 */
	private readonly _stamina: Stat = new Stat();

	/**
	 * @see [[charisma]]
	 */
	private readonly _charisma: Stat = new Stat();

	/**
	 * @see [[strength]]
	 */
	private readonly _strength: Stat = new Stat();

	/**
	 * @see [[intelligence]]
	 */
	private readonly _intelligence: Stat = new Stat();

	/**
	 * @see [[wisdom]]
	 */
	private readonly _wisdom: Stat = new Stat();

	/**
	 * @see [[skill]]
	 */
	private readonly _skill: Stat = new Stat();

	/**
	 * @see [[primaryStats]]
	 */
	private readonly _primaryStats: Map<string, Stat> = new Map();

	/**
	 * @see [[speed]]
	 */
	private readonly _speed: Stat = new Stat();

	/**
	 * @see [[protection]]
	 */
	private readonly _protection: Protections = new Protections();

	/**
	 * @see [[alignment]]
	 */
	private _alignment: number = 0.5;

	/**
	 * @see [[stealth]]
	 */
	private readonly _stealth: Stat = new Stat();

	/**
	 * @see [[hp]]
	 */
	private _hp: number = 1;

	/**
	 * @see [[hpMaximum]]
	 */
	private _hpMaximum: number = 1;

	/**
	 * @see [[paralysis]]
	 */
	private _paralysis: number = 0;

	private readonly _effects: ReadonlyActiveEffects = new ActiveEffects(this);

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	private static _initializeClass_Denizen: void = (() => {
		ClassRegistry.registerClass(
			"Denizen", Denizen,
			(obj: Denizen, serializer: Serializer): void => {
				serializer.writeProp(obj.config);
			},
			(obj: Denizen, data: any, deserializer: Deserializer): void => {
				obj.configure(deserializer.readProp(data) as DenizenConfig);
			}
		);
	})();

	/**
	 * Constructs a new Denizen instance.
	 * @param config The configuration object to clone values from.
	 */
	constructor(config?: DenizenConfig) {
		//super(config);
		if (config != null)
			this.configure(config);

		this.primaryStats.set("stamina", this._stamina);
		this.primaryStats.set("charisma", this._charisma);
		this.primaryStats.set("strength", this._strength);
		this.primaryStats.set("intelligence", this._intelligence);
		this.primaryStats.set("wisdom", this._wisdom);
		this.primaryStats.set("skill", this._skill);
	}

	configure(config: DenizenConfig): void {
		//super.configure(config);

		this._stamina.configure(Parse.getProp(config, 0, "stamina"));
		this._charisma.configure(Parse.getProp(config, 0, "charisma"));
		this._strength.configure(Parse.getProp(config, 0, "strength"));
		this._intelligence.configure(Parse.getProp(config, 0, "intelligence"));
		this._wisdom.configure(Parse.getProp(config, 0, "wisdom"));
		this._skill.configure(Parse.getProp(config, 0, "skill"));
		this._speed.configure(Parse.getProp(config, 13, "speed"));
		this._stealth.configure(Parse.getProp(config, 32, "stealth"));

		this._protection.configure(config.protection);

		this.alignment = Parse.num(Parse.getProp(config, 0, "alignment"))

		this.hp = Parse.num(Parse.getProp(config, 1, "hp"));
		this.hpMaximum = Parse.num(Parse.getProp(config, 1, "hpMaximum"));
		this.paralysis = Parse.num(Parse.getProp(config, 0, "paralysis"));

		this._effects.configure(config.effects);
	}

	get config(): DenizenConfig {
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
	 * Retrieves the Denizen's name.
	 * @return	The Denizen's name.
	 */
	get name(): String {
		return this._name;
	}

	/**
	 * Sets the Denizen's name.
	 * @param	name	The new name for the Denizen.
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
	}

	/**
	 * Retrieves the Denizen's `charisma` stat.
	 * @return	The Denizen's `charisma` stat.
	 */
	get charisma(): Stat {
		return this._charisma;
	}

	/**
	 * Retrieves the Denizen's `strength` stat.
	 * @return	The Denizen's `strength` stat.
	 */
	get strength(): Stat {
		return this._strength;
	}

	/**
	 * Retrieves the Denizen's `intelligence` stat.
	 * @return	The Denizen's `intelligence` stat.
	 */
	get intelligence(): Stat {
		return this._intelligence;
	}

	/**
	 * Retrieves the Denizen's `wisdom` stat.
	 * @return	The Denizen's `wisdom` stat.
	 */
	get wisdom(): Stat {
		return this._wisdom;
	}

	/**
	 * Retrieves the Denizen's `skill` stat.
	 * @return	The Denizen's `skill` stat.
	 */
	get skill(): Stat {
		return this._skill;
	}

	/**
	 * Retrieves a map of the Denizen's primary stats (stamina/charisma/strength/intelligence/wisdom/skill), keyed by name.
	 */
	get primaryStats(): Map<string, Stat> {
		return this._primaryStats;
	}

	/**
	 * Retrieves the Denizen's `speed` stat.
	 * @return	The Denizen's `speed` stat.
	 */
	get speed(): Stat {
		return this._speed;
	}

	/**
	 * Retrives the Denizen's `protection` values.
	 * @return The Denizen's `protection` values.
	 */
	get protection(): Protections {
		return this._protection;
	}

	/**
	 * Retrieves the Denizen's alignment.
	 * TODO: In other places (e.g. Item), alignment is defined as <0 is evil, 0 is neutral, >0 is good (presumably 2's complement signed byte?)
	 * @return	The Denizen's alignment as a number between 0 (pure evil) and 1.0 (pure good).
	 */
	get alignment(): number {
		return this._alignment;
	}

	/**
	 * Sets the Denizen's alignment.
	 * @param	alignment	The new value for the Denizen's alignment as a number between
	 *						0 (pure evil) and 1.0 (pure good).  Out of range values are clamped.
	 */
	set alignment(alignment: number) {
		this._alignment = Math.min(Math.max(alignment, 0), 1);
	}

	/**
	 * Retrieves the Denizen's stealth (AKA unnoticeability).
	 * @return	The Denizen's `stealth` stat.
	 */
	get stealth(): Stat {
		return this._stealth;
	}

	/**
	 * Retrieves the Denizen's hit points.
	 * @return	The Denizen's hit points.
	 */
	get hp(): number {
		return this._hp;
	}

	/**
	 * Updates the Denizen's hit points.
	 * @param	value The new value to assign to the Denizen's hit points.  Will be clamped
	 * 				between 0 and the value of `hpMaximum`.
	 */
	set hp(value: number) {
		this.hp = Math.max(Math.min(value, this._hpMaximum), 0);
	}

	/**
	 * Retrieves the Denizen's maximum hit points.
	 * @return	The Denizen's maximum hit points.
	 */
	get hpMaximum(): number {
		return this._hpMaximum;
	}

	/**
	 * Updates the Denizen's maximum hit points.
	 *
	 * If the new maximum is less than the current `hp`, the `hp` will also be clamped to the new
	 * maximum value.
	 *
	 * @param	hpMaximum	The new value to assign to the Denizen's maximum hit points.  If less
	 *						than 1, will be clamped to 1.
	 */
	set hpMaximum(hpMaximum: number) {
		this._hpMaximum = Math.max(1, hpMaximum);
		if (this.hp > this._hpMaximum)
			this.hp = this._hpMaximum;
	}

	/**
	 * Retrieves the number of encounter turns this Denizen will be paralyzed.
	 * @return	The number of turns the Denizen is paralyzed.
	 */
	get paralysis(): number {
		return this._paralysis;
	}

	/**
	 * Updates the number of encounter turns this Denizen will be paralyzed.
	 *
	 * @param	value	The new number of turns the Denizen will be paralyzed.  Will be
	 * 					clamped to a minimum of 0.
	 */
	set paralysis(value: number) {
		this._paralysis = Math.max(0, value);
	}

	/**
	 * The currently active effects for this Denizen.
	 */
	get effects(): ReadonlyActiveEffects {
		return this._effects;
	}
}