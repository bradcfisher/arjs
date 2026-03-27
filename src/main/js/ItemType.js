
import { Parse } from "./Parse.js"
import { LatentEffectConfig } from "./Effect.js"
import { LatentEffects, ReadonlyLatentEffects } from "./LatentEffects.js"
import { ClassRegistry } from "./Serializer.js";
import { Configurable } from "./Configurable.js";

/**
 * @enum {string}
 */
export const ItemTypeCategory = Object.freeze({
	/**
	 * "currency"
	 * @readonly
	 */
	currency: "currency",

	/**
	 * "treasure"
	 * @readonly
	 */
	treasure: "treasure",

	/**
	 * "weapon"
	 * @readonly
	 */
	weapon: "weapon",

	/**
	 * "ammo"
	 * @readonly
	 */
	ammo: "ammo",

	/**
	 * "armor"
	 * @readonly
	 */
	armor: "armor",

	/**
	 * "potion"
	 * @readonly
	 */
	potion: "potion",

	/**
	 * "food"
	 * @readonly
	 */
	food: "food",

	/**
	 * "drink"
	 * @readonly
	 */
	drink: "drink",

	/**
	 * "spell"
	 * @readonly
	 */
	spell: "spell",

	/**
	 * "clothing"
	 * @readonly
	 */
	clothing: "clothing",

	/**
	 * "other"
	 * @readonly
	 */
	other: "other"
});

//export type ItemTypeCategory = (typeof ItemTypeCategory)[keyof typeof ItemTypeCategory];


/**
 * @enum {string}
 */
export const ItemTypeTrigger = Object.freeze({
	/**
	 * "pickup"
	 * @readonly
	 */
	pickup: "pickup",

	/**
	 * "drop"
	 * @readonly
	 */
	drop: "drop",

	/**
	 * "use"
	 * @readonly
	 */
	use: "use",

	/**
	 * "unuse"
	 * @readonly
	 */
	unuse: "unuse",

	/**
	 * "destroy"
	 * @readonly
	 */
	destroy: "destroy",

	/**
	 * "alignment"
	 * @readonly
	 */
	alignment: "alignment"
});

//export type ItemTypeTrigger = (typeof ItemTypeTrigger)[keyof typeof ItemTypeTrigger];


/**
 * @interface
 */
export class ItemTypeConfig {
	/**
	 * The inventory category for this item type.
	 * @readonly
	 * @type {ItemTypeCategory}
	 */
	category;

	/**
	 * Unique identifier for this item type.
	 *
	 * Used to retrieve item types by id, and when stacking.
	 * Values is required, will be trimmed of leading and trailing whitespace,
	 * and may not be empty string.
	 *
	 * @readonly
	 * @type {string}
	 */
	id;

	/**
	 * The default display text for the item type.
	 * For unidentified items, this will be used as the unidentified text of the item.
	 *
	 * @readonly
	 * @type {string}
	 */
	text;

	// TODO: identified properties?
	/*
	reasonly identifiedText?: string = "Potion of Cleansing";
	*/

	// TODO: various properties for refining item type and supported actions
	//
	//   canStore (can store in guild locker, etc)
	//   canOffer (can offer to an opponent)
	//   canPickup/canUse/canUnuse/canDrop/canDestroy
	//
	//   isCurrency (copper/silver/gold) => canStore
	//   isFood (foodPacket) => canUse, canStore
	//   isDrink (waterFlask) => canUse, canStore
	//   isAppraisable (gem/jewel) => canStore
	//   isWeapon => canUse
	//   isArmor => canUse
	//   isPotion => canUse
	//   isAmmo (crystal) => canUse
	//		- what about arrows/bolts/energy weapons/guns? (recharge wand, recharge bow, recharge crossbow)
	//   isCursed (can't drop/offer/etc?) => !canDrop, !canOffer, !canUnuse, !canDestroy
	//   isQuestItem (can't drop/offer/etc?) => !canDrop, !canOffer, !canDestroy
	//   isMagical (wand, card, horn)
	//   isKey - generic key?  How about keys for specific doors (or types of doors)? => canStore
	// The following may not make sense to have separate...  Perhaps they are not needed?
	//   isTorch => canUse, canStore
	//   isCompass => canUse, canStore
	//   isTimepiece => canUse, canStore

