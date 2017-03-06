
export class EventDispatcher {

	/**
	 * The context object that will be passed to event handler callbacks.
	 */
	private _eventContext: Object;

	/**
	 * Map of registered callbacks for each event type.
	 */
	private _callbacks: {[p: string]: EventDispatcher.Callback[]};

	/**
	 * Constructs a new EventDispatcher.
	 *
	 * @param	context		The context object to send with events.  If not specified, this
	 *						EventDispatcher instance will be sent as the context object.
	 */
	constructor(context?: Object) {
		this._eventContext = (context == null ? this : context);
		this._callbacks = {};
	} // constructor

	/**
	 * Invokes all registered handlers for the specified event type with the provided data.
	 *
	 * @param	event	The event name.
	 * @param	data	The data to send with the event.
	 *
	 * @return	The instance the method was called on, for chaining calls.
	 */
	protected trigger(event: string, data?: any): this {
		let callbacks: EventDispatcher.Callback[] = this._callbacks[event];
		if (callbacks != null) {
			for (let callback of callbacks) {
				callback.call(this._eventContext, this._eventContext, event, data);
			}
		}
		return this;
	} // trigger

	/**
	 * Registers a new handler for an event.
	 *
	 * If the specified callback function is already registered for the given event, this function
	 * does nothing.
	 *
	 * @param	event		The event to register the callback for.
	 * @param	callback	The callback function to register.
	 *
	 * @return	The instance the method was called on, for chaining calls.
	 */
	on(event: string, callback: EventDispatcher.Callback): this {
		let callbacks: EventDispatcher.Callback[] = this._callbacks[event];
		if (callbacks != null) {
			let index: number = callbacks.indexOf(callback);
			if (index < 0)
				callbacks.push(callback);
		} else {
			this._callbacks[event] = [ callback ];
		}

		return this;
	} // on

	/**
	 * Unregisters a previously registered handler for an event.
	 *
	 * If the specified callback function is not currently registered for the given event, this
	 * function does nothing.
	 *
	 * @param	event		The event to unregister the callback for.
	 * @param	callback	The callback function to unregister.
	 *
	 * @return	The instance the method was called on, for chaining calls.
	 */
	off(event: string, callback: EventDispatcher.Callback): this {
		let callbacks: EventDispatcher.Callback[] = this._callbacks[event];
		if (callbacks != null) {
			let index: number = callbacks.indexOf(callback);
			if (index > -1) {
				if (callbacks.length == 1)
					delete this._callbacks[event];
				else
					callbacks.splice(index, 1);
			}
		}

		return this;
	} // off

} // EventDispatcher


export module EventDispatcher {

	export type Callback = (context: any, event: string, data?:any) => void;

} // EventDispatcher
