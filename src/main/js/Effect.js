import { Parse } from "./Parse.js"
import { ItemTypeTrigger } from "./ItemType.js";
import { GameState } from "./GameState.js";
import { GameTimer } from "./GameTimer.js";
import { EventListener } from "./EventDispatcher.js";
import { ReadonlyActiveEffects } from "./ActiveEffects.js";
import { ClassRegistry } from "./Serializer.js";
import { Configurable } from "./Configurable.js";

/**
 * @interface
 */
export class LatentEffectConfig {
	/**
	 * @type {string?}
	 */
	id;

	/**
	 * @type {string?}
	 */
	text;

	/**
	 * @type {boolean?}
	 */
	textVisible;

	/**
	 * @type {(string|EffectType)?}
	 */
	type;

	/**
	 * @type {boolean?}
	 */
	allowMultiple;

	/**
	 * @type {(string|string[])?}
	 */
	triggers;

	/**
	 * @type {number?}
	 */
	initialDelay;

	/**
	 * @type {number?}
	 */
	repetitions;

	/**
	 * @type {number?}
	 */
	interval;

	/**
	 * @type {number?}
	 */
	naturalCureProbability;

	/**
	 * @type {(string|Effect.ActionCallback)?}
	 */
	action;

	// TODO: Should effects have a "nullify" action?  e.g. to cleanup this effect if cancelled
}

/**
 * @interface
 */
export class ActiveEffectConfig extends LatentEffectConfig {
	/**
	 * @type {boolean?}
	 */
	incubating;
 }

 /**
  * @interface
  */
export class EffectTarget {
	/**
	 * @readonly
	 * @type {ReadonlyActiveEffects}
	 */
	effects;
}

/**
 * @typedef { [type:string]:string } TriggerTypesMap
 */

/**
 * @typedef Effect.ActionCallback extends Parse.ActionCallback {
 *     (effect: ActiveEffect, gameState: GameState, target?: EffectTarget): void;
 */

// TODO: triggers are not relevant for active effects...




/**
 *
 * @param {*} val
 * @param {*?} defaultVal
 * @returns {Effect.ActionCallback}
 */
function parseAction(val, defaultVal) {
	return Parse.action(val, defaultVal, ['effect', 'gameState', 'item']);
}

/**
 * Default action callback for new instances.
 * This callback always throws and is intended as a placeholder that must be overridden.
 * @see [[Effect.ActionCallback]]
 * @type {Effect.ActionCallback}
 */
const unimplementedAction =
	parseAction('throw new Error("TODO: Effect action not implemented.");');

/**
 * Base class of all item effects.
 *
 * @implements {Configurable<LatentEffectConfig>}
 */
export class LatentEffect {
	/**
	 * The name/identifier of the effect.
	 * Used for determining duplicates.
	 * @type {string?}
	 */
	#id;

	/**
	 * The text to display for this effect.
	 * @type {string?}
	 */
	#text;

	/**
	 * Whether the text (if any) should be displayed or not.
	 * The type of the effect determines where the text is displayed (eg. in diseases, magic effects, etc)
	 * @type {boolean}
	 */
	#textVisible = false;

	/**
	 * @type {EffectType}
	 */
	#type = EffectType.Unknown;

	/**
	 * @type {boolean}
	 */
	#allowMultiple = false;

	/**
	 * The events/triggers which this effect is initiated by.
	 * @type {Set<string>}
	 * @readonly
	 */
	#triggers = new Set();

	/**
	 * Initial time to wait (in minutes) before executing the effect.
   * AKA, incubation period
	 * May be different than the repetition interval.
	 * @type {number}
	 */
	#initialDelay = 0;

	/**
	 * number of times the effect is executed before deactivated.
	 * Decreased (if not 0) with each execution, and effect is removed when it reaches 0.
	 * 0 means +oo (repeated forever)
	 * @type {number}
	 */
	#repetitions = 1;

	 /**
	  * Time to wait (in minutes) between repetitions.
	  * @type {number}
	  */
	#interval = 0;

	/**
	 * Probability of a natural cure (checked on each execution).
	 * [0..1]
	 * @type {number}
	 */
	#naturalCureProbability = 0;

	/**
	 * The action to perform when this effect is triggered.
	 * @type {Effect.ActionCallback}
	 */
	#action = unimplementedAction;

	/**
	 *
	 * @param {LatentEffectConfig?} config
	 */
	constructor(config) {
		if (config != null) {
			this.configure(config);
		}
	}

