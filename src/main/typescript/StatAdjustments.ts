import { ClassRegistry, Serializer, Deserializer } from "./Serializer"
import { Parse } from "./Parse";
import { StatAdjustment, StatAdjustmentConfig } from "./StatAdjustment";
import { GameTimer } from "./GameTimer";
import { GameClock } from "./GameClock";
import { EventListener } from "./EventDispatcher";
import { GameState } from "./GameState";
import { Configurable } from "./Configurable";

type NameMap = Map<string, StatAdjustment>;
type TypeMap = Map<string, NameMap>;

export class StatAdjustments
	implements EventListener, Configurable<ReadonlyArray<StatAdjustmentConfig>>
{

	/**
	 * @see [[addAdjustment()]]
	 * @see [[removeAdjustment()]]
	 * @see [[hasAdjustment()]]
	 */
	private _adjustments: TypeMap = new Map();

	/**
	 * Map of expiration timers associated with adjustments.
	 */
	private _expirationTimers: Map<StatAdjustment, GameTimer> = new Map();

	/**
	 * @see [[amount]]
	 */
	private _amount: number = 0;

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	private static _initializeClass_StatAdjustments: void = (() => {
		ClassRegistry.registerClass(
			"StatAdjustments", StatAdjustments,
			(obj: StatAdjustments, serializer: Serializer): void => {
				serializer.writeProp("entries", obj.config);
			},
			(obj: StatAdjustments, data: any, deserializer: Deserializer): void => {
				obj.configure(deserializer.readProp(data, "entries"));
			}
		);
	})();

	/**
	 * Constructs a new instance.
	 *
	 * @param config The configuration object to clone adjustment values from.  Either a
	 * 				`StatAdjustments` instance or a list of objects suitable for constructing
	 * 				`StatAdjustment` instances from.
	 */
	constructor(config?: StatAdjustments|ReadonlyArray<StatAdjustmentConfig>) {
		if (config != null)
			this.configure(config);
	}

	configure(config: StatAdjustments|ReadonlyArray<StatAdjustmentConfig>|undefined|null): void {
		if (config instanceof StatAdjustments)
			config = config.config;

		if (this._adjustments)
			this.clear();

		if (config != null) {
			let adjustments: StatAdjustment[] = Parse.array(
				config,
				[],
				(item: any): StatAdjustment => {
					return new StatAdjustment(this, item as StatAdjustmentConfig);
				}
			);

			this.addAdjustments.apply(this, adjustments);
		}
	}

	/**
	 * Retrieves an array of the current adjustment configurations.
	 *
	 * This is a rather expensive operation, as it creates a config object for all the
	 * current adjustments.
	 *
	 * @return An array of the current adjustment configurations.
	 */
	get config(): ReadonlyArray<StatAdjustmentConfig> {
		return Array.from(this);
	}

	/**
	 * Retrieves the total adjustment amount.
	 * @return The total adjustment amount.
	 */
	get amount(): number {
		return this._amount;
	}

	/**
	 * Iterates over the current adjustment configurations.
	 */
	[Symbol.iterator](): Iterator<StatAdjustmentConfig> {
		function* iterateValues(mapping: TypeMap) {
			for (let nameMap of mapping.values()) {
				for (let adj of nameMap.values()) {
					yield adj.config;
				}
			}
		}

		return iterateValues(this._adjustments);
	}

	/**
	 * Removes all adjustments.
	 */
	public clear(): void {
		for (let type in this._adjustments) {
			this.removeAdjustment(type);
		}
	}

	/**
	 * Adds
	 * @param adjustments
	 */
	public addAdjustments(adjustment: StatAdjustmentConfig, ...rest: StatAdjustmentConfig[]) {
		this.addAdjustment(adjustment.type, adjustment.name, adjustment.amount, adjustment.expiration);
		for (let adj of rest) {
			this.addAdjustment(adj.type, adj.name, adj.amount, adj.expiration);
		}
	}

	/**
	 * Applies a new adjustment amount.
	 *
	 * If an adjustment already exists for the `type` and `name`, and the new adjustment does
	 * not have an `expiration`, the new amount will be added to the existing adjustment.  If
	 * an `expiration` is given, any existing entry will be replaced.
	 *
	 * If an existing entry is not found, a new entry will be added.
	 *
	 * @param type The type of adjustment to apply.
	 * @param name The name for the adjustment.  This value will have leading and
	 *				trailing whitespace trimmed.
	 * @param amount The amount of the adjustment.  Must be greater than 0.
	 * @param expiration A duration after which the adjustment should be automatically
	 *				removed.  If specified and not 0, any existing entry will be replaced.
	 *
	 * @throws Error if the `amount` is NaN or not greater than 0, or an invalid duration value is
	 *		provided for `expiration`.
	 */
	addAdjustment(type: string, name: string|null|undefined, amount: number, expiration?: number|string) {

// TODO: additional options?
//    stackLimit (e.g. allow up to X adjustments for a given type/name, default to 1)
//    updateMode - What to do for existing entries: adjust, replace, fail
//    createMode - If entry doesn't exist: create, fail

		if (!(amount > 0)) // Also catches NaN
			throw new Error("The amount must be greater than 0");

		if (expiration != null)
			expiration = Parse.duration(expiration);
		else
			expiration = Number.NaN;

		name = ((name == null) ? "" : name.trim());

		// Find existing adjustment or create a new one
		var nameMap: NameMap|undefined = this._adjustments.get(type);
		if (nameMap == null) {
			nameMap = new Map();
			this._adjustments.set(type, nameMap);
		}

		var adjustment: StatAdjustment|undefined =
			(expiration == null ? nameMap.get(name) : undefined);

		if (adjustment == null) {
			adjustment = new StatAdjustment(this);
			adjustment.amount = amount;
			adjustment.name = name;
			adjustment.type = type;

			nameMap.set(name, adjustment);

			adjustment.expiration = expiration;
		} else {
			adjustment.amount += amount;
		}

		this._amount += amount;
	}

	/**
	 * Cancels any pending timer for the specified adjustment.
	 * @param adjustment The adjustment to remove any timer for.
	 */
	private cancelTimer(adjustment: StatAdjustment): void {
		let timer: GameTimer|undefined = this._expirationTimers.get(adjustment);
		if (timer != null) {
			timer.stop();
			this._expirationTimers.delete(adjustment);
		}
	}

	/**
	 * Removes or decreases an adjustment.
	 *
	 * If `name` is not provided, all adjustments of the given `type` are removed, regardless
	 * of `name`, and `amount` is ignored.
	 *
	 * If `amount` is not provided, any matching adjustment will be completely removed instead
	 * of reduced.
	 *
	 * If `amount` is greater or equal to the matched adjustment, the adjustment will be removed.
	 *
	 * @param type The type of adjustment to remove.
	 * @param name The name of the adjustment to remove.  If not specified all adjustments
	 *			of the given `type` are removed, regardless of `name`.
	 * @param amount The amount to decrease the adjustment by.  Ignored if `name` is not
	 *			provided.  If no `amount` is given, any matching adjustment will be
	 *			completely removed.  If provided, this value must be greater than 0.
	 *
	 * @throws Error if a provided `amount` is NaN or not greater than 0.
	 */
	removeAdjustment(type: string, name?: string, amount?: number) {
		if ((amount != null) && !(amount > 0)) // Also catches NaN
			throw new Error("The amount must be greater than 0 if provided");

		if (name == null) {
			// Remove all adjustments of the specified type
			let nameMap: NameMap|undefined = this._adjustments.get(type);
			if (nameMap != null) {
				for (let name of nameMap.keys())
					this.removeAdjustment(type, name);
			}
		} else {
			name = name.trim();

			// Find existing adjustment
			let nameMap: NameMap|undefined = this._adjustments.get(type);
			if (nameMap != null) {
				let adjustment: StatAdjustment|undefined = nameMap.get(name);

				if (adjustment != null) {
					if (amount == null) {
						nameMap.delete(name);
						this._amount -= adjustment.amount;
						this.cancelTimer(adjustment);
					} else {
						if (adjustment.amount > amount) {
							adjustment.amount -= amount;
							this._amount -= amount;
						} else {
							nameMap.delete(name);
							this._amount -= adjustment.amount;
							this.cancelTimer(adjustment);
						}
					}
				}
			}
		}
	}

	/**
	 * Determines whether an adjustment exists.
	 *
	 * @param type The type to test for.  If not specified, will match if any adjustment exists.
	 * @param name The name to test for.  Ignored if `type` is not provided.  If not specified,
	 * 			will match if any adjustment of the specified type exists.
	 *
	 * @return `true` if a matching adjustment is found, `false` otherwise.
	 */
	hasAdjustment(type?: string, name?: string): boolean {
		if (type == null)
			return (this._amount > 0);

		// Find existing adjustment
		let nameMap: NameMap|undefined = this._adjustments.get(type);
		if (nameMap != null) {
			if (name == null)
				return true;

			return nameMap.has(name);
		}

		return false;
	}

	/**
	 * Processes timer events.
	 */
	processEvent(context: Object, event: string, data?: any): void {
		switch (event) {
			case "timer":
				let timer: GameTimer = context as GameTimer;
				let adjustment: StatAdjustment = timer.data as StatAdjustment;
				if (this._expirationTimers.get(adjustment) === timer)
					this.removeAdjustment(adjustment.type, adjustment.name);
				break;
		}
	}

	/**
	 * Retrieves the remaining expiration delay for the specified adjustment.
	 * This method is called from StatAdjustment to determine the expiration property value.
	 * @param adjustment The adjustment instance to retrieve the remaining expiration delay for.
	 */
	private getAdjustmentExpiration(adjustment: StatAdjustment): number {
		let timer: GameTimer|undefined = this._expirationTimers.get(adjustment);
		if (timer == null)
			return Number.NaN;

		return timer.remainingDelay;
	}

	/**
	 * Updates/replaces the remaining expiration delay for the specified adjustment.
	 * This method is called from StatAdjustment.
	 * @param adjustment The adjustment to modify the expiration delay for.
	 * @param expiration The new expiration delay.
	 */
	private setAdjustmentExpiration(adjustment: StatAdjustment, expiration: number|undefined): void {
		let timer: GameTimer|undefined = this._expirationTimers.get(adjustment);
		if (timer == null) {
			throw new Error();
		}

		if ((expiration == null) || Number.isNaN(expiration)) {
			this.cancelTimer(adjustment);
		} else {
			let timer: GameTimer|undefined = this._expirationTimers.get(adjustment);
			if (timer != null) {
				timer.stop();
				timer.delay = expiration;
				timer.start();
			} else {
				// TODO: Need a way to determine the game state/clock here for creating the timer...
				let clock: GameClock = GameState.getInstance().clock;

				timer = clock.setTimeout(expiration, this);
				this._expirationTimers.set(adjustment, timer);
			}
		}
	}
}
