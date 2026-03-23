import { Parse } from "./Parse.js"
import { ItemType, ItemTypeConfig, ItemTypeCategory, ItemTypeTrigger } from "./ItemType.js"
import { ClassRegistry } from "./Serializer.js";
import { Configurable } from "./Configurable.js";


/**
 * Enumeration of potion color values.
 * @enum {number}
 */
export const PotionItemTypeColor = Object.freeze({
	/**
	 * (0) - Clear
	 * @readonly
	 */
	Clear: 0,
	0: "Clear",

	/**
	 * (1) - Amber
	 * @readonly
	 */
	Amber: 1,
	1: "Amber",

	/**
	 * (2) - Silver
	 * @readonly
	 */
	Silver: 2,
	2: "Silver",

	/**
	 * (3) - Black
	 * @readonly
	 */
	Black: 3,
	3: "Black",

	/**
	 * (4) - Red
	 * @readonly
	 */
	Red: 4,
	4: "Red",

	/**
	 * (5) - White
	 * @readonly
	 */
	White: 5,
	5: "White",

	/**
	 * (6) - Green
	 * @readonly
	 */
	Green: 6,
	6: "Green",

	/**
	 * (7) - Yellow
	 * @readonly
	 */
	Yellow: 7,
	7: "Yellow",

	/**
	 * (8) - Orange
	 * @readonly
	 */
	Orange: 8,
	8: "Orange"
}); // Color

/**
 * Enumeration of potion taste values.
 * @enum {number}
 */
export const PotionItemTypeTaste = Object.freeze({
	/**
	 * (0) - Bitter
	 * @readonly
	 */
	Bitter: 0,
	0: "Bitter",

	/**
	 * (1) - Sweet
	 * @readonly
	 */
	Sweet: 1,
	1: "Sweet",

	/**
	 * (2) - Plain
	 * @readonly
	 */
	Plain: 2,
	2: "Plain",

	/**
	 * (3) - Sour
	 * @readonly
	 */
	Sour: 3,
	3: "Sour",

	/**
	 * (4) - Salty
	 * @readonly
	 */
	Salty: 4,
	4: "Salty",

	/**
	 * (5) - Acidic
	 * @readonly
	 */
	Acidic: 5,
	5: "Acidic",

	/**
	 * (6) - Alkaline
	 * @readonly
	 */
	Alkaline: 6,
	6: "Alkaline",

	/**
	 * (7) - Dry
	 * @readonly
	 */
	Dry: 7,
	7: "Dry"
}); // Taste

/**
 * Enumeration of potion sip values.
 * @enum {number}
 */
export const PotionItemTypeSip = Object.freeze({
	/**
	 * (0) - Safe
	 * @readonly
	 */
	Safe: 0,
	0: "Safe",

	/**
	 * (1) - Caution
	 * @readonly
	 */
	Caution: 1,
	1: "Caution",

	/**
	 * (2) - Dangerous
	 * @readonly
	 */
	Dangerous: 2,
	2: "Dangerous"
}); // Sip


/**
 * @interface
 */
export class PotionItemTypeConfig
	extends ItemTypeConfig
{
	/**
	 * @type {string|PotionItemTypeColor}
	 */
	color;

	/**
	 * @type {string|PotionItemTypeTaste}
	 */
	taste;

	/**
	 * @type {string|PotionItemTypeSip}
	 */
	sip;

	/**
	 * @type {number|string}
	 */
	instability;
}

/**
 * @enum {string}
 * @extends {ItemTypeTrigger}
 */
export const PotionItemTypeTrigger = Object.freeze(Object.assign({
	/**
	 * "color"
	 * @readonly
	 */
	color: "color",

	/**
	 * "taste"
	 * @readonly
	 */
	taste: "taste",

	/**
	 * "sip"
	 * @readonly
	 */
	sip: "sip"
}, ItemTypeTrigger));

/**
 * Potion item.
 * @implements {Configurable<PotionItemTypeConfig>}
 */
export class PotionItemType
	extends ItemType
{

	/**
	 * @type {PotionItemTypeColor}
	 */
	#color = PotionItemTypeColor.Clear;

	/**
	 * @type {PotionItemTypeTaste}
	 */
	#taste = PotionItemTypeTaste.Plain;

	/**
	 * @type {PotionItemTypeSip}
	 */
	#sip = PotionItemTypeSip.Safe;

	/**
	 * @type {number}
	 */
	#instability = 40;

	/**
	 * Static initializer for registering serialization
	 */
	static #initializeClass_PotionItemType = (() => {
		ClassRegistry.registerClass(
			"PotionItemType", PotionItemType,
			(obj, serializer)=> {
				serializer.writeProp(obj.config);
			},
			(obj, data, deserializer)=> {
				obj.configure(deserializer.readProp(data));
			}
		);
	})();

	/**
	 *
	 * @param {(PotionItemTypeConfig|PotionItemType)?} config
	 */
	constructor(config) {
		super();
		if (config != null) {
			this.configure(config);
		}
	}

	/**
	 * @protected
	 * @type {typeof PotionItemTypeTrigger}
	 */
	get triggerTypes() {
		return PotionItemTypeTrigger;
	}

	/**
	 *
	 * @param {PotionItemTypeConfig} config
	 */
	configure(config) {
		super.configure(config);

		this.#color = Parse.prop(config, ["color"], null,
			(val) => Parse.enum(PotionItemTypeColor, val));

		this.#taste = Parse.prop(config, ["taste"], null,
			(val) => Parse.enum(PotionItemTypeTaste, val));

		this.#sip = Parse.prop(config, ["sip"], null,
			(val) => Parse.enum(PotionItemTypeSip, val));

		this.#instability = Parse.prop(config, ["instability"], null,
			(val) => Parse.percent(val, 40, 255));
	}

	/**
	 * @type {PotionItemTypeConfig}
	 */
	get config() {
		return Object.assign(
			super.config,
			{
				color: this.color,
				taste: this.taste,
				sip: this.sip,
				instability: this.instability
			}
		);
	}

	/**
	 * The color of the potion.
	 * @type {typeof PotionItemTypeColor}
	 */
	get color() {
		return this.#color;
	}

	set color(value) {
		this.#color = value;
	}

	/**
	 * The taste of the potion.
	 * @type {PotionItemTypeTaste}
	 */
	get taste() {
		return this.#taste;
	}

	set taste(value) {
		this.#taste = value;
	}

	get sip() {
		return this.#sip;
	}

	set sip(value) {
		this.#sip = value;
	}

	get instability() {
		return this.#instability;
	}

	set instability(value) {
		if (!(value >= 0 && value <= 255))
			throw new Error("instability must be between 0 and 255");

		this.#instability = value;
	}

// TODO: Should these methods go in an Item subclass instead of this type class?

	inspectColor() {
		// Reveals the color
	}

	inspectTaste() {
		// Perform stability check.  Fail -> poof
		// Reveals the taste
	}

	inspectSip() {
		// Perform stability check.  Fail -> poof

		// Sip may also confer some of the potion's effect...  Not sure on the rules for that.

		// - If the potion is already identified, shows its name.
		// - Else the result depends on the player wisdom and a random value:
		//    Wisdom/2 + Random [0; 255]	Result
		//    [0; 128[						The player is unsure.
		//    [128; 256[					The risk is revealed.
		//    [256; +oo[					The potion is identified.
	}

	use() {
		// Perform stability check.  Fail -> poof
		// Execute the 'use' action

	}

}

ItemType.registerCategory(ItemTypeCategory.potion, PotionItemType);
