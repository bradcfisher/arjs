import { ClassRegistry, Serializer, Deserializer } from "./Serializer";
import { Configurable } from "./Configurable";

/**
 * Interface that must be implemented by objects that receive notifications for events.
 */
export interface EventListener {
	/**
	 * Processes events.
	 *
	 * @param context The source object the event was fired for.
	 * @param event The event type.
	 * @param data Additional event data
	 */
	processEvent(context: any, event: string, data?: any): void;
}

export interface EventDispatcherConfig {
	/**
	 * The context object that will be passed to event listener.
	 * If not specified, the dispatcher instance is used as the context.
	 */
	readonly eventContext?: Object;

	/**
	 * Map of registered listeners for each event type.
	 * If not specified, no listeners will be registered.
	 */
	readonly listeners?: ReadonlyMap<string, ReadonlyArray<EventListener>>;
}

/**
 * Event routing implementation.
 */
export class EventDispatcher
	implements Configurable<EventDispatcherConfig>
{

	/**
	 * The context object that will be passed to event listener.
	 */
	private _eventContext: Object;

	/**
	 * Map of registered listeners for each event type.
	 */
	private readonly _listeners: Map<string, EventListener[]> = new Map();

	/**
	 * Static initializer for registering deserializer with private member access.
	 */
	private static _initializeClass_EventDispatcher: void = (() => {
		ClassRegistry.registerClass(
			"EventDispatcher", EventDispatcher,
			(dispatcher: EventDispatcher, serializer: Serializer): void => {
				serializer.writeProp(dispatcher.config);
			},
			(dispatcher: EventDispatcher, data: any, deserializer: Deserializer): void => {
				dispatcher.configure(deserializer.readProp(data) as EventDispatcherConfig);
			}
		);
	})();

	/**
	 * Constructs a new EventDispatcher.
	 *
	 * @param	context		The context object to send with events.  If not specified, this
	 *						EventDispatcher instance will be sent as the context object.
	 */
	constructor(context?: Object) {
		this._eventContext = (context == null ? this : context);
	}

	/**
	 * Applies a configuration to this EventDispatcher.
	 * @param config The configuration to apply.
	 */
	configure(config: EventDispatcherConfig) {
		this._eventContext = (config.eventContext == null ? this : config.eventContext);

		this._listeners.clear();
		if (config.listeners != null) {
			for (let entry of config.listeners) {
				this._listeners.set(entry[0], entry[1].slice());
			}
		}
	}

	/**
	 * Constructs a configuration object for this EventDispatcher.
	 * @return A configuration object representing this EventDispatcher's current state.
	 */
	get config(): EventDispatcherConfig {
		return {
			listeners: new Map(this._listeners),
			eventContext: (this._eventContext === this ? undefined : this._eventContext)
		};
	}

	/**
	 * Invokes all registered handlers for the specified event type with the provided data.
	 *
	 * @param	event	The event name.
	 * @param	data	The data to send with the event.
	 *
	 * @return	The instance the method was called on, for chaining calls.
	 */
	protected trigger(event: string, data?: any): this {
		let listeners: EventListener[]|undefined = this._listeners.get(event);
		if (listeners != null) {
			for (let listener of listeners) {
				listener.processEvent(this._eventContext, event, data);
			}
		}
		return this;
	}

	/**
	 * Registers a new listener for an event.
	 *
	 * If the specified listener is already registered for the given event, this function
	 * does nothing.
	 *
	 * @param	event		The event to register the listener for.
	 * @param	listener	The EventListener to register.
	 *
	 * @return	The instance the method was called on, for chaining calls.
	 */
	on(event: string, listener: EventListener): this {
		let listeners: EventListener[]|undefined = this._listeners.get(event);
		if (listeners != null) {
			let index: number = listeners.indexOf(listener);
			if (index < 0)
				listeners.push(listener);
		} else {
			this._listeners.set(event, [ listener ]);
		}

		return this;
	}

	/**
	 * Unregisters a previously registered listener for an event.
	 *
	 * If the specified listener is not currently registered for the given event, this
	 * function does nothing.
	 *
	 * @param	event		The event to unregister the listener for.
	 * @param	listener	The EventListener to unregister.
	 *
	 * @return	The instance the method was called on, for chaining calls.
	 */
	off(event: string, listener: EventListener): this {
		let listeners: EventListener[]|undefined = this._listeners.get(event);
		if (listeners != null) {
			let index: number = listeners.indexOf(listener);
			if (index > -1) {
				if (listeners.length == 1)
					this._listeners.delete(event);
				else
					listeners.splice(index, 1);
			}
		}

		return this;
	}

}
