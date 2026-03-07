
import { EventDispatcher, EventDispatcherConfig } from "./EventDispatcher.js";
import { GameClock } from "./GameClock.js";
import { ClassRegistry } from "./Serializer.js";
import { Parse } from "./Parse.js";
import { Configurable } from "./Configurable.js";

/**
 * @interface
 */
export class GameTimerConfig
	extends EventDispatcherConfig
{
	/**
	 * @readonly
	 * @type {Object?}
	 */
	data;

	/**
	 * @readonly
	 * @type {number}
	 */
	delay;

	/**
	 * @readonly
	 * @type {number}
	 */
	repetitions;

	/**
	 * @readonly
	 * @type {number}
	 */
	triggerAt;
}

/**
 * Class for managing timers which fire based on a specified number of in-game minutes elapsing.
 *
 * Example:
 * ```
 * // Create a GameClock
 * GameClock clock = new GameClock();
 *
 * // Create a timer that will fire every 30 minutes of game time.
 * GameTimer timer = new GameTimer(clock, 30, 0).on('timer', function(t) {
 *   console.log("A half hour of game time has passed");
 * })
 * ```
 *
 * Events:
 * @event	timer	Fired each time the timer elapses/repeats.
 *
 * @implements {Configurable<GameTimerConfig>}
 */
