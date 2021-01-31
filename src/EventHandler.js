const EventListener = class {
	constructor(eventName, callback, once = false) {
		this.eventName = eventName
		this.callback = callback
		this.once = once
	}
	matches(eventName) {
		return this.eventName === EventHandler.ALL_EVENTS || eventName === this.eventName
	}
	distributeEvent(eventName, ...params) {
		if (this.matches(eventName)) {
			this.callback(eventName, ...params)
			return true
		}
		return false
	}

	cleanup() {
		delete this.eventName
		delete this.callback
		delete this.once
	}
}

/**
The base class that implements event distribution for classes like {@link Component}, {@link DataModel}, and {@link DataCollection}.

*/
const EventHandler = class {
	/**
	Send an event to listeners

	@param {string} eventName - an identifier for the event like 'changed:fieldName' or 'deleted'
	@param {...*} params - the parameters handed to the listeners
	*/
	trigger(eventName, ...params) {
		const listenersToRemove = []
		for (const listener of this.listeners) {
			if (listener.distributeEvent(eventName, ...params) && listener.once) {
				listenersToRemove.push(listener)
			}
		}
		for (const listener of listenersToRemove) {
			this.removeListener(listener.callback, listener.eventName)
		}
	}

	/**
	Adds a listener callback for a given event name.

	If you pass `EventHandler.ALL_EVENTS` then the callback will receive all events, regardless of name.

	@param {Object|Symbol} [eventName] a string or Symbol indicating the event to watch
	@param {function(eventName: string, params: ...*): undefined} callback often includes more parameters that are specific to the event
	@param {boolean} [once=false] If true then the listener is removed after receiving one event
	*/
	addListener(eventName, callback, once = false) {
		this.listeners.push(new EventListener(eventName, callback, once))
	}

	/**
	Removes reference to a specific listener.

	@param {string|Symbol|EventHandler.ALL_EVENTS} eventName
	@param {function} callback - the function originally passed into {@link EventhHandler.addListener}.
	*/
	removeListener(eventName, callback) {
		let remove = false
		for (let i = 0; i < this.listeners.length; i++) {
			remove = false
			if (this.listeners[i].callback === callback) {
				if (eventName == EventHandler.ALL_EVENTS) {
					remove = true
				} else if (this.listeners[i].matches(eventName)) {
					remove = true
				}
			}
			if (remove) {
				this.listeners[i].cleanup()
				this.listeners.splice(i, 1)
				i -= 1
			}
		}
	}

	/** @private */
	get listeners() {
		if (typeof this._listeners == 'undefined') {
			this._listeners = []
		}
		return this._listeners
	}

	/**
	Removes all references to listener callbacks.

	This should be called by extending classes.

	@return {EventHandler} returns `this` for chaining
	*/
	cleanup() {
		if (typeof this._listeners !== 'undefined') {
			for (let i = 0; i < this._listeners.length; i++) {
				this._listeners[i].cleanup()
			}
			this._listeners.length = 0
		}
		return this
	}
}
EventHandler.ALL_EVENTS = Symbol('all events')

export default EventHandler
export { EventHandler }