	/**
	 *
	 * @param {LatentEffectConfig} config
	 */
	configure(config) {
		this.type = Parse.enum(EffectType, Parse.getProp(config, EffectType.Unknown, "type"));
		this.allowMultiple = Parse.bool(Parse.getProp(config, false, "allowMultiple"));
		this.id = (config.id != null ? Parse.str(config.id) : undefined);
		this.text = (config.text != null ? Parse.str(config.text) : undefined);
		this.textVisible = Parse.bool(Parse.getProp(config, false, "textVisible"));
		this.initialDelay = Parse.duration(Parse.getProp(config, 0, "initialDelay"));
		this.repetitions = Parse.int(Parse.getProp(config, 1, "repetitions"));
		this.interval = Parse.duration(Parse.getProp(config, 0, "interval"));
		this.naturalCureProbability = Parse.num(Parse.getProp(config, 0, "naturalCureProbability"));

		let triggerType = ItemTypeTrigger;
		this.triggers = Parse.set(config.triggers, [], (item) => { return Parse.enum(triggerType, item); });

		this.action = parseAction(config.action, undefined);
	}

	/**
	 * @return {LatentEffectConfig}
	 */
	get config() {
		return {
			id: this.id,
			text: this.text,
			textVisible: this.textVisible,
			type: this.type,
			allowMultiple: this.allowMultiple,
			triggers: Array.from(this.#triggers.values()),
			initialDelay: this.initialDelay,
			repetitions: this.repetitions,
			interval: this.interval,
			naturalCureProbability: this.naturalCureProbability,
			action: this.action.sourceCode
		}
	}

	/**
	 * Ensures the object has been configured and has valid trigger types.
	 *
	 * @param {TriggerTypesMap} triggerTypes
	 *
	 * @throws Error if the effect is not configured or an invalid trigger type
	 * 		is found.
	 */
	assertProperties(triggerTypes) {
		if (this.action == unimplementedAction) {
			throw new Error("Effect not configured");
		}

		for (let item of this.triggers) {
			if (!triggerTypes[item]) {
				throw new Error("Invalid trigger type: "+ item);
			}
		}
	}

	/**
	 * Sets a new effect type value.
	 * @param {EffectType} value The new effect type to assign.
	 */
	set type(value) {
		this.#type = value;
	}

	/**
	 * Retrieves the effect type.
	 * @type {EffectType}
	 */
	get type() {
		return this.#type;
	}

	/**
	 * Whether this effect may be applied multiple times (or stacked).
	 *
	 * Two effects are equal if their Type/Interval/ProbToRemove/Action/Offset/NbBlocks/Gab/Param are the same.
	 * @type {boolean}
	 */
	get allowMultiple() {
		return this.#allowMultiple;
	}

	/**
	 * @param {boolean} allowMultiple
	 */
	set allowMultiple(allowMultiple) {
		this.#allowMultiple = allowMultiple;
	}

	get id() {
		return this.#id;
	}

	set id(value) {
		if (value != null) {
			value = String(value);
			if (value.trim() == "") {
				value = undefined;
			}
		}
		this.#id = value;
	}

	get text() {
		return this.#text;
	}

	set text(value) {
		if (value != null) {
			value = String(value);
			if (value.trim() == "") {
				value = undefined;
			}
		}
		this.#text = value;
	}

	get textVisible() {
		return this.#textVisible;
	}

	set textVisible(value) {
		this.#textVisible = value;
	}

	get triggers() {
		return this.#triggers;
	}

	set triggers(value) {
		this.#triggers.clear();
		for (let item of value.values()) {
			this.#triggers.add(item);
		}
	}

	get initialDelay() {
		return this.#initialDelay;
	}

	set initialDelay(value) {
		if (!(value >= 0)) {
			throw new Error("initialDelay must be 0 or greater");
		}
		this.#initialDelay = value;
	}

	get repetitions() {
		return this.#repetitions;
	}

	set repetitions(value) {
		if (!(value >= 0)) {
			throw new Error("repetitions must be 0 or greater");
		}
		this.#repetitions = value;
	}

	get interval() {
		return this.#interval;
	}

	set interval(value) {
		if (!(value >= 0)) {
			throw new Error("interval must be 0 or greater");
		}
		this.#interval = value;
	}

	get naturalCureProbability() {
		return this.#naturalCureProbability;
	}

	set naturalCureProbability(value) {
		if (value < 0 || value > 1)
			throw new Error("naturalCureProbability must be in the range [0..1]");
		this.#naturalCureProbability = value;
	}

	get action() {
		return this.#action;
	}

	set action(action) {
		this.#action = action;
	}

	/**
	 *
	 * @param {string} trigger
	 * @param {EffectTarget} target
	 * @returns {ActiveEffect|undefined}
	 */
	trigger(trigger, target) {
		if (this.#triggers.has(trigger)) {
			return new ActiveEffect(this, target);
		}
		return undefined;
	}

}

/**
 * Static initializer for registering deserializer with private member access.
 */
(() => {
	ClassRegistry.registerClass(
		"LatentEffect", LatentEffect,
		(obj, serializer) => {
			serializer.writeProp(obj.config);
		},
		(obj, data, deserializer) => {
			obj.configure(deserializer.readProp(data));
		}
	);
})();


/**
 * An Effect that is currently active and attached to a specific context object (Denizen/Item).
 * @implements EventListener, Configurable<ActiveEffectConfig>
 */
export class ActiveEffect
	extends LatentEffect
{

	/**
	 * @type {EffectTarget}
	 */
	#target;

	/**
	 * @type {boolean}
	 */
	#incubating = true;

	/**
	 *
	 * @param {ActiveEffectConfig|LatentEffect} config
	 * @param {EffectTarget} target
	 */
	constructor(config, target) {
		super(config instanceof LatentEffect ? config.config : config);

		this.#target = target;

		GameState.getInstance().clock.createTimer(
			this.initialDelay
		).on('timer', this).start(true);
	} // constructor

	/**
	 *
	 * @param {ActiveEffectConfig} config
	 */
	configure(config) {
		super.configure(config);
		this.#incubating = Parse.bool(Parse.getProp(config, null, "incubating"), true);
	}

	/**
	 * Whether the effect is currently incubating or not.
	 *
	 * An incubating effect is one for which a timer has been set for the `initialDelay`
	 * that has not yet fired.
	 */
	get incubating() {
		return this.#incubating;
	} // incubating

	/**
	 *
	 * @param {boolean} value
	 */
	#setIncubating(value) {
		this.#incubating = value;
	} // incubating

