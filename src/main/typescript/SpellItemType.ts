
import { ItemType, ItemTypeCategory, ItemTypeTrigger, ItemTypeConfig } from "./ItemType"
import { Parse } from "./Parse";
import { ClassRegistry, Serializer, Deserializer } from "./Serializer";
import { Configurable } from "./Configurable";


// Typescript doesn't let you equate an enum and a string union type
// However, this approach produces a similar effect (just no true enum type)
// See https://stackoverflow.com/questions/52393730/typescript-string-literal-union-type-from-enum
const lit = <V extends keyof any>(v: V) => v;
export const SpellItemTypeTrigger = Object.assign({
	lesson: lit("lesson"),
	depleted: lit("depleted")
}, ItemTypeTrigger);
export type SpellItemTypeTrigger = (typeof SpellItemTypeTrigger)[keyof typeof SpellItemTypeTrigger]|ItemTypeTrigger;


interface SpellItemTypeConfig
	extends ItemTypeConfig
{
	/**
	 * The amount added to fatigue when casting this spell.
	 */
	readonly castingCost: Number;

	/**
	 * The base casting skill for this spell when it is initially obtained.
	 * This value ranges from 0 to 255 (100%).
	 */
	readonly baseSkill: Number|string;

	/**
	 * Amount of hp damage incurred if casting fails.
	 */
	readonly failureDamage: Number;

	/**
	 * Initial number of uses.
	 */
	readonly uses: Number;

	/**
	 * Number of lessons required.
	 */
	readonly lessons: Number;

	/**
	 * Amount of skill improvement per lesson.
	 * This value ranges from 0 to 255 (100%).
	 */
	readonly lessonSkillImprovement: Number|string;	// 0-255 or %

	/**
	 * Amount of skill improvement gained for a successful cast.
	 * This value ranges from 0 to 255 (100%).
	 */
	readonly successSkillImprovement: Number|string; // 0-255 or %
}

/**
 * Represents a spell item
 */
export class SpellItemType
	extends ItemType
	implements Configurable<SpellItemTypeConfig>
{

	/**
	 * @see [[castingCost]]
	 */
	private _castingCost: number = 255;

	/**
	 * @see [[baseSkill]]
	 */
	private _baseSkill: number = 0;

	/**
	 * @see [[failureDamage]]
	 */
	private _failureDamage: number = 255;

	/**
	 * @see [[uses]]
	 */
	private _uses: number = 0;

	/**
	 * @see [[lessons]]
	 */
	private _lessons: number = 255;

	/**
	 * @see [[lessonSkillImprovement]]
	 */
	private _lessonSkillImprovement: number = 0;

	/**
	 * @see [[successSkillImprovement]]
	 */
	private _successSkillImprovement: number = 0;

	/**
	 * Static initializer for registering serialization
	 */
	private static _initializeClass_SpellItemType: void = (() => {
		ClassRegistry.registerClass(
			"SpellItemType", SpellItemType,
			(obj: SpellItemType, serializer: Serializer)=> {
				serializer.writeProp(obj.config);
			},
			(obj: SpellItemType, data: any, deserializer: Deserializer)=> {
				obj.configure(deserializer.readProp(data) as SpellItemTypeConfig);
			}
		);
	})();

	constructor(config: SpellItemTypeConfig|SpellItemType) {
		super(config);
	}

	protected get triggerTypes(): typeof SpellItemTypeTrigger {
		return SpellItemTypeTrigger;
	}

	configure(config: SpellItemTypeConfig): void {
		super.configure(config);

		this.castingCost = Parse.num(Parse.required(config.castingCost, "castingCost"));
		this.baseSkill = Parse.percent(Parse.required(config.baseSkill, "baseSkill"), 0, 255);
		this.failureDamage = Parse.num(Parse.required(config.failureDamage, "failureDamage"));
		this.uses = Parse.num(Parse.required(config.uses, "uses"));
		this.lessonSkillImprovement = Parse.percent(
			Parse.required(config.lessonSkillImprovement, "lessonSkillImprovement"), 255);
		this.successSkillImprovement = Parse.percent(
			Parse.required(config.successSkillImprovement, "successSkillImprovement"), 255);
		this.lessons = Parse.num(Parse.required(config.lessons, "lessons"));
	}

	get config(): SpellItemTypeConfig {
		return Object.assign(
			super.config,
			{
				castingCost: this.castingCost,
				baseSkill: this.baseSkill,
				failureDamage: this.failureDamage,
				uses: this.uses,
				lessons: this.lessons,
				lessonSkillImprovement: this.lessonSkillImprovement,
				successSkillImprovement: this.successSkillImprovement
			}
		);
	}

	/**
	 * The amount added to fatigue when casting this spell.
	 */
	get castingCost(): number {
		return this._castingCost;
	}

	set castingCost(value: number) {
		if (!(value >= 0))
			throw new Error("castingCost must be 0 or more");
		this._castingCost = value;
	}

	/**
	 * The base casting skill for this spell when it is initially obtained.
	 * This value ranges from 0 to 255 (100%).
	 */
	get baseSkill(): number {
		return this._baseSkill;
	}

	set baseSkill(value: number) {
		if (!(value >= 0 && value <= 255))
			throw new Error("baseSkill must be between 0 and 255");
		this._baseSkill = value;
	}

	/**
	 * Amount of hp damage incurred if casting fails.
	 */
	get failureDamage(): number {
		return this._failureDamage;
	}

	set failureDamage(value: number) {
		if (!(value >= 0))
			throw new Error(" must be 0 or more");
		this._failureDamage = value;
	}

	/**
	 * Initial number of uses.
	 */
	get uses(): number {
		return this._uses;
	}

	set uses(value: number) {
		if (!(value >= 0))
			throw new Error("uses must be 0 or more");
		this._uses = value;
	}

	/**
	 * Amount of skill improvement per lesson.
	 * This value ranges from 0 to 255 (100%).
	 */
	get lessonSkillImprovement(): number {
		return this._lessonSkillImprovement;
	}

	set lessonSkillImprovement(value: number) {
		if (!(value >= 0 && value <= 255))
			throw new Error("lessonSkillImprovement must be between 0 and 255");
		this._lessonSkillImprovement = value;
	}

	/**
	 * Amount of skill improvement gained for a successful cast.
	 * This value ranges from 0 to 255 (100%).
	 */
	get successSkillImprovement(): number {
		return this._successSkillImprovement;
	}

	set successSkillImprovement(value: number) {
		if (!(value >= 0 && value <= 255))
			throw new Error("successSkillImprovement must be between 0 and 255");
		this._successSkillImprovement = value;
	}

	/**
	 * Number of lessons required.
	 */
	get lessons(): number {
		return this._lessons;
	}

	set lessons(value: number) {
		if (!(value >= 0))
			throw new Error("lessons must be 0 or more");
		this._lessons = value;
	}

}

ItemType.registerCategory(ItemTypeCategory.spell, SpellItemType);
