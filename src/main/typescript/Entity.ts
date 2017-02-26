import { Cloneable } from "./Cloneable"
import { EntityEffects } from "./EntityEffects"

/**
 * Base class for all items.
 */
export class Entity
	implements Cloneable
{

	private _name : String;
	private _held : Boolean = false;	// true = in inventory, false = on floor
	private _alignment: Number = 0;		// 0 is Neutral; < 0 is Evil; > 0 is Good
	private _weight : Number = 0;		// Must be 0 or more
	private _effects : EntityEffects = new EntityEffects();

	constructor(clone?: any) {
		if (clone != null) {
			this.name = clone.name;
			this.held = clone.held;
			this.weight = clone.weight;
			this.effects = clone.effects;
		}
	} // constructor

	clone() : Entity {
		return new Entity(this);
	} // clone

	get name() : String {
		return this._name;
	} // name

	set name(name: String) {
		if (name == null || name == '')
			throw new Error("name cannot be empty");
		this._name = String(name);
	} // name

	get held(): Boolean {
		return this._held;
	} // held

	set held(held: Boolean) {
		this._held = held;
	} // held

	get weight(): Number {
		return this._weight;
	} // weight

	set weight(weight: Number) {
		if (weight < 0)
			throw new Error("weight must be 0 or more");
		this._weight = weight;
	} // weight

	get effects(): EntityEffects {
		return this._effects;
	} // effects

	set effects(effects) {
		this._effects = new EntityEffects(effects);
	} // effects

} // Entity
