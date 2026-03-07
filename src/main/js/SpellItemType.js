
import { ItemType, ItemTypeCategory, ItemTypeTrigger, ItemTypeConfig } from "./ItemType.js"
import { Parse } from "./Parse.js";
import { ClassRegistry } from "./Serializer.js";
import { Configurable } from "./Configurable.js";


/**
 * @enum {string}
 * @extends ItemTypeTrigger
 */
export const SpellItemTypeTrigger = Object.freeze(Object.assign({
	/**
	 * "lesson"
	 * @readonly
	 */
	lesson: "lesson",

	/**
	 * "depleted"
	 * @readonly
	 */
	depleted: "depleted"
}, ItemTypeTrigger));

/**
 * @interface
 */
class SpellItemTypeConfig
	extends ItemTypeConfig
{
	/**
	 * The amount added to fatigue when casting this spell.
	 * @type {number}
	 * @readonly
	 */
	castingCost;

	/**
	 * The base casting skill for this spell when it is initially obtained.
	 * This value ranges from 0 to 255 (100%).
	 * @type {number|string}
	 * @readonly
	 */
	baseSkill;

	/**
	 * Amount of hp damage incurred if casting fails.
	 * @type {number}
	 * @readonly
	 */
	failureDamage;

	/**
	 * Initial number of uses.
	 * @type {number}
	 * @readonly
	 */
	uses;

	/**
	 * Number of lessons required.
	 * @type {number}
	 * @readonly
	 */
	lessons;

	/**
	 * Amount of skill improvement per lesson.
	 * This value ranges from 0 to 255 (100%).
	 * @type {number|string}
	 * @readonly
	 */
	lessonSkillImprovement;	// 0-255 or %

	/**
	 * Amount of skill improvement gained for a successful cast.
	 * This value ranges from 0 to 255 (100%).
	 * @type {number|string}
	 * @readonly
	 */
	successSkillImprovement; // 0-255 or %
}

/**
 * Represents a spell item
 *
 * @implements {Configurable<SpellItemTypeConfig>}
 */
export class SpellItemType
	extends ItemType
{

	/**
	 * @type {number}
	 */
	#castingCost = 255;

	/**
	 * @type {number}
	 */
	#baseSkill = 0;

	/**
	 * @type {number}
	 */
	#failureDamage = 255;

	/**
	 * @type {number}
	 */
	#uses = 0;

	/**
	 * @type {number}
	 */
	#lessons = 255;

	/**
	 * @type {number}
	 */
	#lessonSkillImprovement = 0;

	/**
	 * @type {number}
	 */
	#successSkillImprovement = 0;

	/**
	 * Static initializer for registering serialization
	 */
	static #initializeClass_SpellItemType = (() => {
		ClassRegistry.registerClass(
			"SpellItemType", SpellItemType,
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
	 * @param {SpellItemTypeConfig|SpellItemType} config
	 */
	constructor(config) {
		super();
		if (config != null) {
			this.configure(config);
		}
	}

	/**
	 * @type {typeof SpellItemTypeTrigger}
	 */
	get triggerTypes() {
		return SpellItemTypeTrigger;
	}

	/**
	 *
	 * @param {SpellItemTypeConfig} config
	 */
	configure(config) {
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

	/**
	 * @type {SpellItemTypeConfig}
	 */
	get config() {
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
	get castingCost() {
		return this.#castingCost;
	}

	set castingCost(value) {
		if (!(value >= 0)) {
			throw new Error("castingCost must be 0 or more");
		}
		this.#castingCost = value;
	}

	/**
	 * The base casting skill for this spell when it is initially obtained.
	 * This value ranges from 0 to 255 (100%).
	 */
	get baseSkill() {
		return this.#baseSkill;
	}

	set baseSkill(value) {
		if (!(value >= 0 && value <= 255)) {
			throw new Error("baseSkill must be between 0 and 255");
		}
		this.#baseSkill = value;
	}

	/**
	 * Amount of hp damage incurred if casting fails.
	 */
	get failureDamage() {
		return this.#failureDamage;
	}

	set failureDamage(value) {
		if (!(value >= 0)) {
			throw new Error(" must be 0 or more");
		}
		this.#failureDamage = value;
	}

	/**
	 * Initial number of uses.
	 */
	get uses() {
		return this.#uses;
	}

	set uses(value) {
		if (!(value >= 0)) {
			throw new Error("uses must be 0 or more");
		}
		this.#uses = value;
	}

	/**
	 * Amount of skill improvement per lesson.
	 * This value ranges from 0 to 255 (100%).
	 */
	get lessonSkillImprovement() {
		return this.#lessonSkillImprovement;
	}

	set lessonSkillImprovement(value) {
		if (!(value >= 0 && value <= 255))
			throw new Error("lessonSkillImprovement must be between 0 and 255");
		this.#lessonSkillImprovement = value;
	}

	/**
	 * Amount of skill improvement gained for a successful cast.
	 * This value ranges from 0 to 255 (100%).
	 */
	get successSkillImprovement() {
		return this.#successSkillImprovement;
	}

	set successSkillImprovement(value) {
		if (!(value >= 0 && value <= 255))
			throw new Error("successSkillImprovement must be between 0 and 255");
		this.#successSkillImprovement = value;
	}

	/**
	 * Number of lessons required.
	 */
	get lessons() {
		return this.#lessons;
	}

	set lessons(value) {
		if (!(value >= 0))
			throw new Error("lessons must be 0 or more");
		this.#lessons = value;
	}

}

ItemType.registerCategory(ItemTypeCategory.spell, SpellItemType);
