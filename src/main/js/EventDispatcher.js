import { ClassRegistry } from "./Serializer.js";
import { Configurable } from "./Configurable.js";

export class EventDetail {

    /**
     * Constructs an Event instance.
     *
     * @param {any} target the context object for the event.
     * @param {string} type
     * @param {any} data
     * @param {string?} classifier classifier value associated with
     *        the event.
     */
    constructor(target, type, data, classifier) {
        /**
         * The context object for the event.
         * This is typically a subtype of EventDispatcher, but that may vary by event type.
         * @readonly
         */
        this.target = target;

        /**
         * The type of event that was fired.
         * @type {string}
         * @readonly
         */
        this.type = type;

        /**
         * Type-specific data that was provided when the event was triggered.
         * @type {any}
         * @readonly
         */
        this.data = data;

        /**
         * The event classifier value. This value may be used to selectively
         * asssociate listeners to events of a specific type and set of classifier
         * values. See {@link EventDispatcher.on} for more details.
         *
         * @type {string?}
         */
        this.classifier = classifier;
    }

}

/**
 * Interface that must be implemented by objects that receive notifications for events.
 * @interface
 */
export class EventListener {
	/**
	 * Processes events.
	 *
	 * @param {EventDetail} event details of the event that was fired.
	 */
	processEvent(event) {};
}

/**
 * @typedef {[EventListener, Set<string>?]} EventListenerEntry
 */

/**
 * @interface
 */
export class EventDispatcherConfig {
	/**
	 * The context object that will be passed to event listener.
	 * If not specified, the dispatcher instance is used as the context.
     * @readonly
     * @type {any}
	 */
	eventContext;

	/**
	 * Map of registered listeners for each event type.
	 * If not specified, no listeners will be registered.
     * @readonly
     * @type {ReadonlyMap<string, ReadonlyArray<EventListenerEntry>>?}
	 */
	listeners;
}

/**
 * @implements {Configurable<EventDispatcherConfig>}
 */
export class EventDispatcher {

    /**
	 * The context object that will be passed to event listener.
	 */
	#eventContext;

    /**
	 * Map of registered listeners for each event type.
     * @readonly
     * @type {Map<string, EventListenerEntry[]}
     */
    #listeners = new Map();

	/**
	 * Constructs a new EventDispatcher.
	 *
	 * @param {any} context The context object to send with events.  If not specified, this
	 *        EventDispatcher instance will be sent as the context object.
	 */
	constructor(context) {
		this.#eventContext = (context == null ? this : context);
	}

    /**
	 * Applies a configuration to this EventDispatcher.
	 * @param {EventDispatcherConfig} config The configuration to apply.
	 */
	configure(config) {
		this.#eventContext = (config.eventContext == null ? this : config.eventContext);

		this.#listeners.clear();
		if (config.listeners != null) {
			for (let entry of config.listeners) {
				this.#listeners.set(entry[0], entry[1].slice());
			}
		}
	}