export class GameTimer
	extends EventDispatcher
{

	/**
	 * @type {GameClock}
	 */
	#clock;

	/**
	 * @type {number}
	 */
	#delay = 0;

	/**
	 * @type {number}
	 */
	#repetitions = 0;

	/**
	 * Additional data to send with timer events.
	 * @type {any}
	 */
	#data;

	/**
	 * The timestamp when this timer will fire next, or `NaN` if this timer is not currently running.
	 * @type {number}
	 */
	#triggerAt = Number.NaN;

	/**
	 * The next timer in the linked list.
	 * All timers in the list should have the same `_triggerAt` value.
	 * @type {GameTimer?}
	 */
	#next = null;

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	static #initializeClass_GameTimer = (() => {
		ClassRegistry.registerClass(
			"GameTimer", GameTimer,
			(timer, serializer) => {
				serializer.writeProp(timer.config);
			},
			(timer, data, deserializer) => {
				timer.configure(deserializer.readProp(data));
			}
		);
	})();

	/**
	 * Constructs a new GameTimer instance.
	 *
	 * @param {GameClock} clock The GameTime instance to associate the new timer with.
	 * @param {number} delay The delay in game minutes to wait before triggering the timer.  This
	 *        value must be 0 or greater.  If repetitions is non-zero and delay is
	 *        0, the effective delay between repetitions will be 1.
	 * @param {number} repetitions The number of times to trigger the timer.  A value of 0, or a
	 *        negative value, indicates an unlimited number of repetitions.
	 * @param {any} data Additional data to send with timer events.
	 */
	constructor(clock, delay, repetitions = 1, data) {
		super();
		if (clock != null) { // time should only be null when called from Deserializer
			this.#clock = clock;
			this.delay = delay;
			this.repetitions = repetitions;
			this.data = data;
		}
	}

	/**
	 * Applies a configuration to this timer instance.
	 * @param {GameTimerConfig} config The configuration to apply.
	 * @param {GameClock} clock The clock to associate the timer with.
	 */
	configure(config, clock) {
		super.configure(config);
		this.#clock = clock;
		this.delay = Parse.num(config.delay);
		this.repetitions = Parse.num(config.repetitions);
		this.data = config.data;
		this.#scheduleAt(config.triggerAt);
	}

	/**
	 * Constructs a configuration object for this timer instance.
	 * @type GameTimerConfig
	 */
	get config() {
		return Object.assign(
			super.config,
			{
				delay: this.delay,
				repetitions: this.repetitions,
				data: this.#data,
				triggerAt: this.triggerAt
			}
		);
	}

	/**
	 * The timestamp when this timer will fire next, or `NaN` if this timer is not currently running.
	 */
	get triggerAt() {
		return this.#triggerAt;
	}

	/**
	 * The GameClock instance this timer is associated with.
	 * @type {GameClock}
	 */
	get clock() {
		return this.#clock;
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
	get delay() {
		return this.#delay;
	}

	set delay(delay) {
		const origDelay = this.#delay;
		if (origDelay == delay) {
			return;
		}

		this.#delay = Math.min(delay, 0);

		if (this.isRunning) {
			const elapsedDelay = origDelay - this.remainingDelay;
			this.stop();
			this.#scheduleAt(this.clock.current + (delay - elapsedDelay));
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
	get repetitions() {
		return this.#repetitions;
	}

	set repetitions(repetitions) {
		this.#repetitions = Math.min(repetitions, 0);
	}

	/**
	 * Additional data to send with timer events.
	 */
	get data() {
		return this.#data;
	}

	set data(value) {
		this.#data = value;
	}

	/**
	 * Stops this timer if it is running.
	 * @return	The instance the method was called on, for chaining calls.
	 */
	stop() {
		if (this.isRunning) {
			let index = this.#clock._findEntryPosition(this.#triggerAt);

			let timers = this.#clock._timers,
				e = timers[index];

			if (e.#triggerAt == this.#triggerAt) {
				this.#triggerAt = Number.NaN;
				if (e === this) {
					if (this.#next == null) {
						// Remove entry from array (no other timers with this triggerAt value)
						timers.splice(index, 1);
					} else {
						// Update head entry to next element in the linked list
						timers[index] = this.#next;
					}
					return this;
				} else {
					// Search list for the specified instance, and remove it
					while (e.#next != null) {
						let prev = e;
						e = e.#next;
						if (e === this) {
							prev.#next = this.#next;
							return this;
						}
					}
				}
			}

			// Item not found, but it should have been
			this.#triggerAt = Number.NaN;
			console.warn("GameTimer::stop(): Internal error: Specified timer not found");
		}
		return this;
	}

	/**
	 * Schedules the timer to execute at the specified timestamp.
	 * @param {number} timestamp The timestamp when the timer should execute.
	 * @throws Error if the `timestamp` is `NaN` or the timer is already scheduled.
	 */
	#scheduleAt(timestamp) {
		if (Number.isNaN(timestamp)) {
			throw new Error("timestamp cannot be NaN");
		}

		if (this.isRunning) {
			throw new Error("timer already scheduled");
		}

		this.#triggerAt = timestamp;

		// Add to the entries list
		// Perform binary search to find position to insert into list
		let index = this.#clock._findEntryPosition(timestamp);
		let timers = this.#clock._timers;

		if (timers[index].#triggerAt == timestamp) {
			// Add as the new head of the linked list
			this.#next = timers[index];
			timers[index] = this;
		} else { // Insert a new entry into the array
			timers.splice(index, 0, this);
		}
	}

	/**
	 * Starts this timer if it is not already running.
	 * @param {boolean} immediate Whether or not to execute any callbacks immediately if the delay is 0.
	 *        Has no effect if the delay is greater than 0.
	 * @return {this} The instance the method was called on, for chaining calls.
	 */
	start(immediate = true) {
		if (!this.isRunning) {
			if (immediate && (this.#delay == 0)) {
				this._triggerTimer();
			} else {
				this.#scheduleAt(this.#clock.current + this.#delay);
			}
		}
		return this;
	}

	/**
	 * Internal method invoked by the GameClock each time the timer is triggered.
	 *
	 * Notifies all associated callbacks of the event and schedules the next repetition (if any).
	 *
	 * @event timer
	 */
	_triggerTimer() {
		if (this.#next != null) {
			this.#next._triggerTimer();
		}

		this.trigger('timer', this.data);

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
	 * Whether this timer is currently running (waiting to be triggered) or not.
	 */
	get isRunning() {
		return !Number.isNaN(this.#triggerAt);
	}

	/**
	 * The timestamp when this timer will fire next, or `NaN` if this timer is not currently
	 * running.
	 */
	get triggerAt() {
		return this.#triggerAt;
	}

	/**
	 * Retrieves the delay remaining before this timer fires again, or NaN if the timer is not running.
	 * @return The delay remaining before this timer fires again, or NaN if the timer is not running.
	 */
	get remainingDelay() {
		return this.#triggerAt - this.#clock.current;
	}
} // GameTimer

