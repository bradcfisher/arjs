
// TODO: Separate HeldItem from ItemType. HeldItem would simply reference an ItemType (by id), along with other properties like quantity held, remainingUses, etc.  A character's inventory would be a list of HeldItems (one per stack).

//	private _identified: boolean = true;

	// TODO: If on the floor, then where is it?  Add a location property?
	/*
	private _location: {
		"scenario": string,
		"map": string,
		"x": number,
		"y": number
	}
	*/


/*
	pickup(gameState: GameState): void {
		if (!this.held) {
			this.held = true;
			this.effects.trigger(Effect.Trigger.Pickup, gameState, this);
		}
	}

	drop(gameState: GameState): void {
		this.held = false;
		// TODO: When dropping an item, it should be marked with the player's current location.
		this.effects.trigger(Effect.Trigger.Drop, gameState, this);
	}

	use(gameState: GameState): void {
		// TODO: use/equip the item
		this.effects.trigger(Effect.Trigger.Use, gameState, this);
	}

	unuse(gameState: GameState): void {
		// TODO: unuse/unequip the item
		this.effects.trigger(Effect.Trigger.Unuse, gameState, this);
	}

	destroy(gameState: GameState): void {
		// TODO: destroy the item
		this.effects.trigger(Effect.Trigger.Destroy, gameState, this);
	}
*/
