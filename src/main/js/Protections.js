import { ProtectionStat, ProtectionStatConfig } from "./ProtectionStat.js";
import { Parse } from "./Parse.js";
import { Configurable } from "./Configurable.js";
import { ClassRegistry } from "./Serializer.js";

/**
 * @interface
 */
export class ProtectionsConfig {
	/**
	 * @type {ProtectionStatConfig?}
	 */
	blunt;

	/**
	 * @type {ProtectionStatConfig?}
	 */
	sharp;

	/**
	 * @type {ProtectionStatConfig?}
	 */
	earth;

	/**
	 * @type {ProtectionStatConfig?}
	 */
	air;

	/**
	 * @type {ProtectionStatConfig?}
	 */
	fire;

	/**
	 * @type {ProtectionStatConfig?}
	 */
	water;

	/**
	 * @type {ProtectionStatConfig?}
	 */
	power;

	/**
	 * @type {ProtectionStatConfig?}
	 */
	magic;

	/**
	 * @type {ProtectionStatConfig?}
	 */
	good;

	/**
	 * @type {ProtectionStatConfig?}
	 */
	evil;

	/**
	 * @type {ProtectionStatConfig?}
	 */
	cold;
}

/**
 * Class containing values for all of the protections defined in the game.
 * Blunt, Sharp, Earth, Air, Fire, Water, Power, Mental/Magic, Good/Cleric, Evil, Cold
 *
 * @implements {Configurable<ProtectionsConfig>}
 */
export class Protections {

	/**
	 * @type {ProtectionStat}
	 * @readonly
	 */
	#blunt = new ProtectionStat();

	/**
	 * @type {ProtectionStat}
	 * @readonly
	 */
	#sharp = new ProtectionStat();

	/**
	 * @type {ProtectionStat}
	 * @readonly
	 */
	#earth = new ProtectionStat();

	/**
	 * @type {ProtectionStat}
	 * @readonly
	 */
	#air = new ProtectionStat();

	/**
	 * @type {ProtectionStat}
	 * @readonly
	 */
	#fire = new ProtectionStat();

	/**
	 * @type {ProtectionStat}
	 * @readonly
	 */
	#water = new ProtectionStat();

	/**
	 * @type {ProtectionStat}
	 * @readonly
	 */
	#power = new ProtectionStat();

	/**
	 * @type {ProtectionStat}
	 * @readonly
	 */
	#magic = new ProtectionStat();

	/**
	 * @type {ProtectionStat}
	 * @readonly
	 */
	#good = new ProtectionStat();

	/**
	 * @type {ProtectionStat}
	 * @readonly
	 */
	#evil = new ProtectionStat();

	/**
	 * @type {ProtectionStat}
	 * @readonly
	 */
	#cold = new ProtectionStat();

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	static #initializeClass_Protections = (() => {
		ClassRegistry.registerClass(
			"Protections", Protections,
			(obj, serializer) => {
				serializer.writeProp(obj.config);
			},
			(obj, data, deserializer) => {
				obj.configure(deserializer.readProp(data));
			}
		);
	})();

	/**
	 * Constructs a new Protections instance.
	 *
	 * @param {(ProtectionsConfig|Protections)?} config The configuration object.
	 */
	constructor(config) {
		this.configure(config);
	}

	/**
	 *
	 * @param {(ProtectionsConfig|Protections)?} config The configuration object.
	 */
	configure(config) {
		if (config instanceof Protections) {
			config = config.config;
		}

		this.#blunt.configure(Parse.getProp(config, null, "blunt"));
		this.#sharp.configure(Parse.getProp(config, null, "sharp"));
		this.#earth.configure(Parse.getProp(config, null, "earth"));
		this.#air.configure(Parse.getProp(config, null, "air"));
		this.#fire.configure(Parse.getProp(config, null, "fire"));
		this.#water.configure(Parse.getProp(config, null, "water"));
		this.#power.configure(Parse.getProp(config, null, "power"));
		this.#magic.configure(Parse.getProp(config, null, "magic"));
		this.#good.configure(Parse.getProp(config, null, "good"));
		this.#evil.configure(Parse.getProp(config, null, "evil"));
		this.#cold.configure(Parse.getProp(config, null, "cold"));
	} // constructor

	/**
	 * @type {ProtectionsConfig}
	 */
	get config() {
		return {
			blunt: this.#blunt.config,
			sharp: this.#sharp.config,
			earth: this.#earth.config,
			air: this.#air.config,
			fire: this.#fire.config,
			water: this.#water.config,
			power: this.#power.config,
			magic: this.#magic.config,
			good: this.#good.config,
			evil: this.#evil.config,
			cold: this.#cold.config
		};
	}

	/**
	 * The protection against 'blunt' damage.
	 */
	get blunt() {
		return this.#blunt;
	} // blunt

	/**
	 * The protection against 'sharp' damage.
	 */
	get sharp() {
		return this.#sharp;
	} // sharp

	/**
	 * The protection against 'earth' damage.
	 */
	get earth() {
		return this.#earth;
	} // earth

	/**
	 * The protection against 'air' damage.
	 */
	get air() {
		return this.#air;
	} // air

	/**
	 * The protection against 'fire' damage.
	 */
	get fire() {
		return this.#fire;
	} // fire

	/**
	 * The protection against 'water' damage.
	 */
	get water() {
		return this.#water;
	} // water

	/**
	 * The protection against 'power' damage.
	 */
	get power() {
		return this.#power;
	} // power

	/**
	 * The protection against 'magic' damage.
	 */
	get magic() {
		return this.#magic;
	} // magic

	/**
	 * The protection against 'good' damage.
	 */
	get good() {
		return this.#good;
	} // good

	/**
	 * The protection against 'evil' damage.
	 */
	get evil() {
		return this.#evil;
	} // evil

	/**
	 * The protection against 'cold' damage.
	 */
	get cold() {
		return this.#cold;
	} // cold

	/**
	 * Retrieves the protection with the given name.
	 * @param {string} name The name of the protection to retrieve (e.g. "blunt")
	 * @return {ProtectionStat} The protection with the given name.
	 * @throws Error if the name is not a valid protection name.
	 */
	get(name) {
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
	 * @return {Iterator<ProtectionStat>}
	 */
	[Symbol.iterator]() {
		/**
		 * @param {Protections} protections
		 * @return {Iterator<ProtectionStat>}
		 */
		function* createIterator(protections) {
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
