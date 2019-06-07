import { ProtectionStat, ProtectionStatConfig } from "./ProtectionStat";
import { Parse } from "./Parse";
import { Configurable } from "./Configurable";
import { ClassRegistry, Serializer, Deserializer } from "./Serializer";

export interface ProtectionsConfig {
	blunt?: ProtectionStatConfig;
	sharp?: ProtectionStatConfig;
	earth?: ProtectionStatConfig;
	air?: ProtectionStatConfig;
	fire?: ProtectionStatConfig;
	water?: ProtectionStatConfig;
	power?: ProtectionStatConfig;
	magic?: ProtectionStatConfig;
	good?: ProtectionStatConfig;
	evil?: ProtectionStatConfig;
	cold?: ProtectionStatConfig;
}

/**
 * Class containing values for all of the protections defined in the game.
 * Blunt, Sharp, Earth, Air, Fire, Water, Power, Mental/Magic, Good/Cleric, Evil, Cold
 */
export class Protections
	implements Configurable<ProtectionsConfig>
{

	/**
	 * @see [[blunt]]
	 */
	private readonly _blunt: ProtectionStat = new ProtectionStat();

	/**
	 * @see [[sharp]]
	 */
	private readonly _sharp: ProtectionStat = new ProtectionStat();

	/**
	 * @see [[earth]]
	 */
	private readonly _earth: ProtectionStat = new ProtectionStat();

	/**
	 * @see [[air]]
	 */
	private readonly _air: ProtectionStat = new ProtectionStat();

	/**
	 * @see [[fire]]
	 */
	private readonly _fire: ProtectionStat = new ProtectionStat();

	/**
	 * @see [[water]]
	 */
	private readonly _water: ProtectionStat = new ProtectionStat();

	/**
	 * @see [[power]]
	 */
	private readonly _power: ProtectionStat = new ProtectionStat();

	/**
	 * @see [[magic]]
	 */
	private readonly _magic: ProtectionStat = new ProtectionStat();

	/**
	 * @see [[good]]
	 */
	private readonly _good: ProtectionStat = new ProtectionStat();

	/**
	 * @see [[evil]]
	 */
	private readonly _evil: ProtectionStat = new ProtectionStat();

	/**
	 * @see [[cold]]
	 */
	private readonly _cold: ProtectionStat = new ProtectionStat();

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	private static _initializeClass_Protections: void = (() => {
		ClassRegistry.registerClass(
			"Protections", Protections,
			(obj: Protections, serializer: Serializer): void => {
				serializer.writeProp(obj.config);
			},
			(obj: Protections, data: any, deserializer: Deserializer): void => {
				obj.configure(deserializer.readProp(data) as ProtectionsConfig);
			}
		);
	})();

	/**
	 * Constructs a new Protections instance.
	 *
	 * @param	config	The configuration object.
	 */
	constructor(config?: ProtectionsConfig|Protections) {
		this.configure(config);
	}

	configure(config: ProtectionsConfig|Protections|undefined|null) {
		if (config instanceof Protections)
			config = config.config;

		this._blunt.configure(Parse.getProp(config, null, "blunt"));
		this._sharp.configure(Parse.getProp(config, null, "sharp"));
		this._earth.configure(Parse.getProp(config, null, "earth"));
		this._air.configure(Parse.getProp(config, null, "air"));
		this._fire.configure(Parse.getProp(config, null, "fire"));
		this._water.configure(Parse.getProp(config, null, "water"));
		this._power.configure(Parse.getProp(config, null, "power"));
		this._magic.configure(Parse.getProp(config, null, "magic"));
		this._good.configure(Parse.getProp(config, null, "good"));
		this._evil.configure(Parse.getProp(config, null, "evil"));
		this._cold.configure(Parse.getProp(config, null, "cold"));
	} // constructor

	get config(): ProtectionsConfig {
		return {
			blunt: this._blunt.config,
			sharp: this._sharp.config,
			earth: this._earth.config,
			air: this._air.config,
			fire: this._fire.config,
			water: this._water.config,
			power: this._power.config,
			magic: this._magic.config,
			good: this._good.config,
			evil: this._evil.config,
			cold: this._cold.config
		};
	}

	/**
	 * Retrieves the protection against 'blunt' damage.
	 * @return	The protection against 'blunt' damage.
	 */
	get blunt(): ProtectionStat {
		return this._blunt;
	} // blunt

	/**
	 * Retrieves the protection against 'sharp' damage.
	 * @return	The protection against 'sharp' damage.
	 */
	get sharp(): ProtectionStat {
		return this._sharp;
	} // sharp

	/**
	 * Retrieves the protection against 'earth' damage.
	 * @return	The protection against 'earth' damage.
	 */
	get earth(): ProtectionStat {
		return this._earth;
	} // earth

	/**
	 * Retrieves the protection against 'air' damage.
	 * @return	The protection against 'air' damage.
	 */
	get air(): ProtectionStat {
		return this._air;
	} // air

	/**
	 * Retrieves the protection against 'fire' damage.
	 * @return	The protection against 'fire' damage.
	 */
	get fire(): ProtectionStat {
		return this._fire;
	} // fire

	/**
	 * Retrieves the protection against 'water' damage.
	 * @return	The protection against 'water' damage.
	 */
	get water(): ProtectionStat {
		return this._water;
	} // water

	/**
	 * Retrieves the protection against 'power' damage.
	 * @return	The protection against 'power' damage.
	 */
	get power(): ProtectionStat {
		return this._power;
	} // power

	/**
	 * Retrieves the protection against 'magic' (AKA mental) damage.
	 * @return	The protection against 'magic' damage.
	 */
	get magic(): ProtectionStat {
		return this._magic;
	} // magic

	/**
	 * Retrieves the protection against 'good' (AKA cleric) damage.
	 * @return	The protection against 'good' damage.
	 */
	get good(): ProtectionStat {
		return this._good;
	} // good

	/**
	 * Retrieves the protection against 'evil' damage.
	 * @return	The protection against 'evil' damage.
	 */
	get evil(): ProtectionStat {
		return this._evil;
	} // evil

	/**
	 * Retrieves the protection against 'cold' damage.
	 * @return	The protection against 'cold' damage.
	 */
	get cold(): ProtectionStat {
		return this._cold;
	} // cold

	/**
	 * Retrieves the protection with the given name.
	 * @param name The name of the protection to retrieve (e.g. "blunt")
	 * @return The protection with the given name.
	 * @throws Error if the name is not a valid protection name.
	 */
	get(name: string) {
		switch (name.toLowerCase()) {
			case "blunt": return this.blunt;
			case "sharp": return this.sharp;
			case "earth": return this.earth;
			case "air": return this.air;
			case "fire": return this.fire;
			case "water": return this.water;
			case "power": return this.power;
			case "magic": return this.magic;
			case "good": return this.good;
			case "evil": return this.evil;
			case "cold": return this.cold;
			default: throw new Error("Invalid protection name: "+ name);
		}
	}

	/**
	 * Iterates over each of the protections represented by this object.
	 */
	[Symbol.iterator](): Iterator<ProtectionStat> {
		function* createIterator(protections: Protections) {
			yield protections.blunt;
			yield protections.sharp;
			yield protections.earth;
			yield protections.air;
			yield protections.fire;
			yield protections.water;
			yield protections.power;
			yield protections.magic;
			yield protections.good;
			yield protections.evil;
			yield protections.cold;
		}
		return createIterator(this);
	}

} // Protections
