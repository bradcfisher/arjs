
import { EventDispatcher } from "./EventDispatcher.js";
/** @import { EventCallback } from "./EventDispatcher.js" */

export class AnimationManager extends EventDispatcher {
    /**
     * @type {Map<string, Animation>}
     * @private
     */
    #templates = new Map();

    /**
     * @type {Map<string, Animation>}
     */
    #activeAnimations = new Map();

    constructor() {
        super();
    }

    createFromTemplate(templateId, options) {
        const template = this.#templates.get(templateId);
        if (!template) {
            throw "No such animation template: " + templateId;
        }
        return template.clone(options);
    }

    addTemplate(templateId, animation) {
        this.#templates.set(templateId, animation);
    }

    get(animationId) {
        return this.#activeAnimations.get(animationId);
    }

    // Get current time in milliseconds
    // TODO: Replace with external clock source passed in constructor
    #now() {
        return document.timeline.currentTime;
    }

    /**
     *
     * @param {Animation} animation
     * @param {Object} options
     */
    add(animation, options) {
        this.end(animation);

        if (options) {
            animation.applyOptions(options);
        }

        /** @type {EventCallback} */
        const endCallback = (event) => {
            this.#activeAnimations.delete(event.data.id);
            animation.off('end', endCallback);
        }
        animation.on('end', endCallback);

        const animationId = animation.activate(this.#now());
        this.#activeAnimations.set(animationId, animation);

        //console.log("Added animation: ", animation);
    }

    /**
     *
     * @param {Animation} animation
     * @param {Object} options
     */
    addIfNotPresent(animation, options) {
        if (animation.isActive() || (animation.id && this.#activeAnimations.get(animation.id))) {
            return;
        }

        this.add(animation, options);
    }

    addFromTemplate(templateId, options) {
        this.add(this.createFromTemplate(templateId, options));
    }

    addFromTemplateIfNotPresent(templateId, options) {
        const animation = this.createFromTemplate(templateId, options);
        if (!animation.id) {
            animation.id = templateId;
        }
        if (!this.#activeAnimations.get(animation.id)) {
            this.add(animation);
        }
    }

    /**
     *
     * @param {Animation | string} animation
     */
    end(animation) {
        if (!(animation instanceof Animation)) {
            animation = this.#activeAnimations.get(animation);
        }

        if (animation) {
            animation.deactivate(this.#now());
        }
    }

    /**
     * Updates all active animations with the provided timestamp.
     * @param {number} timestamp
     */
    updateAnimations(timestamp) {
        this.#activeAnimations.forEach((animation, animationId) => {
            animation.update(timestamp);
        });
    }

}

/**
 * Events:
 * - start
 * - update
 * - end
 */
export class Animation extends EventDispatcher {

    static #nextAnonymousId = 0;

    /**
     * The ID the animation is registered under with its manager or undefined if not registered.
     * @type {string | undefined}
     */
    #id;

    /**
     * @type {number | undefined}
     */
    #startTime;

    /**
     * @type {number}
     */
    #lastTriggerTime = 0;

    /**
     * @type {number}
     */
    #repetitions = 0;

    /**
     * @type {boolean}
     */
    #terminating = false;

    /**
     * Constructs a new Animation instance.
     *
     * @param {Object|undefined} options initial option values to apply
     */
    constructor(options) {
        super();

        /**
         * ID of the animation.
         * If this property is not set when the animation is added to a manager, a new random value is assigned.
         * Changing this value while the animation is managed does not change the registered ID with manager.
         * @type {string | undefined}
         */
        this.id = undefined;

        /**
         * Initial delay in milliseconds before the animation starts (default: 0)
         * @type {number}
         */
        this.delay = 0;

        /**
         * Duration of animation in milliseconds (default: Infinity)
         * @type {number}
         */
        this.duration = Infinity;

        /**
         * The value rate per second for the animation (default: 0)
         * @type {number|() => number)}
         */
        this.ratePerSecond = 0;

        /**
         * Number of times the animation should repeat before ending.
         * @type {number}
         */
        this.repetitions = 1;

        /**
         * Callback invoked each time the animation is updated.
         *
         * The callback can accept two parameters: percentComplete and value.
         *
         * - `percentComplete` is a value ranging from 0 to 1, which indicates where the animation
         *   is within it's scheduled duration.
         * - `value` represents a portion of the animation's `ratePerSecond` value for the period
         *   between the animation's last update and the current update.
         *
         * @type {Function(percentComplete : number, value : number) | null}
         */
        this.callback = null;

        this.applyOptions(options);
    }

