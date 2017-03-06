
import { Cloneable } from "./Cloneable"
import { ItemEffect } from "./ItemEffect"

/**
 * Base class for all items.
 */
export class Item
	implements Cloneable
{

	/**
	 * @see [[name]]
	 */
	private _name : String;

	/**
	 * @see [[held]]
	 */
	private _held : Boolean = false;	// true = in inventory, false = on floor

	/**
	 * @see [[alignment]]
	 */
	private _alignment: Number = 0;		// 0 is Neutral; < 0 is Evil; > 0 is Good

	/**
	 * @see [[weight]]
	 */
	private _weight : Number = 0;		// Must be 0 or more

	/**
	 * @see [[effects]]
	 */
	private _effects : ItemEffect[];

	/**
	 * Constructs a new Item.
	 *
	 * @param	clone	The object to clone properties from (if any)
	 */
	constructor(clone?: any) {
		this._effects = [];

		if (clone != null) {
			this.name = clone.name;
			this.held = clone.held;
			this.weight = clone.weight;
			this.effects = clone.effects;
		}
	} // constructor

	/**
	 * Creates a deep clone of this Item.
	 * @return	A new Item instance with all of this Item's properties cloned.
	 */
	clone() : Item {
		return new Item(this);
	} // clone

	/**
	 * Retrieves the name of the item.
	 * @return	The name of the item.
	 */
	get name() : String {
		return this._name;
	} // name

	/**
	 * Sets the name of the item.
	 * @param	name	The new name for the item.  Cannot be empty.
	 */
	set name(name: String) {
		if (name == null || name == '')
			throw new Error("name cannot be empty");
		this._name = String(name);
	} // name

	/**
	 * Whether the item is currently in the character's inventory or not.
	 * @return	`true` if the item is currently in the character's inventory, `false` if not.
	 */
	get held(): Boolean {
		return this._held;
	} // held

	/**
	 * Sets whether the item is currently in the character's inventory or not.
	 * @param	held	Set to `true` if the item is currently in the character's inventory,
	 *					`false` if not.
	 */
	set held(held: Boolean) {
		this._held = held;
	} // held

	/**
	 * Retrieves the item's weight.
	 * @return	The item's weight (0 or greater).
	 */
	get weight(): Number {
		return this._weight;
	} // weight

	/**
	 * Sets the item's weight.
	 * @param	weight	The weight of the item.
	 */
	set weight(weight: Number) {
		if (weight < 0)
			throw new Error("weight must be 0 or more");
		this._weight = weight;
	} // weight

	/**
	 * Retrieves the effects currently associated with the item.
	 * @return	The effects currently associated with the item.
	 */
	get effects(): ReadonlyArray<ItemEffect> {
		return this._effects;
	} // effects

	/**
	 * Sets the effects associated with the item.
	 * @param	effects		The set of effects to assign to the item.  The effects passed in are
	 *						cloned before assigning.
	 */
	set effects(effects: ReadonlyArray<ItemEffect>) {
		this._effects = [];
		for (let effect of effects) {
			this._effects.push(effect.clone());
		}
	} // effects

} // Item
