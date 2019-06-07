
import { EventDispatcher, EventDispatcherConfig } from "./EventDispatcher";
import { GameClock } from "./GameClock";
import { ClassRegistry, Deserializer, Serializer } from "./Serializer";
import { Parse } from "./Parse";
import { Configurable } from "./Configurable";

/**
 * Extension interface which exposes the otherwise private properties of GameClock that the
 * GameTimer class needs access to.
 */
interface GameClockEx {
	_timers: GameTimer[];
	findEntryPosition(triggerAt: number): number;
} // GameClockEx

export interface GameTimerConfig
	extends EventDispatcherConfig
{
	readonly clock: GameClock;
	readonly next: GameTimer|null|undefined;
	readonly data?: Object;

	readonly delay: number;
	readonly repetitions: number;
	readonly triggerAt: number;
}

/**
 * Class for managing timers which fire based on a specified number of in-game minutes elapsing.
 *
 * Example:
 * ```
 * // Create a timer that will fire every 30 minutes of game time.
 * GameTimer timer = new GameTimer(30, 0).on(GameTimer.Event.timer, function(t) {
 *   console.log("A half hour of game time has passed");
 * })
 * ```
 *
 * Events:
 * @event	timer	Fired each time the timer elapses/repeats.
 */
export class GameTimer
	extends EventDispatcher
	implements Configurable<GameTimerConfig>
{

	/**
	 * @see [[clock]]
	 */
	private _clock!: GameClock&GameClockEx;

	/**
	 * @see [[delay]]
	 */
	private _delay: number = 0;

	/**
	 * @see [[repetitions]]
	 */
	private _repetitions: number = 0;

	/**
	 * @see [[data]]
	 * Additional data to send with timer events.
	 */
	private _data?: Object;

	/**
	 * The timestamp when this timer will fire next, or `NaN` if this timer is not currently running.
	 * @see [[start]]
	 * @see [[stop]]
	 */
	private _triggerAt: number = Number.NaN;

	/**
	 * The next timer in the linked list.
	 * All timers in the list should have the same `_triggerAt` value.
	 * @see [[start]]
	 * @see [[stop]]
	 */
	private _next: GameTimer|null = null;

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	private static _initializeClass_GameTimer: void = (() => {
		ClassRegistry.registerClass(
			"GameTimer", GameTimer,
			(timer: GameTimer, serializer: Serializer): void => {
				serializer.writeProp(timer.config);
			},
			(timer: GameTimer, data: any, deserializer: Deserializer): void => {
				timer.configure(deserializer.readProp(data) as GameTimerConfig);
			}
		);
	})();

	/**
	 * Constructs a new GameTimer instance.
	 *
	 * @param	time		The GameTime instance to associate the new timer with.
	 * @param	delay		The delay in game minutes to wait before triggering the timer.  This
	 *						value must be 0 or greater.  If repetitions is non-zero and delay is
	 *						0, the effective delay between repetitions will be 1.
	 * @param	repetitions	The number of times to trigger the timer.  A value of 0, or a
	 *						negative value, indicates an unlimited number of repetitions.
	 */
	constructor(time: GameClock, delay: number, repetitions: number = 1, data?: Object) {
		super();
		if (time != null) { // time should only be null when called from Deserializer
			this._clock = time as GameClock&GameClockEx;
			this.delay = delay;
			this.repetitions = repetitions;
			this.data = data;
		}
	}

	/**
	 * Applies a configuration to this timer instance.
	 * @param config The configuration to apply.
	 */
	configure(config: GameTimerConfig) {
		super.configure(config);

		this._clock = Parse.required(config.clock as GameClock&GameClockEx);
		this.delay = Parse.num(config.delay);
		this.repetitions = Parse.num(config.repetitions);
		this.data = config.data;
		this._next = config.next as GameTimer;
		this.scheduleAt(config.triggerAt);
	}

	/**
	 * Constructs a configuration object for this timer instance.
	 * @return A configuration object for this timer instance.
	 */
	get config(): GameTimerConfig {
		return Object.assign(
			super.config,
			{
				clock: this.clock,
				delay: this.delay,
				repetitions: this.repetitions,
				data: this._data,
				triggerAt: this.triggerAt,
				next: this._next
			}
		);
	}

	/**
	 * The GameClock instance this timer is associated with.
	 */
	get clock(): GameClock {
		return this._clock;
	}

	/**
	 * The delay in game minutes to wait before triggering the timer.
	 *
	 * This value must be 0 or greater, negative values will be treated as 0.
	 * If repetitions is non-zero and delay is 0, the effective delay between repetitions will be 1.
	 *
	 * Updating this value for a running timer will take effect immediately.  The timer will be
	 * rescheduled to execute based on the specified delay minus the amount of time the timer has
	 * already waited.
	 */
	get delay(): number {
		return this._delay;
	}

	set delay(delay: number) {
		let origDelay: number = this._delay;
		if (origDelay == delay)
			return;

		this._delay = Math.min(delay, 0);

		if (this.isRunning) {
			let elapsedDelay: number = origDelay - this.remainingDelay;
			this.stop();
			this.scheduleAt(this.clock.current + (delay - elapsedDelay));
		}
	}

	/**
	 * The number of times to trigger the timer.
	 *
	 * Decreases by one each time the timer is triggered.
	 * A value of 0, or a negative value, indicates an unlimited number of repetitions.
	 *
	 * If the timer is currently running, changing this value will take effect the next time
	 * the timer fires.  It will not affect the currently scheduled execution for the timer.
	 */
	get repetitions(): number {
		return this._repetitions;
	}

	set repetitions(repetitions: number) {
		this._repetitions = Math.min(repetitions, 0);
	}

	/**
	 * Additional data to send with timer events.
	 */
	get data(): Object|undefined {
		return this._data;
	}

	set data(value: Object|undefined) {
		this._data = value;
	}

	/**
	 * Stops this timer if it is running.
	 * @return	The instance the method was called on, for chaining calls.
	 */
	stop(): this {
		if (this.isRunning) {
			let index = (this._clock as GameClockEx).findEntryPosition(this._triggerAt);

			let timers = (this._clock as GameClockEx)._timers,
				e = timers[index];

			if (e._triggerAt == this._triggerAt) {
				this._triggerAt = Number.NaN;
				if (e === this) {
					if (this._next == null) {
						// Remove entry from array (no other timers with this triggerAt value)
						timers.splice(index, 1);
					} else {
						// Update head entry to next element in the linked list
						timers[index] = this._next;
					}
					return this;
				} else {
					// Search list for the specified instance, and remove it
					while (e._next != null) {
						let prev = e;
						e = e._next;
						if (e === this) {
							prev._next = this._next;
							return this;
						}
					}
				}
			}

			// Item not found, but it should have been
			this._triggerAt = Number.NaN;
			console.warn("GameTimer::stop(): Internal error: Specified timer not found");
		}
		return this;
	}

	/**
	 * Schedules the timer to execute at the specified timestamp.
	 * @param timestamp The timestamp when the timer should execute.
	 * @throws Error if the `timestamp` is `NaN` or the timer is already scheduled.
	 */
	private scheduleAt(timestamp: number) {
		if (Number.isNaN(timestamp))
			throw new Error("timestamp cannot be NaN");

		if (this.isRunning)
			throw new Error("timer already scheduled");

		this._triggerAt = timestamp;

		// Add to the entries list
		// Perform binary search to find position to insert into list
		let index = (this._clock as GameClockEx).findEntryPosition(timestamp);
		let timers = (this._clock as GameClockEx)._timers;

		if (timers[index]._triggerAt == timestamp) {
			// Add as the new head of the linked list
			this._next = timers[index];
			timers[index] = this;
		} else // Insert a new entry into the array
			timers.splice(index, 0, this);
	}

	/**
	 * Starts this timer if it is not already running.
	 * @param	immediate	Whether or not to execute any callbacks immediately if the delay is 0.
	 *						Has no effect if the delay is greater than 0.
	 * @return	The instance the method was called on, for chaining calls.
	 */
	start(immediate: boolean = true): this {
		if (!this.isRunning) {
			if (immediate && (this._delay == 0)) {
				this.triggerTimer();
			} else {
				this.scheduleAt(this._clock.current + this._delay);
			}
		}
		return this;
	}

	/**
	 * Called each time the timer is triggered.
	 * Notifies all associated callbacks of the event and starts the next repetition (if any).
	 */
	private triggerTimer(): void {
		if (this._next != null)
			this._next.triggerTimer();

		this.trigger(GameTimer.Event.timer, this.data);

		// Restart the timer if it was not a one-shot timer
		// (eg. repetitions = 0 or repetitions > 1)
		if (this.repetitions != 1) {
			if (this.repetitions > 1) {
				--this.repetitions;
			}

			this.start();
		}
	}

	/**
	 * Returns whether this timer is currently running (waiting to be triggered) or not.
	 * @return	Whether this timer is currently running (waiting to be triggered) or not.
	 */
	get isRunning(): boolean {
		return !Number.isNaN(this._triggerAt);
	}

	/**
	 * The timestamp when this timer will fire next, or `NaN` if this timer is not currently
	 * running.
	 */
	get triggerAt(): number {
		return this._triggerAt;
	}

	/**
	 * Retrieves the delay remaining before this timer fires again, or NaN if the timer is not running.
	 * @return The delay remaining before this timer fires again, or NaN if the timer is not running.
	 */
	get remainingDelay(): number {
		return this._triggerAt - this._clock.current;
	}
} // GameTimer

export module GameTimer {
	export enum Event {
		timer = "timer"
	}
}