    /**
     * Applies options from a source object to this object.
     *
     * @param {Object} options object containing option properties to apply to this instance.
     *
     * @returns the object the method was called on
     */
    applyOptions(options) {
        if (options) {
            Object.entries(options).forEach(([key, value]) => this[key] = value);
        }
        return this;
    }

    /**
     * Creates a copy of this animation.
     *
     * @param {Object} options
     *
     * @returns a copy of this animation.
     */
    clone(options) {
        return new Animation(this).applyOptions(options);
    }

    /**
     * Updates the animation to the specified moment in time.
     *
     * @param {number} timestamp current timestamp in milliseconds to update the animation to
     */
    update(timestamp) {
        if (timestamp > this.#startTime) {
            let percentComplete;
            let amount = 0;

            if (this.#lastTriggerTime) {
                const elapsedSinceLastTrigger = timestamp - this.#lastTriggerTime;
                if (elapsedSinceLastTrigger > 0) {
                    let ratePerSec = this.ratePerSecond;
                    if (ratePerSec instanceof Function) {
                        ratePerSec = ratePerSec();
                    }
                    amount = ratePerSec * elapsedSinceLastTrigger / 1000;
                }
            } else {
                this.#start(timestamp);
            }

            this.#lastTriggerTime = timestamp;

            if (!this.duration || this.#terminating) {
                percentComplete = 1;
            } else {
                percentComplete = Math.min((timestamp - this.#startTime) / this.duration, 1);
            }

            if (this.callback) {
                this.callback(percentComplete, amount);
            }

            this.triggerEvent('update', {
                timestamp,
                id: this.#id,
                percentComplete,
                amount
            });

            if (percentComplete >= 1) {
                this.#repetitions++;
                if (!this.#terminating && this.#repetitions < this.repetitions) {
                    this.#startTime = timestamp; // Start another repetition
                } else {
                    this.#end(timestamp);
                }
            }
        }
    }

    isActive() {
        return !!this.#lastTriggerTime;
    }

    #start(timestamp) {
        //console.log("Sending 'start': ", this.id);
        this.triggerEvent('start', {
            timestamp,
            id: this.#id
        });
    }

    #end(timestamp) {
        const id = this.#id;
        this.#id = undefined;
        this.#startTime = undefined;
        this.#lastTriggerTime = 0;
        this.#repetitions = 0;
        this.#terminating = false

        //console.log("Sending 'end': ", this.id);
        this.triggerEvent('end', {
            timestamp,
            id
        });
    }

    #generateAnimationId() {
        return "__anonymous_" + (Animation.#nextAnonymousId++);
    }

    activate(timestamp) {
        if (this.isActive()) {
            //console.log("Activating: (already active, sending 'end') ", this.id);
            this.#end(timestamp);
        }

        this.#id = this.id || this.#generateAnimationId();
        this.#startTime = timestamp + this.delay;
        this.#lastTriggerTime = 0;
        this.#repetitions = 0;
        this.#terminating = false

        //console.log("Activating: ", this.id);

        return this.#id;
    }

    deactivate(timestamp) {
        if (this.#id !== undefined) {
            if (this.#lastTriggerTime) {
                //console.log("Deactivating active: ", this.id, " timestamp=", timestamp, " lastTiggerTime = ", this.#lastTriggerTime);

                // Animation has already triggered at least once
                // Call it one last time to move it to 100% complete
                // This will also cause it to be removed from the active list
                this.#terminating = true;
                this.update(timestamp);
            } else {
                //console.log("Deactivate not active: ", this.id);

                // Animation hasn't been triggered yet, so simply signal that it ended.
                this.#end();
            }
        } else {
            //console.log("Deactivate NOT registered (NOP): ", this.id);
        }
    }

    // TODO: Trigger events at the appropriate time

}
