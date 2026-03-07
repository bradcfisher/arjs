import { ClassRegistry } from "./Serializer.js"
import { Parse } from "./Parse.js";
import { StatAdjustment, StatAdjustmentConfig } from "./StatAdjustment.js";
import { GameTimer } from "./GameTimer.js";
import { EventListener } from "./EventDispatcher.js";
import { GameState } from "./GameState.js";
import { Configurable } from "./Configurable.js";

/**
 * @implements {EventListener}
 * @implements {Configurable<ReadonlyArray<StatAdjustmentConfig>>}
 */
export class StatAdjustments {

	/**
	 * @type {Map<string, Map<string, StatAdjustment>>}
	 * @readonly
	 */
	#adjustments = new Map();

	/**
	 * Map of expiration timers associated with adjustments.
	 * @type {Map<StatAdjustment, GameTimer>}
	 * @readonly
	 */
	#expirationTimers = new Map();

	/**
	 * @type {number}
	 */
	#amount = 0;

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	static #initializeClass_StatAdjustments = (() => {
		ClassRegistry.registerClass(
			"StatAdjustments", StatAdjustments,
			(obj, serializer) => {
				serializer.writeProp("entries", obj.config);
			},
			(obj, data, deserializer) => {
				obj.configure(deserializer.readProp(data, "entries"));
			}
		);
	})();

	/**
	 * Constructs a new instance.
	 *
	 * @param {(StatAdjustments|ReadonlyArray<StatAdjustmentConfig>)?} config The configuration object
	 *        to clone adjustment values from.  Either a `StatAdjustments` instance or a list of objects
	 *        suitable for constructing `StatAdjustment` instances from.
	 */
	constructor(config) {
		if (config != null) {
			this.configure(config);
		}
	}

	/**
	 *
	 * @param {(StatAdjustments|ReadonlyArray<StatAdjustmentConfig>)?} config
	 */
	configure(config) {
		if (config instanceof StatAdjustments) {
			config = config.config;
		}

		if (this.#adjustments) {
			this.clear();
		}

		if (config != null) {
			const adjustments = Parse.array(
				config,
				[],
				(item) => {
					return new StatAdjustment(this, item);
				}
			);

			this.addAdjustments.apply(this, adjustments);
		}
	}

	/**
	 * An array of the current adjustment configurations.
	 *
	 * This is a rather expensive operation, as it creates a config object for all the
	 * current adjustments on demand.
	 *
	 * @type {ReadonlyArray<StatAdjustmentConfig>
	 */
	get config() {
		return Array.from(this);
	}

	/**
	 * The total adjustment amount.
	 */
	get amount() {
		return this.#amount;
	}

	/**
	 * Iterates over the current adjustment configurations.
	 * @type {Iterator<StatAdjustmentConfig>}
	 */
	[Symbol.iterator]() {
		/**
		 *
		 * @param {Map<string, Map<string, StatAdjustment>>} mapping
		 */
		function* iterateValues(mapping) {
			for (let nameMap of mapping.values()) {
				for (let adj of nameMap.values()) {
					yield adj.config;
				}
			}
		}

		return iterateValues(this.#adjustments);
	}

	/**
	 * Removes all adjustments.
	 */
	clear() {
		for (let type in this.#adjustments) {
			this.removeAdjustment(type);
		}
	}

	/**
	 * Adds
	 * @param {StatAdjustmentConfig} adjustments
	 * @param {StatAdjustmentConfig[]} rest
	 */
	addAdjustments(adjustment, ...rest) {
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
	 * @param {string} type The type of adjustment to apply.
	 * @param {string?} name The name for the adjustment.  This value will have leading and
	 *				    trailing whitespace trimmed.
	 * @param {number} amount The amount of the adjustment.  Must be greater than 0.
	 * @param {(number|string)?} expiration A duration after which the adjustment should be automatically
	 *				removed.  If specified and not 0, any existing entry will be replaced.
	 *
	 * @throws Error if the `amount` is NaN or not greater than 0, or an invalid duration value is
	 *		provided for `expiration`.
	 */
	addAdjustment(type, name, amount, expiration) {

// TODO: additional options?
//    stackLimit (e.g. allow up to X adjustments for a given type/name, default to 1)
//    updateMode - What to do for existing entries: adjust, replace, fail
//    createMode - If entry doesn't exist: create, fail

		if (!(amount > 0)) { // Also catches NaN
			throw new Error("The amount must be greater than 0");
		}

		if (expiration != null) {
			expiration = Parse.duration(expiration);
		} else {
			expiration = Number.NaN;
		}

		name = ((name == null) ? "" : name.trim());

		// Find existing adjustment or create a new one
		var nameMap = this.#adjustments.get(type);
		if (nameMap == null) {
			nameMap = new Map();
			this.#adjustments.set(type, nameMap);
		}

		const adjustment =
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

		this.#amount += amount;
	}

	/**
	 * Cancels any pending timer for the specified adjustment.
	 * @param {StatAdjustment} adjustment The adjustment to remove any timer for.
	 */
	#cancelTimer(adjustment) {
		const timer = this.#expirationTimers.get(adjustment);
		if (timer != null) {
			timer.stop();
			this.#expirationTimers.delete(adjustment);
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
	 * @param {string} type The type of adjustment to remove.
	 * @param {string?} name The name of the adjustment to remove.  If not specified all adjustments
	 *        of the given `type` are removed, regardless of `name`.
	 * @param {number?} amount The amount to decrease the adjustment by.  Ignored if `name` is not
	 *        provided.  If no `amount` is given, any matching adjustment will be
	 *        completely removed.  If provided, this value must be greater than 0.
	 *
	 * @throws Error if a provided `amount` is NaN or not greater than 0.
	 */
	removeAdjustment(type, name, amount) {
		if ((amount != null) && !(amount > 0)) { // Also catches NaN
			throw new Error("The amount must be greater than 0 if provided");
		}

		if (name == null) {
			// Remove all adjustments of the specified type
			const nameMap = this.#adjustments.get(type);
			if (nameMap != null) {
				for (let name of nameMap.keys()) {
					this.removeAdjustment(type, name);
				}
			}
		} else {
			name = name.trim();

			// Find existing adjustment
			const nameMap = this.#adjustments.get(type);
			if (nameMap != null) {
				const adjustment = nameMap.get(name);

				if (adjustment != null) {
					if (amount == null) {
						nameMap.delete(name);
						this.#amount -= adjustment.amount;
						this.#cancelTimer(adjustment);
					} else {
						if (adjustment.amount > amount) {
							adjustment.amount -= amount;
							this.#amount -= amount;
						} else {
							nameMap.delete(name);
							this.#amount -= adjustment.amount;
							this.#cancelTimer(adjustment);
						}
					}
				}
			}
		}
	}

	/**
	 * Determines whether an adjustment exists.
	 *
	 * @param {string?} type The type to test for.  If not specified, will match if any adjustment exists.
	 * @param {string?} name The name to test for.  Ignored if `type` is not provided.  If not specified,
	 * 			will match if any adjustment of the specified type exists.
	 *
	 * @return {boolean} `true` if a matching adjustment is found, `false` otherwise.
	 */
	hasAdjustment(type, name) {
		if (type == null) {
			return (this.#amount > 0);
		}

		// Find existing adjustment
		const nameMap = this.#adjustments.get(type);
		if (nameMap != null) {
			if (name == null) {
				return true;
			}

			return nameMap.has(name);
		}

		return false;
	}

	/**
	 * Processes timer events.
	 *
	 * @param {any} context
	 * @param {string} event
	 * @param {any} data
	 */
	processEvent(context, event, data) {
		switch (event) {
			case "timer":
				/** @type {GameTimer} */
				const timer = context;
				/** @type {StatAdjustment} */
				const adjustment = timer.data;
				if (this.#expirationTimers.get(adjustment) === timer) {
					this.removeAdjustment(adjustment.type, adjustment.name);
				}
				break;
		}
	}

	/**
	 * Retrieves the remaining expiration delay for the specified adjustment.
	 * This method is called from StatAdjustment to determine the expiration property value.
	 * @param {StatAdjustment} adjustment The adjustment instance to retrieve the remaining expiration delay for.
	 * @return {number}
	 */
	#getAdjustmentExpiration(adjustment) {
		const timer = this.#expirationTimers.get(adjustment);
		if (timer == null) {
			return Number.NaN;
		}

		return timer.remainingDelay;
	}

	/**
	 * Updates/replaces the remaining expiration delay for the specified adjustment.
	 * This method is called from StatAdjustment.
	 * @param {StatAdjustment} adjustment The adjustment to modify the expiration delay for.
	 * @param {number?} expiration The new expiration delay.
	 */
	#setAdjustmentExpiration(adjustment, expiration) {
		let timer = this.#expirationTimers.get(adjustment);
		if (timer == null) {
			throw new Error();
		}

		if ((expiration == null) || Number.isNaN(expiration)) {
			this.#cancelTimer(adjustment);
		} else {
			if (timer != null) {
				timer.stop();
				timer.delay = expiration;
				timer.start();
			} else {
				// TODO: Need a way to determine the game state/clock here for creating the timer...
				const clock = GameState.getInstance().clock;

				timer = clock.setTimeout(expiration, this);
				this.#expirationTimers.set(adjustment, timer);
			}
		}
	}
}