    /**
     *
     * @param {string} eventType
     * @returns {[string, Set<string>?]} the parsed event type and classifiers
     */
    #parseEventType(eventType) {
        const pieces = /^([-_\w\d]+)(?::([-_\w\d]+(?:,[-_\w\d]+)*))?$/.exec(eventType);
        if (!pieces) {
            throw Error("eventType contains unsupported characters: " + eventType);
        }
        return [pieces[1], pieces[2] ? new Set(pieces[2].split(",")) : undefined];
    }

    /**
     * Registers a new listener to receive notifications for a given event type.
	 *
	 * If the specified listener is already registered for the given event, this function
	 * does nothing.
     *
     * Examples:
     *
     * ```
     * // Log a message for all "click" events
     * dispatcher.on("collision", (event) => { console.log("Collision!", event.target); });
     *
     * // Log a message for "collision" events tagged with a "door" class value.
     * dispatcher.on("collision:door",
     *               (event) => { console.log("Collision with a door!", event.target); });
     *
     * // Log a message for "collision" events tagged with either "door" or "portal" class value.
     * dispatcher.on("collision:door,portal",
     *               (event) => { console.log("Collision with a door or a portal!", event.target); });
     * ```
     *
     * @param {string} eventType the event type name to add the handler to. This may be a plain
     *        event type name (containing only "-", "\_" or alpha-numeric characters). The value
     *        may also include a colon ":" followed by a list of comma-separated event classifier
     *        values (each containing only "-", "\_" or alpha-numeric characters). The classifier
     *        values are used to further filter calls to the listener method to only events tagged
     *        with one of the provided classifier values. If no classifier values are given, all
     *        events are matched, regardless of the event's associated class.
     * @param {EventListener|(event:EventDetail) => void} listener the callback to add
     *
     * @return {this}
     */
    on(eventType, listener) {
        let classifiers;
        [eventType, classifiers] = this.#parseEventType(eventType);

        const handlers = this.#listeners.get(eventType);
        if (handlers == null) {
            this.#listeners.set(eventType, [ [listener, classifiers] ]);
        } else {
            let found = false;
            for (let entry of handlers) {
                if (entry[0] === listener) {
                    if (classifiers && entry[1]) {
                        // Already registered with classifiers, add the new classifier values
                        classifiers.forEach(classifier => entry[1].add(classifier));
                        found = true;
                        break;
                    } else if (!classifiers && !entry[1]) {
                        // Already registered without any classifiers
                        found = true;
                        break;
                    }
                }
            }

            if (!found) {
                // Not registered yet, add an entry
                handlers.push([listener, classifiers]);
            }
        }
        return this;
    }

    /**
     * Removes a previously registered listener from notifications for a given event type.
	 *
	 * If the specified listener is not currently registered for the given event, this
	 * function does nothing.
     *
     * @param {string} eventType the event type name to remove the handler from. This may be a plain
     *        event type name (containing only "-", "\_" or alpha-numeric characters). The value
     *        may also include a colon ":" followed by a list of comma-separated event classifier
     *        values (each containing only "-", "\_" or alpha-numeric characters). If classifie
     *        values are present, only associations for those values will be removed.
     * @param {EventListener|(event:EventDetail) => void} listener the callback to remove
     *
     * @return {this}
     */
    off(eventType, listener) {
        let classifiers;
        [eventType, classifiers] = this.#parseEventType(eventType);

        const listeners = this.#listeners.get(eventType);
        if (listeners) {
            this.#listeners.set(eventType,
                listeners.filter(entry => {
                    if (entry[0] === listener) {
                        if (!classifiers && !entry[1]) {
                            // No classifiers specified, remove entry.
                            return false;
                        } else if (classifiers && entry[1]) {
                            // Remove any matching classifiers
                            classifiers.forEach(classifier => entry[1].delete(classifier));

                            if (entry[1].size == 0) {
                                // No classifiers remaining, remove entry completely.
                                return false;
                            }
                        }
                    }
                    return true;
                }));
        }

        return this;
    }

    /**
     * Dispatches an event to all registered listeners.
     * @param {string} eventType the event type name
     * @param {any} data additional data associated with the event
     * @return {this}
     */
    triggerEvent(eventType, data) {
        let classifiers;
        [eventType, classifiers] = this.#parseEventType(eventType);
        let classifier;
        if (classifiers) {
            if (classifiers.size > 1) {
                throw new Error("Only one classifier value may be specified: " + eventType);
            }
            classifier = classifiers.values().next().value;
        }

        const listeners = this.#listeners.get(eventType);
        if (listeners) {
            const event = new EventDetail(this.#eventContext, eventType, data, classifier);
            let listener;

            for ([listener, classifiers] of listeners) {
                try {
                    if (!classifiers || classifiers.has(classifier)) {
                        if (listener instanceof Function) {
                            listener(event);
                        } else {
                            listener.processEvent(event);
                        }
                    }
                } catch (error) {
                    console.error(`Error in event handler for ${eventType}` +
                        (classifier != null ? ":" + classifier : "") + ":", error);
                }
            }
        }

        return this;
    }

    /**
	 * Static initializer for registering deserializer with private member access.
	 */
	static #initializeClass_EventDispatcher = (() => {
		ClassRegistry.registerClass(
			"EventDispatcher", EventDispatcher,
			(dispatcher, serializer) => {
				serializer.writeProp(dispatcher.config);
			},
			(dispatcher, data, deserializer) => {
				dispatcher.configure(deserializer.readProp(data));
			}
		);
	})();

}

