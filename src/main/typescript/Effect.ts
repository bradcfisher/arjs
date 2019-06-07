import { Parse } from "./Parse"
import { ItemTypeTrigger } from "./ItemType";
import { GameState } from "./GameState";
import { GameTimer } from "./GameTimer";
import { EventListener } from "./EventDispatcher";
import { ReadonlyActiveEffects } from "./ActiveEffects";
import { Deserializer, Serializer, ClassRegistry } from "./Serializer";
import { Configurable } from "./Configurable";


export interface LatentEffectConfig {
	id?: string;
	text?: string;
	textVisible?: boolean;
	type?: string|Effect.Type;
	allowMultiple?: boolean;
	triggers?: string|string[];
	initialDelay?: number;
	repetitions?: number;
	interval?: number;
	naturalCureProbability?: number;
	action?: string|Effect.ActionCallback;

	// TODO: Should effects have a "nullify" action?  e.g. to cleanup this effect if cancelled
}

// TODO: triggers are not relevant for active effects...

export interface ActiveEffectConfig
	extends LatentEffectConfig
{
	incubating?: boolean;
}

export interface EffectTarget {
	readonly effects: ReadonlyActiveEffects;
}

export type TriggerTypesMap = {[type:string]:string}


function parseAction(val: any, defaultVal?: any): Effect.ActionCallback {
	return <Effect.ActionCallback>Parse.action(val, defaultVal, ['effect', 'gameState', 'item']);
}

/**
 * Default action callback for new instances.
 * This callback always throws and is intended as a placeholder that must be overridden.
 * @see [[Effect.ActionCallback]]
 */
let unimplementedAction: Effect.ActionCallback =
	parseAction('throw new Error("TODO: Effect action not implemented.");');

/**
 * Base class of all item effects.
 */
