
import { Entity } from "./Entity"

/**
 * Base class for all stackable items (coins, crystals, time pieces, etc)
 */
export class StackableEntity
	extends Entity
{

	private _quantity: Number;

	constructor(clone?: any) {
		super(clone);

		if (clone != null) {
			this.quantity = clone.quantity;
		}
	} // constructor

	clone(): StackableEntity {
		return new StackableEntity(this);
	} // clone

	get quantity(): Number {
		return this._quantity;
	} // quantity

	set quantity(quantity: Number) {
		if (quantity <= 0)
			throw new Error("quantity must be greater than 0");
		this._quantity = quantity;
	} // quantity

} // StackableEntity