	/**
	 * @readonly
	 * @type {number?}
	 */
	alignment;

	/**
	 * @readonly
	 * @type {number?}
	 */
	weight;

	/**
	 * The number of these items that can be stacked in a single inventory slot.
	 * Must be 1 or greater, and defaults to 1 if not specified.
	 *
	 * @readonly
	 * @type {number?}
	 */
	stackSize;

	/**
	 * The maximum number of stacks that may be carried.
	 * Must be 1 or greater, and defaults to 1 if not specified.
	 *
	 * @readonly
	 * @type {number?}
	 */
	maxStacks;

	// TODO: maxUses property?
	// May not play well with stacking (perhaps only stack items with maxUses = 0/1)?
	//
	// Max. number of times an item can be used (0 = infinite)
	// May be used as upper limit when recharging item
	// Also used to determine when weapon or armor has broken (decreased through use)
	// readonly maxUses?: number = 0;

	/**
	 * The base value for the item.
	 * Must be 0 or greater, and defaults to 0 if not specified.
	 *
	 * @readonly
	 * @type {number?}
	 */
	value;

	/**
	 * @readonly
	 * @type {(ReadonlyArray<LatentEffectConfig>|ReadonlyLatentEffects)?}
	 */
	effects;
}

/**
 * @readonly
 * @type {Map<ItemTypeCategory, Function>}
 */
const itemTypeCategoryConstructors = new Map();

/**
 * Base class for all item types.
 * @implements {Configurable<ItemTypeConfig>}
 */
export class ItemType {

	/**
	 *
	 * @param {ItemTypeCategory} category
	 * @param {Function} createFunction
	 */
	static registerCategory(category, createFunction) {
		if (itemTypeCategoryConstructors.has(category))
			throw new Error("Type category '"+ category +"' already registered");
		itemTypeCategoryConstructors.set(category, createFunction);
	}

	/**
	 *
	 * @param {ItemTypeConfig} config
	 * @returns {ItemType}
	 */
	static create(config) {
		let category = Parse.enum(ItemTypeCategory, config.category, ItemTypeCategory.other);

		let cls = itemTypeCategoryConstructors.get(category);
		if (cls == null) {
			console.log("Registering generic ItemType constructor for category '"+ category +"'");
			itemTypeCategoryConstructors.set(category, ItemType);
			cls = ItemType;
		}

		return new cls(config);
	}

	/**
	 * @type {ItemTypeCategory}
	 */
	#category = ItemTypeCategory.other;

	/**
	 * @type {string}
	 */
	#id = 'placeholder';


	/**
	 * @type {string}
	 */
	#text = '<Placeholder>';

	// TODO: identified property?
	/*
	private _identifiedText: string = "Potion of Cleansing";
	*/

	/**
	 * @type {number}
	 */
	#alignment = 0;		// 0 is Neutral; < 0 is Evil; > 0 is Good

	/**
	 * @type {number}
	 */
	#weight = 0;		// Must be 0 or more

	/**
	 * @type {number}
	 */
	#stackSize = 1;		// Must be 1 or more

	/**
	 * @type {number}
	 */
	#maxStacks = 1;		// Must be 1 or more

	/**
	 * @type {number}
	 */
	#value = 0;			// Must be >= 0

	/**
	 * @readonly
	 * @type {ReadonlyLatentEffects}
	 */
	#effects = new LatentEffects();

