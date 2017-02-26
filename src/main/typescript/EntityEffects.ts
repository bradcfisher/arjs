import { Cloneable } from "./Cloneable"
import { EntityEffect } from "./EntityEffect"

/**
 * Collection of effects associated with an Entity.
 */
export class EntityEffects
	implements Cloneable
{

	private _effects: EntityEffect[] = [];

	constructor(clone?: any) {
		if (clone != null) {
			// Clone properties here...
			//this._effects = clone.effects
		}
	}

	clone() {
		return new EntityEffects(this);
	} // clone

} // EntityEffects