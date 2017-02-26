import { Cloneable } from "./Cloneable"
import { GameState } from "./GameState"
import { Entity } from "./Entity"
import { GameTimer } from "./GameTimer"

/**
 * Base class of all entity effects.
 */
export class EntityEffect
	implements Cloneable
{

	/**
	 * The entity that this effect is defined for.
	 */
	private _entity: Entity;

	/**
	 * The effect type.
	 */
	private _type: EntityEffect.Type = EntityEffect.Type.Unknown;

	/**
	 * Whether the effect is currently incubating or not.
	 */
	private _incubating: Boolean = true;

	/**
	 * Whether this effect may be applied multiple times.
	 * Two effects are equal if their Type/Interval/ProbToRemove/Action/Offset/NbBlocks/Gab/Param are the same.
	 */
	private _allowMultiple: Boolean = false;

	/**
	 * The text to display for this effect.
	 */
	private _text: String|null = null;

	/**
	 * Whether the text (if any) should be displayed or not.
	 * The type of the effect determines where the text is displayed (eg. in diseases, magic effects, etc)
	 */
	private _textVisible: Boolean = false;

	/**
	 * The events/triggers which this effect is initiated by.
	 * Bit field (0x00-0xff) containing Trigger flags.
	 */
	private _triggers: number = EntityEffect.Trigger.None;

	/**
	 * Initial time to wait (in minutes) before executing the effect.
	 * May be different than the repetition interval.
	 */
	private _initialDelay: number = 0;

	/**
	 * number of times the effect is executed before deactivated.
	 * Decreased (if not 0) with each execution, and effect is removed when it reaches 0.
	 * 0 means +oo (repeated forever)
	 */
	private _repetitionCount: number = 1;

	 /**
	  * Time to wait (in minutes) between repetitions.
	  */
	private _repetitionInterval: number = 0;

	/**
	 * Probability of a natural cure (checked on each execution).
	 * [0..1]
	 */
	private _naturalCureProbability: number = 0;

	/**
	 * The action to perform when this effect is triggered.
	 */
	private _action: EntityEffect.Action = EntityEffect.Action.Set

	/**
	 * The names of the properties to apply the action to.
	 */
	private _properties: String[] = [];

	/**
	 * Whether to apply the action to the entity the effect is defined for, or to the player character.
	 */
	private _applyTo: EntityEffect.ApplyTo = EntityEffect.ApplyTo.Character;

	/**
	 * The value to apply when executing the action.
	 * eg. If the action is Add, then this amount will be added to each of the specified properties.
	 */
	private _amount: number = 0;

	constructor(clone?: any) {
		if (clone != null) {
			this.type = clone.type;
			this.incubating = clone.incubating;
			this.allowMultiple = clone.allowMultiple;
			this.text = clone.text;
			this.textVisible = clone.textVisible;
			this.triggers = clone.triggers;
			this.initialDelay = clone.initialDelay;
			this.repetitionCount = clone.repetitionCount;
			this.repetitionInterval = clone.repetitionInterval;
			this.naturalCureProbability = clone.naturalCureProbability;
			this.action = clone.action;
			this.properties = clone.properties;
			this.applyTo = clone.applyTo;
			this.amount = clone.amount;
		}
	} // constructor

	clone() : EntityEffect {
		return new EntityEffect(this);
	} // clone

	set type(type: EntityEffect.Type) {
		this._type = type;
	} // type

	get type(): EntityEffect.Type {
		return this._type;
	} // type

	get incubating(): Boolean {
		return this._incubating;
	} // incubating

	set incubating(incubating: Boolean) {
		this._incubating = incubating;
	} // incubating

	get allowMultiple(): Boolean {
		return this._allowMultiple;
	} // allowMultiple

	set allowMultiple(allowMultiple: Boolean) {
		this._allowMultiple = allowMultiple;
	} // allowMultiple

	get text(): String|null {
		return this._text;
	} // text

	set text(text: String|null) {
		if (text != null) {
			text = String(text);
			if (text == "")
				text = null;
		}
		this._text = text;
	} // text

	get textVisible(): Boolean {
		return this._textVisible;
	} // textVisible

	set textVisible(textVisible: Boolean) {
		this._textVisible = textVisible;
	} // textVisible

	get triggers(): number {
		return this._triggers;
	} // triggers

	set triggers(triggers: number) {
		if ((triggers == null) || (triggers < 0) || (triggers > 0xff) || Number.isNaN(triggers))
			throw new Error("triggers must be between 0x00 and 0xff");
		this._triggers = triggers;
	} // triggers

	get initialDelay(): number {
		return this._initialDelay;
	} // initialDelay

	set initialDelay(initialDelay: number) {
		if (initialDelay < 0)
			throw new Error("initialDelay cannot be less than 0");
		this._initialDelay = initialDelay;
	} // initialDelay

	get repetitionCount(): number {
		return this._repetitionCount;
	} // repetitionCount

	set repetitionCount(repetitionCount: number) {
		if (repetitionCount < 0)
			throw new Error("repetitionCount cannot be less than 0");
		this._repetitionCount = repetitionCount;
	} // repetitionCount

	get repetitionInterval(): number {
		return this._repetitionInterval;
	} // repetitionInterval

	set repetitionInterval(repetitionInterval: number) {
		if (repetitionInterval < 0)
			throw new Error("repetitionInterval cannot be less than 0");
		this._repetitionInterval = repetitionInterval;
	} // repetitionInterval

	get naturalCureProbability(): number {
		return this._naturalCureProbability;
	} // naturalCureProbability

	set naturalCureProbability(naturalCureProbability: number) {
		if (naturalCureProbability < 0 || naturalCureProbability > 1)
			throw new Error("naturalCureProbability must be in the range [0..1]");
		this._naturalCureProbability = naturalCureProbability;
	} // naturalCureProbability

	get action(): EntityEffect.Action {
		return this._action;
	} // action

	// TODO: Support custom closure actions?   function(entity: Entity, effect: EntityEffect, character: Character)
	set action(action: EntityEffect.Action) {
		this._action = action;
	} // action

	get properties(): String[] {
		return this._properties;
	} // properties

	set properties(properties: String[]) {
		// TODO: None of the properties should be empty...
		this._properties = properties;
	} // properties

	get applyTo(): EntityEffect.ApplyTo {
		return this._applyTo;
	} // applyTo

	set applyTo(applyTo: EntityEffect.ApplyTo) {
		this._applyTo = applyTo;
	} // applyTo

	get amount(): number {
		return this._amount;
	} // amount

	set amount(amount: number) {
		this._amount = amount;
	} // amount

	processEvent(event: EntityEffect.Trigger, gameState: GameState) {
		if ((this._triggers & event) != 0) {
			// The event matches one of this effect's triggers
			// Start the initial timer
			gameState.time.createTimer(
				this.initialDelay
			).onTimer(function(timer: GameTimer) {
				this.handleTimer(timer, gameState)
			}).start(true);
		}
	} // processEvent

	private handleTimer(timer: GameTimer, gameState: GameState) {
		// Execute the action
		

		// Handle remaining repetitions
		if (this.repetitionCount != 1) {
			timer.delay = this.repetitionInterval;
			timer.repetitions = (this.repetitionCount == 0 ? 0 : this.repetitionCount - 1);
			timer.start();
		}
	} // handleTimer

} // EntityEffect