	/**
	 * Static initializer for registering serialization
	 */
	static #initializeClass_ItemType = (() => {
		ClassRegistry.registerClass(
			"ItemType", ItemType,
			(obj, serializer)=> {
				serializer.writeProp(obj.config);
			},
			(obj, data, deserializer)=> {
				obj.configure(deserializer.readProp(data));
			}
		);
	})();

	/**
	 * Constructs a new ItemType.
	 *
	 * @param {(ItemTypeConfig|ItemType)?} config The configuration object object to clone properties from (if any)
	 */
	constructor(config) {
		if (config != null) {
			this.configure(config);
		}
	}

	/**
	 * @protected
	 * @type {typeof ItemTypeTrigger}
	 */
	get triggerTypes() {
		return ItemTypeTrigger;
	}

	/**
	 *
	 * @param {ItemTypeConfig|ItemType} config
	 */
	configure(config) {
		this.#category = Parse.enum(ItemTypeCategory, config.category, ItemTypeCategory.other);
		this.#id = Parse.str(Parse.required(config.id, "id")).trim();
		if (this.#id == "") {
			throw new Error("id cannot be empty string");
		}

		this.text = Parse.str(config.text, '<Placeholder>');
		this.alignment = Parse.num(config.alignment, 0);
		this.weight = Parse.num(config.weight, 0);
		this.stackSize = Parse.num(config.stackSize, 1);
		this.maxStacks = Parse.num(config.maxStacks, 1);
		this.value = Parse.num(config.value, 0);

		this.effects.configure(config.effects);
		for (let effect of this.effects) {
			effect.assertProperties(this.triggerTypes);
		}
	}

	/**
	 * @type {ItemTypeConfig}
	 */
	get config() {
		return {
			category: this.category,
			id: this.id,
			text: this.text,
			alignment: this.alignment,
			weight: this.weight,
			stackSize: this.stackSize,
			maxStacks: this.maxStacks,
			value: this.value,
			effects: this.effects.config
		};
	}

	/**
	 * The category for this item type.
	 * Items may have different properties based on their category.
	 */
	get category() {
		return this.#category;
	}

	/**
	 * Unique identifier for this item type.
	 *
	 * Used to retrieve item types by id, and when stacking.
	 * Values is required, will be trimmed of leading and trailing whitespace,
	 * and may not be empty string.
	 */
	get id() {
		return this.#id;
	}

	/**
	 * The text of the item type.
	 *
	 * An error is thrown if this property is assigned to null or an empty string.
	 */
	get text() {
		return this.#text;
	}

	set text(value) {
		if (value == null || value == '') {
			throw new Error("text cannot be empty");
		}
		this.#text = value;
	}

	/**
	 * The number of these items that can be stacked in a single inventory slot.
	 * Only the integer portion of any assigned value is used.
	 */
	get stackSize() {
		return this.#stackSize;
	}

	set stackSize(value) {
		if (!(value >= 1)) {
			throw new Error("stackSize must be 1 or more");
		}
		this.#stackSize = Math.trunc(value);
	}

	/**
	 * The maximum number of stacks that may be carried.
	 * Only the integer portion of any assigned value is used.
	 */
	get maxStacks() {
		return this.#maxStacks;
	}

	set maxStacks(value) {
		if (!(value >= 1)) {
			throw new Error("maxStacks must be 1 or more");
		}
		this.#maxStacks = Math.trunc(value);
	}

	/**
	 * The item's weight (0 or greater).
	 * Attempting to assign this property to a value less than 0 will produce an error.
	 */
	get weight() {
		return this.#weight;
	}

	set weight(weight) {
		if (!(weight >= 0)) {
			throw new Error("weight must be 0 or more");
		}
		this.#weight = weight;
	}

	get alignment() {
		return this.#alignment;
	}

	set alignment(value) {
		if (Number.isNaN(value)) {
			throw new Error("invalid alignment");
		}
		// TODO: Clamp value, etc
		this.#alignment = value;
	}

	/**
	 * The base value for the item, in coppers.
	 * Values less than 0 will be clamped at 0.
	 */
	get value() {
		return this.#value;
	}

	set value(value) {
		if (!(value >= 0)) {
			throw new Error("value must be 0 or more");
		}
		this.#value = Math.max(0, value);
	}

	/**
	 * The effects associated with the item type.
	 */
	get effects() {
		return this.#effects;
	}

}
