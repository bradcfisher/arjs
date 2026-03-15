import { ClassRegistry } from "./Serializer.js";
import { Configurable } from "./Configurable.js";

export class EventDetail {

    /**
     * Constructs an Event instance.
     *
     * @param {any} target the context object for the event.
     * @param {string} type
     * @param {any} data
     */
    constructor(target, type, data) {
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
    }

    #isCancelled = false;

    /**
     * Cancels the default behavior for an event.
     * For many events, calling this method will have no effect.
     * However, some events will allow the cancellation of default behavior that would
     * otherwise occur following the dispatch of the event.
     */
    cancel() {
        this.#isCancelled = true;
    }

    /**
     * Whether the default behavior for the event has been cancelled or not.
     */
    get isCancelled() {
        return this.#isCancelled;
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
     * @type {ReadonlyMap<string, ReadonlyArray<EventListener>>?}
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
     * @type {Map<string, EventListener[]}
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
     * Registers a new listener to receive notifications for a given event type.
	 *
	 * If the specified listener is already registered for the given event, this function
	 * does nothing.
     *
     * @param {string} eventType the event type name to add the handler to
     * @param {EventListener|(event:EventDetail) => void} listener the callback to add
     *
     * @return this
     */
    on(eventType, listener) {
        var handlers = this.#listeners[eventType];
        if (handlers == null) {
            handlers = [ listener ];
            this.#listeners[eventType] = handlers;
        } else {
            handlers.push(listener);
        }
        return this;
    }

    /**
     * Removes a previously registered listener from notifications for a given event type.
	 *
	 * If the specified listener is not currently registered for the given event, this
	 * function does nothing.
     *
     * @param {string} eventType the event type name to remove the handler from
     * @param {EventListener|(event:EventDetail) => void} listener the callback to remove
     *
     * @return this
     */
    off(eventType, listener) {
        if (this.#listeners[eventType]) {
            this.#listeners[eventType] = this.#listeners[eventType].filter(cb => cb !== listener);
        }
        return this;
    }

    /**
     * Dispatches an event to all registered listeners.
     * @param {string} eventType the event type name
     * @param {any} data additional data associated with the event
     * @return this
     */
    triggerEvent(eventType, data) {
        const event = new EventDetail(this.#eventContext, eventType, data);
        const listeners = this.#listeners[eventType];
        if (listeners) {
            for (let listener of listeners) {
                try {
                    if (listener instanceof Function) {
                        listener(event);
                    } else {
                        listener.processEvent(event);
                    }
                } catch (error) {
                    console.error(`Error in event handler for ${eventType}:`, error);
                }
            };
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