export class LatentEffect
	implements Configurable<LatentEffectConfig>
{
	/**
	 * The name/identifier of the effect.
	 * Used for determining duplicates.
	 */
	private _id?: string;

	/**
	 * The text to display for this effect.
	 */
	private _text?: string

	/**
	 * Whether the text (if any) should be displayed or not.
	 * The type of the effect determines where the text is displayed (eg. in diseases, magic effects, etc)
	 */
	private _textVisible: boolean = false;

	/**
	 * @see [[type]]
	 */
	private _type: Effect.Type = Effect.Type.Unknown;

	/**
	 * @see [[allowMultiple]]
	 */
	private _allowMultiple: boolean = false;

	/**
	 * The events/triggers which this effect is initiated by.
	 */
	private readonly _triggers: Set<string> = new Set();

	/**
	 * Initial time to wait (in minutes) before executing the effect.
   * AKA, incubation period
	 * May be different than the repetition interval.
	 */
	private _initialDelay: number = 0;

	/**
	 * number of times the effect is executed before deactivated.
	 * Decreased (if not 0) with each execution, and effect is removed when it reaches 0.
	 * 0 means +oo (repeated forever)
	 */
	private _repetitions: number = 1;

	 /**
	  * Time to wait (in minutes) between repetitions.
	  */
	private _interval: number = 0;

	/**
	 * Probability of a natural cure (checked on each execution).
	 * [0..1]
	 */
	private _naturalCureProbability: number = 0;

	/**
	 * The action to perform when this effect is triggered.
	 */
	private _action: Effect.ActionCallback = unimplementedAction;

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	private static _initializeClass_LatentEffect: void = (() => {
		ClassRegistry.registerClass(
			"LatentEffect", LatentEffect,
			(obj: LatentEffect, serializer: Serializer): void => {
				serializer.writeProp(obj.config);
			},
			(obj: LatentEffect, data: any, deserializer: Deserializer): void => {
				obj.configure(deserializer.readProp(data) as LatentEffectConfig);
			}
		);
	})();

	constructor(config?: LatentEffectConfig) {
		if (config != null)
			this.configure(config);
	}

	configure(config: LatentEffectConfig): void {
		this.type = Parse.enum(Effect.Type, Parse.getProp(config, Effect.Type.Unknown, "type"));
		this.allowMultiple = Parse.bool(Parse.getProp(config, false, "allowMultiple"));
		this.id = (config.id != null ? Parse.str(config.id) : undefined);
		this.text = (config.text != null ? Parse.str(config.text) : undefined);
		this.textVisible = Parse.bool(Parse.getProp(config, false, "textVisible"));
		this.initialDelay = Parse.duration(Parse.getProp(config, 0, "initialDelay"));
		this.repetitions = Parse.int(Parse.getProp(config, 1, "repetitions"));
		this.interval = Parse.duration(Parse.getProp(config, 0, "interval"));
		this.naturalCureProbability = Parse.num(Parse.getProp(config, 0, "naturalCureProbability"));

		let triggerType: any = ItemTypeTrigger;
		this.triggers = Parse.set(config.triggers, [], (item: any) => { return Parse.enum(triggerType, item); });

		this.action = parseAction(config.action, undefined);
	}

	get config(): LatentEffectConfig {
		return {
			id: this.id,
			text: this.text,
			textVisible: this.textVisible,
			type: this.type,
			allowMultiple: this.allowMultiple,
			triggers: Array.from(this._triggers.values()),
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
	 * @throws Error if the effect is not configured or an invalid trigger type
	 * 		is found.
	 */
	assertProperties(triggerTypes: TriggerTypesMap): void {
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
	 * @param value The new effct type to assign.
	 */
	set type(value: Effect.Type) {
		this._type = value;
	}

	/**
	 * Retrieves the effect type.
	 * @return The effect type.
	 */
	get type(): Effect.Type {
		return this._type;
	}

	/**
	 * Whether this effect may be applied multiple times (or stacked).
	 *
	 * Two effects are equal if their Type/Interval/ProbToRemove/Action/Offset/NbBlocks/Gab/Param are the same.
	 */
	get allowMultiple(): boolean {
		return this._allowMultiple;
	}

	set allowMultiple(allowMultiple: boolean) {
		this._allowMultiple = allowMultiple;
	}

	get id(): string|undefined {
		return this._id;
	}

	set id(value: string|undefined) {
		if (value != null) {
			value = String(value);
			if (value.trim() == "")
				value = undefined;
		}
		this._id = value;
	}

	get text(): string|undefined {
		return this._text;
	}

	set text(value: string|undefined) {
		if (value != null) {
			value = String(value);
			if (value.trim() == "")
				value = undefined;
		}
		this._text = value;
	}

	get textVisible(): boolean {
		return this._textVisible;
	}

	set textVisible(value: boolean) {
		this._textVisible = value;
	}

	get triggers(): Set<string> {
		return this._triggers;
	}

	set triggers(value: Set<string>) {
		this._triggers.clear();
		for (let item of value.values())
			this._triggers.add(item);
	}

	get initialDelay(): number {
		return this._initialDelay;
	}

	set initialDelay(value: number) {
		if (!(value >= 0))
			throw new Error("initialDelay must be 0 or greater");
		this._initialDelay = value;
	}

	get repetitions(): number {
		return this._repetitions;
	}

	set repetitions(value: number) {
		if (!(value >= 0))
			throw new Error("repetitions must be 0 or greater");
		this._repetitions = value;
	}

	get interval(): number {
		return this._interval;
	}

	set interval(value: number) {
		if (!(value >= 0))
			throw new Error("interval must be 0 or greater");
		this._interval = value;
	}

	get naturalCureProbability(): number {
		return this._naturalCureProbability;
	}

	set naturalCureProbability(value: number) {
		if (value < 0 || value > 1)
			throw new Error("naturalCureProbability must be in the range [0..1]");
		this._naturalCureProbability = value;
	}

	get action(): Effect.ActionCallback {
		return this._action;
	}

	set action(action: Effect.ActionCallback) {
		this._action = action;
	}

	trigger(trigger: string, target: EffectTarget): ActiveEffect|undefined {
		if (this._triggers.has(trigger)) {
			return new ActiveEffect(this, target);
		}
		return undefined;
	}

}


/**
 * An Effect that is currently active and attached to a specific context object (Denizen/Item).
 */
export class ActiveEffect
	extends LatentEffect
	implements EventListener, Configurable<ActiveEffectConfig>
{

	private _target: EffectTarget;

	/**
	 * @see [[incubating]]
	 */
	private _incubating: boolean = true;

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	private static _initializeClass_ActiveEffect: void = (() => {
		ClassRegistry.registerClass(
			"ActiveEffect", ActiveEffect,
			(obj: ActiveEffect, serializer: Serializer): void => {
				serializer.writeProp(obj.config);
			},
			(obj: ActiveEffect, data: any, deserializer: Deserializer): void => {
				obj.configure(deserializer.readProp(data) as ActiveEffectConfig);
			}
		);
	})();

	constructor(config: ActiveEffectConfig|LatentEffect, target: EffectTarget) {
		super(config instanceof LatentEffect ? config.config : config);

		this._target = target;

		GameState.getInstance().clock.createTimer(
			this.initialDelay
		).on('timer', this).start(true);
	} // constructor

	configure(config: ActiveEffectConfig): void {
		super.configure(config);
		this._incubating = Parse.bool(Parse.getProp(config, null, "incubating"), true);
	}

	/**
	 * Whether the effect is currently incubating or not.
	 *
	 * An incubating effect is one for which a timer has been set for the `initialDelay`
	 * that has not yet fired.
	 *
	 * @return Whether the effect is currently incubating or not.
	 */
	get incubating(): boolean {
		return this._incubating;
	} // incubating

	private setIncubating(value: boolean) {
		this._incubating = value;
	} // incubating

	get target(): EffectTarget {
		return this._target;
	}

	processEvent(event: string, data: any) {
		if (event == GameTimer.Event.timer) {
			let timer: GameTimer = data;

			if (this.incubating)
				this.setIncubating(false);

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
	cancel(): void {
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


export module Effect {
	/**
	 * Enumeration of item effect types.
	 */
	export enum Type {
		Unknown = 0,
		Disease = 1,
		Poison = 2,
		Spell = 3,
		Curse = 4,
		//Unknown2 = 5,		// Tome / Scroll / Trump Card / Eye / Horn / Wand?
		Potion = 6
		//Unknown3 = 7		// Tome / Scroll / Trump Card / Eye / Horn / Wand?
	} // Type

// Wands & Eyes generally seem to be more on the "weapon" side, otherwise "magic"?
// Horns are 1/3 weapon, 2/3 magic?
// Scrolls are basically magic
// Trump Cards are mostly permanent effects, otherwise basically time-limited magic
// Tomes are permanent effects

	export interface ActionCallback extends Parse.ActionCallback {
		(effect: ActiveEffect, gameState: GameState, target?: EffectTarget): void;
	};

} // module Effect
