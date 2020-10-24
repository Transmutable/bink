/**
EventListener holds information about listeners on an object with the EventHandler
*/
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
`EventHandler` is the base class that implements event distribution
*/
const EventHandler = class {
	/** Send an event to listeners */
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
	@param {Object|Symbol} [eventName] a string or Symbol indicating the event to watch
	@param {function(eventName: string, eventSource: EventHandler): undefined} callback often includes more parameters that are specific to the event
	@param {boolean} [once=false] If true then the listener is removed after receiving one event
	*/
	addListener(eventName, callback, once = false) {
		this.listeners.push(new EventListener(eventName, callback, once))
	}

	/**
	@param {string} eventName
	@param {function} callback
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

	/** @return {EventListener[]} */
	get listeners() {
		if (typeof this._listeners == 'undefined') {
			this._listeners = []
		}
		return this._listeners
	}

	/**
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
