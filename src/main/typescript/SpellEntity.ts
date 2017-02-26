
import { Entity } from "./Entity"

/**
 * Represents a spell item
 */
export class SpellEntity
	extends Entity
{

	private _id: Number;
	private _castingCost: Number;
	private _castingSkill: Number;
	private _failureDamage: Number;
	private _usesRemaining: Number;
	private _lessonSkillImprovement: Number;
	private _remainingLessons: Number;

	constructor(clone?: any) {
		super(clone);
		if (clone != null) {
			this.castingCost = clone.castingCost;
			this.castingSkill = clone.castingSkill;
			this.failureDamage = clone.failureDamage;
			this.id = clone.id;
			this.usesRemaining = clone.usesRemaining;
			this.lessonSkillImprovement = clone.lessonSkillImprovement;
			this.remainingLessons = clone.remainingLessons;
		}
	} // constructor

	clone(): SpellEntity {
		return new SpellEntity(this);
	} // clone

	get id(): Number {
		return this._id;
	} // id

	set id(id: Number) {
		this._id = id;
	} // id

	get castingCost(): Number {
		return this._castingCost;
	} // castingCost

	set castingCost(castingCost: Number) {
		castingCost = Number(castingCost);
		if (castingCost < 0)
			throw new Error("castingCost must be 0 or more");
		this._castingCost = castingCost;
	} // castingCost

	get castingSkill(): Number {
		return this._castingSkill;
	} // castingSkill

	set castingSkill(castingSkill: Number) {
		castingSkill = Number(castingSkill);
		if (castingSkill < 0)
			throw new Error("castingSkill must be 0 or more");
		this._castingSkill = castingSkill;
	} // castingSkill

	get failureDamage(): Number {
		return this._failureDamage;
	} // failureDamage

	set failureDamage(failureDamage: Number) {
		failureDamage = Number(failureDamage);
		if (failureDamage < 0)
			throw new Error("failureDamage must be 0 or more");
		this._failureDamage = failureDamage;
	} // failureDamage

	get usesRemaining() {
		return this._usesRemaining;
	} // usesRemaining

	set usesRemaining(usesRemaining) {
		usesRemaining = Number(usesRemaining);
		if (usesRemaining < 0)
			throw new Error("usesRemaining must be 0 or more");
		this._usesRemaining = usesRemaining;
	} // usesRemaining

	get lessonSkillImprovement() {
		return this._lessonSkillImprovement;
	} // lessonSkillImprovement

	set lessonSkillImprovement(lessonSkillImprovement) {
		lessonSkillImprovement = Number(lessonSkillImprovement);
		if (lessonSkillImprovement < 0)
			throw new Error("lessonSkillImprovement must be greater than 0");
		this._lessonSkillImprovement = lessonSkillImprovement;
	} // lessonSkillImprovement

	get remainingLessons() {
		return this._remainingLessons;
	} // remainingLessons

	set remainingLessons(remainingLessons) {
		remainingLessons = Number(remainingLessons);
		if (remainingLessons < 0)
			throw new Error("remainingLessons must be 0 or more");
		this._remainingLessons = remainingLessons;
	} // remainingLessons

} // SpellEntity
