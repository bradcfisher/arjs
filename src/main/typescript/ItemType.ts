
import { Parse } from "./Parse"
import { LatentEffectConfig, TriggerTypesMap, LatentEffect } from "./Effect"
import { LatentEffects, ReadonlyLatentEffects } from "./LatentEffects"
import { ClassRegistry, Serializer, Deserializer } from "./Serializer";
import { Configurable } from "./Configurable";

// Typescript doesn't let you equate an enum and a string union type
// However, this approach produces a similar effect (just no true enum type)
// See https://stackoverflow.com/questions/52393730/typescript-string-literal-union-type-from-enum
const lit = <V extends keyof any>(v: V) => v;
export const ItemTypeCategory = {
	currency: lit("currency"),
	treasure: lit("treasure"),
	weapon: lit("weapon"),
	ammo: lit("ammo"),
	armor: lit("armor"),
	potion: lit("potion"),
	food: lit("food"),
	drink: lit("drink"),
	spell: lit("spell"),
	other: lit("other")
}
export type ItemTypeCategory = (typeof ItemTypeCategory)[keyof typeof ItemTypeCategory];


export const ItemTypeTrigger = {
	pickup: lit("pickup"),
	drop: lit("drop"),
	use: lit("use"),
	unuse: lit("unuse"),
	destroy: lit("destroy"),
	alignment: lit("alignment")
}
export type ItemTypeTrigger = (typeof ItemTypeTrigger)[keyof typeof ItemTypeTrigger];



export interface ItemTypeConfig {
	/**
	 * The inventory category for this item type.
	 */
	readonly category: ItemTypeCategory;

	/**
	 * Unique identifier for this item type.
	 *
	 * Used to retrieve item types by id, and when stacking.
	 * Values is required, will be trimmed of leading and trailing whitespace,
	 * and may not be empty string.
	 */
	readonly id: string;

	/**
	 * The default display text for the item type.
	 * For unidentified items, this will be used as the unidentified text of the item.
	 */
	readonly text: string;

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

	readonly alignment?: number;

	readonly weight?: number;

	/**
	 * The number of these items that can be stacked in a single inventory slot.
	 * Must be 1 or greater, and defaults to 1 if not specified.
	 */
	readonly stackSize?: number;

	/**
	 * The maximum number of stacks that may be carried.
	 * Must be 1 or greater, and defaults to 1 if not specified.
	 */
	readonly maxStacks?: number;

	// TODO: maxUses property?
	// May not play well with stacking (perhaps only stack items with maxUses = 0/1)?
	//
	// Max. number of times an item can be used (0 = infinite)
	// May be used as upper limit when recharging item
	// readonly maxUses?: number = 0;

	/**
	 * The base value for the item.
	 * Must be 0 or greater, and defaults to 0 if not specified.
	 */
	readonly value?: number;

	readonly effects?: ReadonlyArray<LatentEffectConfig>|ReadonlyLatentEffects;
}

let itemTypeCategoryConstructors: Map<ItemTypeCategory, Function> = new Map();

/**
 * Base class for all item types.
 */
