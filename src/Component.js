import dom from './DOM.js'
import EventHandler from './EventHandler.js'

/**
`Component` contains the reactive logic for a responsive UI element.
*/
const Component = class extends EventHandler {
	/**
	@param {DataObject} [dataObject]
	@param {Object} [options]
	@param {HTMLElement} [options.dom]
	*/
	constructor(dataObject = null, options = {}) {
		super()
		this.dataObject = dataObject // a DataModel or DataCollection
		this.options = Object.assign(
			{
				dom: null,
			},
			options
		)
		this.cleanedUp = false
		this.dom = this.options.dom || dom.div()
		// See the Binder class below for info
		this._binder = new Binder(this)
		this.addClass('component')
		if (this.options.name) {
			this.setName(this.options.name)
		}
	}

	/**
	Called to dispose of any resources used by this component.
	Extending classes *should* override and call cleanup on sub-Components.
	*/
	cleanup() {
		if (this.cleanedUp) return
		this.cleanedUp = true
		super.cleanup()
		this._binder.cleanup()
		return this
	}

	/** @type {HTMLElement} */
	get dom() {
		return this._dom
	}

	/**
	appendComponent adds the childComponent's dom to this Component's dom
	@param {Component} childComponent
	*/
	appendComponent(childComponent) {
		this._dom.appendChild(childComponent.dom)
		return this
	}
	/**
	removeComponent removes the childComponent's dom from this Component's dom.
	@param {Component} childComponent
	@param {boolean} [clean]
	*/
	removeComponent(childComponent, clean = true) {
		this._dom.removeChild(childComponent.dom)
		if (clean) childComponent.cleanup()
		return this
	}

	/**
	A handy method for quick creation and setting of a parent:
	this._fooComponent = new FooComponent().appendTo(parentComponent)
	@param {Component} parentComponent
	*/
	appendTo(parentComponent) {
		parentComponent.appendComponent(this)
		return this
	}

	/**
	Sets the data-name attribute on the dom
	*/
	setName(name) {
		this._dom.setAttribute('data-name', name)
		return this
	}

	/**
	add class attributes to dom elements
	@param {string[]} classNames
	*/
	addClass(...classNames) {
		this._dom.addClass(...classNames)
		return this
	}

	/**
	remove class attributes to the dom
	@param {string[]} classNames
	*/
	removeClass(...classNames) {
		this._dom.removeClass(...classNames)
		return this
	}

	/**
	hides the dom
	*/
	hide() {
		this.addClass('hidden')
		return this
	}

	/**
	shows the dom
	*/
	show() {
		this.removeClass('hidden')
		return this
	}

	/**
	Listen to a DOM or Component event.
	For example:
		this.buttonDOM = dom.button()
		this.listenTo('click', this.buttonDOM, this.handleClick)

		this.textComponent = new TextComponent(...)
		this.listenTo(Component.TextInputEvent, this.textComponent, (eventName, ...params) => { ... })

	@param {string} eventName
	@param {HTMLElement or EventHandler} target
	@param {function} listener
	@param {boolean} [once] only listen to the first event, then unbind
	*/
	listenTo(eventName, target, listener, once = false) {
		this._binder.listenTo(eventName, target, callback, once)
	}

	/**
	@param {string} dataField
	@param {HTMLElement or Object3D} target
	@param {function} formatter
	@param {DataModel} dataModel
	*/
	bindText(dataField, target, formatter = null, dataModel = this.dataObject) {
		this._binder.bindText(dataField, target, formatter, dataModel)
	}

	/*
	Set an attribute of target DOM to the value of dataModel.get(dataField) as it changes
	formatter defaults to the identity function but can be any function that accepts the value and returns a string

	@param {string} dataField
	@param {HTMLElement} target
	@param {string} attributeName
	@param {function} formatter
	@param {DataModel} dataModel
	*/
	bindAttribute(dataField, target, attributeName, formatter = null, dataModel = this.dataObject) {
		this._binder.bindAttribute(dataField, target, attributeName, formatter, dataModel)
	}
}

/**
Binder listens for events on {@link EventHandler}s or DOM elements and changes characteristics of an HTMLElement or Component in response.
This is part of what makes a Component "reactive".
*/
const Binder = class {
	constructor(component) {
		this._component = component
		this._boundCallbacks = [] // { callback, dataObject } to be unbound during cleanup
		this._eventCallbacks = [] // { callback, eventName, target } to be unregistered during cleanup
	}
	cleanup() {
		for (const bindInfo of this._boundCallbacks) {
			bindInfo.dataObject.removeListener(bindInfo.callback)
		}
		for (const info of this._eventCallbacks) {
			if (info.target instanceof EventHandler) {
				info.target.removeListener(info.callback, info.eventName)
			} else {
				info.target.removeEventListener(info.eventName, info.callback)
			}
		}
	}

	/**
	Listen to a DOM or EventHandler event.
	For example:
		this.buttonDOM = dom.button()
		this.listenTo('click', this.buttonDOM, this.handleClick)

		this.textComponent = new TextComponent(...)
		this.listenTo(Component.TextInputEvent, this.textComponent, (eventName, ...params) => { ... })

	@param {string} eventName
	@param {HTMLElement or EventHandler} target
	@param {function} callback
	@param {boolean} [once]
	*/
	listenTo(eventName, target, callback, once = false) {
		const info = {
			eventName: eventName,
			target: target,
			callback: callback,
			once: once,
		}
		if (target instanceof EventHandler) {
			target.addListener(eventName, info.callback)
		} else {
			target.addEventListener(eventName, info.callback)
		}
		this._eventCallbacks.push(info)
	}

	/**
	@param {string} dataField
	@param {HTMLElement or Object3D} target
	@param {function} formatter
	@param {DataModel} dataModel
	*/
	bindText(dataField, target, formatter = null, dataModel = this._component.dataObject) {
		if (formatter === null) {
			formatter = (value) => {
				if (value === null) return ''
				if (typeof value === 'string') return value
				return '' + value
			}
		}
		const callback = () => {
			const result = formatter(dataModel.get(dataField))
			target.innerText = typeof result === 'string' ? result : ''
		}
		dataModel.addListener(`changed:${dataField}`, callback)
		callback()
		this._boundCallbacks.push({
			callback: callback,
			dataObject: dataModel,
		})
	}

	/*
	Set the attributeName attribute of target DOM or SOM to the value of dataModel.get(dataField) as it changes
	formatter defaults to the identity function but can be any function that accepts the value and returns a string

	@param {string} dataField
	@param {HTMLElement or Object3D} target
	@param {string} attributeName
	@param {function} formatter
	@param {DataModel} dataModel
	*/
	bindAttribute(dataField, target, attributeName, formatter = null, dataModel = this._component.dataObject) {
		if (formatter === null) {
			formatter = (value) => {
				if (value === null) return ''
				if (typeof value === 'string') return value
				return '' + value
			}
		}
		const callback = () => {
			target.setAttribute(attributeName, formatter(dataModel.get(dataField)))
		}
		dataModel.addListener(`changed:${dataField}`, callback)
		callback()
		this._boundCallbacks.push({
			callback: callback,
			dataObject: dataModel,
		})
	}
}

export default Component
