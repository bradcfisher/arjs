
import { Cloneable } from "./Cloneable"
import { ItemEffect } from "./ItemEffect"

/**
 * Collection of effects associated with an Item.
 */
export class ItemEffects
	implements Cloneable
{

	private _effects: ItemEffect[] = [];

	constructor(clone?: any) {
		if (clone != null) {
			// Clone properties here...
			//this._effects = clone.effects
		}
	}

	clone() {
		return new ItemEffects(this);
	} // clone

} // ItemEffects