export class ItemType
	implements Configurable<ItemTypeConfig>
{

	static registerCategory(category: ItemTypeCategory, createFunction: Function): void {
		if (itemTypeCategoryConstructors.has(category))
			throw new Error("Type category '"+ category +"' already registered");
		itemTypeCategoryConstructors.set(category, createFunction);
	}

	static create(config: ItemTypeConfig): ItemType {
		let category: ItemTypeCategory = Parse.enum(ItemTypeCategory, config.category, ItemTypeCategory.other);

		let cls: any = itemTypeCategoryConstructors.get(category);
		if (cls == null) {
			console.log("Registering generic ItemType constructor for category '"+ category +"'");
			itemTypeCategoryConstructors.set(category, ItemType);
			cls = ItemType;
		}

		return new cls(config);
	}

	/**
	 * @see [[category]]
	 */
	private _category: ItemTypeCategory = ItemTypeCategory.other;

	/**
	 * @see [[id]]
	 */
	private _id: string = 'placeholder';


	/**
	 * @see [[text]]
	 */
	private _text : string = '<Placeholder>';

	// TODO: identified property?
	/*
	private _identifiedText: string = "Potion of Cleansing";
	*/

	/**
	 * @see [[alignment]]
	 */
	private _alignment: number = 0;		// 0 is Neutral; < 0 is Evil; > 0 is Good

	/**
	 * @see [[weight]]
	 */
	private _weight : number = 0;		// Must be 0 or more

	/**
	 * @see [[stackSize]]
	 */
	private _stackSize: number = 1;		// Must be 1 or more

	/**
	 * @see [[maxStacks]]
	 */
	private _maxStacks: number = 1;		// Must be 1 or more

	/**
	 * @see [[value]]
	 */
	private _value: number = 0;			// Must be >= 0

	/**
	 * @see [[effects]]
	 */
	private readonly _effects: ReadonlyLatentEffects = new LatentEffects();

	/**
	 * Static initializer for registering serialization
	 */
	private static _initializeClass_ItemType: void = (() => {
		ClassRegistry.registerClass(
			"ItemType", ItemType,
			(obj: ItemType, serializer: Serializer)=> {
				serializer.writeProp(obj.config);
			},
			(obj: ItemType, data: any, deserializer: Deserializer)=> {
				obj.configure(deserializer.readProp(data) as ItemTypeConfig);
			}
		);
	})();

	/**
	 * Constructs a new ItemType.
	 *
	 * @param	config	The configuration object object to clone properties from (if any)
	 */
	constructor(config?: ItemTypeConfig|ItemType) {
		if (config != null)
			this.configure(config);
	}

	protected get triggerTypes(): typeof ItemTypeTrigger {
		return ItemTypeTrigger;
	}

	configure(config: ItemTypeConfig|ItemType): void {
		this._category = Parse.enum(ItemTypeCategory, config.category, ItemTypeCategory.other);
		this._id = Parse.str(Parse.required(config.id, "id")).trim();
		if (this._id == "")
			throw new Error("id cannot be empty string");

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

	get config(): ItemTypeConfig {
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
	get category(): ItemTypeCategory {
		return this._category;
	}

	/**
	 * Unique identifier for this item type.
	 *
	 * Used to retrieve item types by id, and when stacking.
	 * Values is required, will be trimmed of leading and trailing whitespace,
	 * and may not be empty string.
	 */
	get id(): string {
		return this._id;
	}

	/**
	 * Retrieves the text of the item type.
	 * @return	The text of the item type.
	 */
	get text() : string {
		return this._text;
	}

	/**
	 * Sets the text of the item type.
	 * @param	text	The new text for the item type.  Cannot be empty.
	 * @throws	Error if the `text` is null or an empty string.
	 */
	set text(value: string) {
		if (value == null || value == '')
			throw new Error("text cannot be empty");
		this._text = value;
	}

	/**
	 * The number of these items that can be stacked in a single inventory slot.
	 * Only the integer portion of any assigned value is used.
	 */
	get stackSize(): number {
		return this._stackSize;
	}

	set stackSize(value: number) {
		if (!(value >= 1))
			throw new Error("stackSize must be 1 or more");
		this._stackSize = Math.trunc(value);
	}

	/**
	 * The maximum number of stacks that may be carried.
	 * Only the integer portion of any assigned value is used.
	 */
	get maxStacks(): number {
		return this._maxStacks;
	}

	set maxStacks(value: number) {
		if (!(value >= 1))
			throw new Error("maxStacks must be 1 or more");
		this._maxStacks = Math.trunc(value);
	}

	/**
	 * Retrieves the item's weight.
	 * @return	The item's weight (0 or greater).
	 */
	get weight(): number {
		return this._weight;
	}

	/**
	 * Sets the item's weight.
	 * @param	weight	The weight of the item.
	 */
	set weight(weight: number) {
		if (!(weight >= 0))
			throw new Error("weight must be 0 or more");
		this._weight = weight;
	}

	get alignment(): number {
		return this._alignment;
	}

	set alignment(value: number) {
		if (Number.isNaN(value))
			throw new Error("invalid alignment");
		// TODO: Clamp value, etc
		this._alignment = value;
	}

	/**
	 * The base value for the item.
	 * Values less than 0 will be clamped at 0.
	 */
	get value(): number {
		return this._value;
	}

	set value(value: number) {
		if (!(value >= 0))
			throw new Error("value must be 0 or more");
		this._value = Math.max(0, value);
	}

	/**
	 * Retrieves the effects associated with the item type.
	 * @return	The effects associated with the item type.
	 */
	get effects(): ReadonlyLatentEffects {
		return this._effects;
	}

}