	get target() {
		return this.#target;
	}

	/**
	 *
	 * @param {string} event
	 * @param {*} data
	 */
	processEvent(event, data) {
		if (event == GameTimer.Event.timer) {
			/**
			 * @type GameTimer
			 */
			let timer = data;

			if (this.incubating) {
				this.#setIncubating(false);
			}

			// Execute the action
			this.action(this, GameState.getInstance(), this.target);

			// Handle remaining repetitions
			if (this.repetitions != 1) {
				timer.delay = this.interval;
				timer.repetitions = (this.repetitions == 0 ? 0 : this.repetitions - 1);
				timer.start();
			}
		}
	}

	/**
	 * Cancel this effect and remove it from the target.
	 *
	 * If this is an incubating clean up effect, it will execute immediately to
	 * revert the prior stat modification, etc. it is intended to clean up.
	 *
	 * from any further action
	 */
	cancel() {
		// Remove effect from the list of active effects
		this.target.effects.remove(this, false);

		/*
		if (this.isCleanup && this.incubating) {
			// TODO: Force timer to fire immediately and execute the action
			// Need to have access to the GameState, Character and Item here...
		}

		*/
	}
}

/**
 * Static initializer for registering deserializer with private member access.
 */
(() => {
	ClassRegistry.registerClass(
		"ActiveEffect", ActiveEffect,
		(obj, serializer) => {
			serializer.writeProp(obj.config);
		},
		(obj, data, deserializer) => {
			obj.configure(deserializer.readProp(data));
		}
	);
})();


/**
 * Enumeration of item effect types.
 * @enum {number}
 */
export const EffectType = Object.freeze({
	/**
	 * (0) - Unknown
	 * @readonly
	 */
	Unknown: 0,

	/**
	 * (1) - Disease
	 * @readonly
	 */
	Disease: 1,

	/**
	 * (2) - Poison
	 * @readonly
	 */
	Poison: 2,

	/**
	 * (3) - Spell
	 * @readonly
	 */
	Spell: 3,

	/**
	 * (4) - Curse
	 * @readonly
	 */
	Curse: 4,

	/**
	 * (5) - Unknown2
	 * @readonly
	 */
	//Unknown2: 5,		// Tome / Scroll / Trump Card / Eye / Horn / Wand?

	/**
	 * (6) - Potion
	 * @readonly
	 */
	Potion: 6

	/**
	 * (7) - Unknown3
	 * @readonly
	 */
	//Unknown3: 7		// Tome / Scroll / Trump Card / Eye / Horn / Wand?
}); // EffectType

// Wands & Eyes generally seem to be more on the "weapon" side, otherwise "magic"?
// Horns are 1/3 weapon, 2/3 magic?
// Scrolls are basically magic
// Trump Cards are mostly permanent effects, otherwise basically time-limited magic
// Tomes are permanent effects