export module EntityEffect {
	/**
	 * Enumeration of entity effect types.
	 */
	export enum Type {
		Unknown = 0,
		Disease = 1,
		Poison = 2,
		Magic = 3,
		Curse = 4,
		//Unknown2 = 5,
		Potion = 6
		//Unknown3 = 7
	} // Type

	/**
	 * Entity effect trigger flag values.
	 */
	export enum Trigger {
		None = 0x0,
		Pickup = 0x1,		// get
		Drop = 0x2,
		Use = 0x4,			// use/equip/cast
		Unuse = 0x8,		// unequip
		//Unknown = 0x10,		// delete?
		AlignmentCheck = 0x20,
		DrainCharge = 0x40,
		SetTimer = 0x80
	} // Trigger

	/**
	 * Enumeration of effect action values.
	 */
	export enum Action {
		Set = -1,
		Add = 0,
		Sub = 1,
		//Rts = 2,	// rts = 6502 return from subroutine opcode.  But where would the return address come from?  The parameter?
					//    This may be essentially a function call for custom actions, in which case we'd want to simply attach a closure to the effect?
		//Rts = 3,
		Xor = 4,	// bitwise xor
		And = 5,	// bitwise and
		Or = 6		// bitwise or
	} // Action

	/**
	 * Enumeration of values indicating what game object the effect applies to.
	 */
	export enum ApplyTo {
		Character,
		Entity
	} // ApplyTo
} // module EntityEffect
