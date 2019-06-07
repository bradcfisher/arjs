import { Parse } from "./Parse"
import { ItemType, ItemTypeConfig, ItemTypeCategory, ItemTypeTrigger } from "./ItemType"
import { ClassRegistry, Serializer, Deserializer } from "./Serializer";
import { Configurable } from "./Configurable";

export interface PotionItemTypeConfig
	extends ItemTypeConfig
{
	color: string|PotionItemType.Color;
	taste: string|PotionItemType.Taste;
	sip: string|PotionItemType.Sip;
	instability: number|string;
}

// Typescript doesn't let you equate an enum and a string union type
// However, this approach produces a similar effect (just no true enum type)
// See https://stackoverflow.com/questions/52393730/typescript-string-literal-union-type-from-enum
const lit = <V extends keyof any>(v: V) => v;
export const PotionItemTypeTrigger = Object.assign({
	color: lit("color"),
	taste: lit("taste"),
	sip: lit("sip")
}, ItemTypeTrigger);
export type PotionItemTypeTrigger = (typeof PotionItemTypeTrigger)[keyof typeof PotionItemTypeTrigger]|ItemTypeTrigger;

/**
 * Potion item.
 */
export class PotionItemType
	extends ItemType
	implements Configurable<PotionItemTypeConfig>
{

	private _color: PotionItemType.Color = PotionItemType.Color.Clear;

	private _taste: PotionItemType.Taste = PotionItemType.Taste.Plain;

	private _sip: PotionItemType.Sip = PotionItemType.Sip.Safe;

	private _instability: number = 40;

	/**
	 * Static initializer for registering serialization
	 */
	private static _initializeClass_PotionItemType: void = (() => {
		ClassRegistry.registerClass(
			"PotionItemType", PotionItemType,
			(obj: PotionItemType, serializer: Serializer)=> {
				serializer.writeProp(obj.config);
			},
			(obj: PotionItemType, data: any, deserializer: Deserializer)=> {
				obj.configure(<any>deserializer.readProp(data));
			}
		);
	})();

	constructor(config?: PotionItemTypeConfig|PotionItemType) {
		super(config);
		if (config != null)
			this.configure(config);
	}

	protected get triggerTypes(): typeof PotionItemTypeTrigger {
		return PotionItemTypeTrigger;
	}

	configure(config: PotionItemTypeConfig): void {
		super.configure(config);

		this.color = Parse.enum(PotionItemType.Color, Parse.required(config.color, "color"));
		this.taste = Parse.enum(PotionItemType.Taste, Parse.required(config.taste, "taste"));
		this.sip = Parse.enum(PotionItemType.Sip, Parse.required(config.sip, "sip"));
		this.instability = Parse.percent(config.instability, 40, 255);
	}

	get config(): PotionItemTypeConfig {
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

	get color(): PotionItemType.Color {
		return this._color;
	}

	set color(value: PotionItemType.Color) {
		this._color = value;
	}

	get taste(): PotionItemType.Taste {
		return this._taste;
	}

	set taste(value: PotionItemType.Taste) {
		this._taste = value;
	}

	get sip(): PotionItemType.Sip {
		return this._sip;
	}

	set sip(value: PotionItemType.Sip) {
		this._sip = value;
	}

	get instability(): number {
		return this._instability;
	}

	set instability(value: number) {
		if (!(value >= 0 && value <= 255))
			throw new Error("instability must be between 0 and 255");

		this._instability = value;
	}

// TODO: Should these methods should go in an Item subclass instead of this type class?

	inspectColor(): void {
		// Reveals the color
	}

	inspectTaste(): void {
		// Perform stability check.  Fail -> poof
		// Reveals the taste
	}

	inspectSip(): void {
		// Perform stability check.  Fail -> poof

		// Sip may also confer some of the potion's effect...  Not sure on the rules for that.

		// - If the potion is already identified, shows its name.
		// - Else the result depends on the character wisdom and a random value:
		//    Wisdom/2 + Random [0; 255]	Result
		//    [0; 128[						The character is unsure.
		//    [128; 256[					The risk is revealed.
		//    [256; +oo[					The potion is identified.
	}

	use(): void {
		// Perform stability check.  Fail -> poof
		// Execute the 'use' action

	}

}

ItemType.registerCategory(ItemTypeCategory.potion, PotionItemType);

export module PotionItemType {
	/**
	 * Enumeration of potion color values.
	 */
	export enum Color {
		Clear = 0,
		Amber = 1,
		Silver = 2,
		Black = 3,
		Red = 4,
		White = 5,
		Green = 6,
		Yellow = 7,
		Orange = 8
	} // Color

	/**
	 * Enumeration of potion taste values.
	 */
	export enum Taste {
		Bitter = 0,
		Sweet = 1,
		Plain = 2,
		Sour = 3,
		Salty = 4,
		Acidic = 5,
		Alkaline = 6,
		Dry = 7
	} // Taste

	/**
	 * Enumeration of potion sip values.
	 */
	export enum Sip {
		Safe = 0,
		Caution = 1,
		Dangerous = 2
	} // Sip
}
