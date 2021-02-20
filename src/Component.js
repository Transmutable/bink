import dom from './DOM.js'
import EventHandler from './EventHandler.js'

/**
`Component` contains the reactive logic for a responsive UI element.

It manages its DOM fragment based on events from DataModels and DataCollections as well as user input events.

It also tracks listeners so that on `cleanup` it can deregister itself to prevent object leaks.

Bink comes with a library of components so be sure to check the API docs before implementing a common basic view. They are also pretty good examples of how to write Components.

* @example <caption>A toggle with a label</caption>
* class BinaryComponent extends Component {
* 	constructor(dataObject=null, options={}) {
* 		super(dataObject, Object.assign(options, {
* 			label: null,
* 			dataField: null,
* 			dom: dom.span() // Default to a `span` DOM element
* 		})
* 		this.addClass('binary-component')
* 
* 		// Check that we have the info we need
* 		if (typeof this.options.dataField !== 'string') {
* 			throw new Error('BinaryComponent requires a `dataField` option')
* 		}
* 		if (this.dataObject instanceof DataModel === false) {
* 			throw new Error('BinaryComponent requires a DataModel')
* 		}
* 
* 		// Use a few sub-Components for UI
* 		this._labelComponent = new LabelComponent(undefined, {
* 				text: this.options.label || lt('No label')
* 		}).appendTo(this)
* 
* 		this._toggleComponent = new SwitchComponent( this.dataObject, {
* 			dataField: this.options.dataField
* 		}).appendTo(this)
* 	}
* }

*/
const Component = class extends EventHandler {
	/**
	@param {DataObject} [dataObject=null]
	@param {Object} [options={}]
	@param {HTMLElement} [options.dom=div] The HTML element that contains this Component's UI
	@param {string} [options.anchor=null] A URL that to which the document will traverse if the `dom` is clicked.
	@param {string} [options.name=null] If set, calls {@link Component.setName} with the value
	*/
	constructor(dataObject = null, options = {}) {
		super()

		/**
		`Component.dataObject` can be null or any class that extends {@link DataObject}.

		By default, that's {@link DataModel} and {@link DataCollection} but coders may create their own DataObject extension.

		@return {?DataObject}
		*/
		this.dataObject = dataObject

		/**
		@type {Object}
		@property {HTMLElement} [dom=null]
		*/
		this.options = Object.assign(
			{
				dom: null,
				anchor: null,
			},
			options
		)
		this.cleanedUp = false
		this._dom = this.options.dom || dom.div()
		if (typeof this._dom.addClass === 'undefined') {
			this._dom = dom.enhanceElement(this._dom)
		}
		this._anchor = this.options.anchor

		// See the Binder class below for info
		this._binder = new Binder(this)

		this.addClass('component')

		if (this.options.name) {
			this.setName(this.options.name)
		}

		if (this._anchor) {
			this.listenTo('click', this.dom, (ev) => {
				document.location.href = this._anchor
			})
		}
	}

	/**
	Called to dispose of any resources used by this component, including any listeners added via {@link Component.listenTo}.

	Extending classes *should* override and release any resources that they control.

	@return {Component} - the Component should not be used after this but the return is useful for chaining
	*/
	cleanup() {
		if (this.cleanedUp) return
		this.cleanedUp = true
		super.cleanup() // Cleans up the EventHandler
		this._binder.cleanup() // Cleans up bindings from `listenTo`
		return this
	}

	/**
	The DOM object that contains this Component's UI.

	You can override the default `dom` value from the constructor by passing an HTMLElement into the constructor's `options.dom`.

	@example <caption>Use it like any normal DOM element</caption>
	myComponent.dom.setAttribute('data-example', 'new-value')

	@return {HTMLElement}
	*/
	get dom() {
		return this._dom
	}

	/**
	A URL that to which the document will traverse if the `dom` is clicked, usually set via the constructor's `Option.anchor`

	@return {?string}
	*/
	get anchor() {
		return this._anchor
	}

	/**
	@param {string} [value=null] - A URL string to which the document will traverse if the `dom` is clicked
	*/
	set anchor(value) {
		this._anchor = value
	}

	/**
	Adds the childComponent's `dom` as a child of this Component's `dom`

	@param {Component} childComponent
	@return {Component} returns `this` (not the child component) for chaining
	*/
	append(childComponent) {
		this._dom.appendChild(childComponent.dom)
		return this
	}

	/**
	Removes the childComponent's `dom` from this Component's `dom`

	@param {Component} childComponent
	@param {boolean} [clean=true] if true, call {@link Component.cleanup} on the removed Component
	@return {Component} returns `this` (not the childComponent) for chaining
	*/
	removeComponent(childComponent, clean = true) {
		this._dom.removeChild(childComponent.dom)
		if (clean) childComponent.cleanup()
		return this
	}

	/**
	A handy method for quick creation and setting of a parent:

	@example
	this._fooComponent = new FooComponent().appendTo(parentComponent)

	@param {Component} parentComponent - The component to which `this` is appended
	@return {Component} returns `this` (not the parent component) for chaining
	*/
	appendTo(parentComponent) {
		parentComponent.append(this)
		return this
	}

	/**
	Sets the `name` attribute on this component's `dom.dataset` attribute.

	This is optional but it can be useful during debugging.

	@param {string} name
	@return {Component} returns `this` for chaining
	*/
	setName(name) {
		this._dom.setAttribute('data-name', name)
		return this
	}

	/**
	Add one or more classes to this component's dom `class` attribute without removing any existing classes.

	This is optional but the best practice is to add a unique name for classes that extend `Component`.

	@param {...string} classNames
	@return {Component} returns `this` for chaining
	*/
	addClass(...classNames) {
		this._dom.addClass(...classNames)
		return this
	}

	/**
	Remove one or more classes from this component's dom `class` attribute without changing other classes

	@param {...string} classNames
	@return {Component} returns `this` for chaining
	*/
	removeClass(...classNames) {
		this._dom.removeClass(...classNames)
		return this
	}

	/**
	Hides the dom by adding the `hidden` class

	@return {Component} returns `this` for chaining
	*/
	hide() {
		this.addClass('hidden')
		return this
	}

	/**
	Shows the dom by removing the `hidden` class

	@return {Component} returns `this` for chaining
	*/
	show() {
		this.removeClass('hidden')
		return this
	}

	/**
	Listen to a DOM, {@link Component}, or {@link DataObject} event.

	The nice thing about using `listenTo` instead of directly adding event listeners is that {@link Component.cleanup} will remove all of those listeners to avoid leaking this object.

	@example
	this.buttonDOM = dom.button('Click me')
	this.listenTo('click', this.buttonDOM, (domEvent) => { ... })

	@example
	this.buttonComponent = new ButtonComponent(...).appendTo(this)
	this.listenTo(ButtonComponent.ActivatedEvent, this.buttonComponent, (eventName) => { ... })

	@example
	this.exampleModel = new DataModel({ someField: 42 })
	this.listenTo('changed:someField', this.exampleModel, (eventName, ...params) => { ... })

	@param {string} eventName
	@param {HTMLElement or EventHandler} target
	@param {function} callback
	@param {boolean} [once=false] only listen to the first event, then unbind
	*/
	listenTo(eventName, target, callback, once = false) {
		this._binder.listenTo(eventName, target, callback, once)
	}

	/**
	Sets the `innerText` of the target DOM element to the value of `dataModel.get(dataField, '')`, even as it changes.

	`formatter` defaults to the identity function but can be any function that accepts the value and returns a string.

	@example
	* this.component = new Component(
	* 	new DataModel({ description: 'Some example text' })
	* )
	* this.component.bindText(
	* 	'description', 		// dataField
	* 	this.component.dom,	// target
	* 	(value) => { return (typeof value === 'string') ? value.toUpperCase() : '' }
	* )
	// Now any changes to the DataModel's `description` field will be displayed by the component

	@param {string} dataField The name of the field to watch
	@param {HTMLElement} target The DOM element whose `innerText` will be manipulated
	@param {function(value: *): string} [formatter=null]
	@param {DataModel} [dataModel=this.dataObject] defaults to this Component's `dataObject`
	*/
	bindText(dataField, target, formatter = null, dataModel = this.dataObject) {
		this._binder.bindText(dataField, target, formatter, dataModel)
	}

	/**
	Sets an attribute of the target DOM element to the value of dataModel.get(dataField), even as it changes.

	`formatter` defaults to the identity function but can be any function that accepts the value and returns a string.

	@example
	* this.component = new Component(
	* 	new DataModel({ isAmazing: false })
	* )
	* this.component.bindAttribute(
	* 	'isAmazing', 		// dataField
	* 	this.component.dom,	// target
	* 	'data-example',		// attributeName
	* 	(value) => { return value ? 'is-amazing' : 'not-amazing' }
	* )
	* // Now any changes to this.component.dataObject will change the `data-example` attribute
	* this.component.dataObject.set('isAmazing', true)

	@param {string} dataField - The name of the field on the `DataModel`
	@param {HTMLElement} target - The DOM element to manipulate 
	@param {string} attributeName - The DOM element's attribute to change
	@param {function(value: *): string} [formatter=null] - defaults to identity (no change to field data)
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
	/**
	@param {Component} component
	*/
	constructor(component) {
		this._component = component
		this._boundCallbacks = [] // { callback, dataObject } to be unbound during cleanup
		this._eventCallbacks = [] // { callback, eventName, target } to be unregistered during cleanup
	}

	cleanup() {
		for (const bindInfo of this._boundCallbacks) {
			bindInfo.dataObject.removeListener(EventHandler.ALL_EVENTS, bindInfo.callback)
		}
		for (const info of this._eventCallbacks) {
			if (info.target instanceof EventHandler) {
				info.target.removeListener(info.eventName, info.callback)
			} else {
				info.target.removeEventListener(info.eventName, info.callback)
			}
		}
	}

	/**
	Listen to events from a DOM element or {@link EventHandler} in a way that they can be automatically cleaned up.

	Inside of a `Component`'s implementation you should use `listenTo` instead of directly listening using `HTMLElement.addListener` or {@link EventHandler.addListener}.

	The advantage of using `Component.listenTo` is that `Component` will keep track of these events and listener functions and then clean them up in {@link Component.cleanup}.

	@example <caption>Listen to DOM element events</caption>
	* class MyComponent extends Component {
	* 	constructor(dataObject=null, options={}) {
	* 		super(dataObject, options)
	*
	* 		// Listen to the Component's DOM fragment root:
	* 		this.listenTo('click', this.dom, (domClickEvent) => {
	* 			// Handle the entire Component's DOM click events
	* 		})
	*
	* 		// Listen to events on a child DOM element
	* 		const buttonEl = dom.button('Click me').appendTo(this.dom)
	* 		this.listenTo('click', buttonEl, (ev) => {
	* 			// Handle the button's DOM click event
	* 		})
	* 	}
	* }

	@example <caption>Listen to a sub-Component's events</caption>
	*class AnotherComponent extends Component {
	*	constructor(dataObject=null, options={}) {
	*		super(dataObject, options)
	*
	*		this.buttonComponent = new ButtonComponent(undefined,
	*			{ text: 'Click me' }
	*		).appendTo(this)
	*		this.listenTo(
	*			ButtonComponent.ActivatedEvent,
	*			this.buttonComponent,
	*			(eventName) => {
	*				// Handle the button's activated event
	*			}
	*		)
	*	}
	*}

	@param {string|Symbol} eventName - for DOM elements this will be a string like 'click' and for `Components` it will be a Symbol like `ButtonComponent.ActivatedEvent` 
	@param {HTMLElement|EventHandler} target - the object whose events should be listened to
	@param {function} callback - the function that is called when a matching event arrives
	@param {boolean} [once=false] - if true, the listener will be automatically removed when its first event arrives
	@return {Component} - return `this` for chaining
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
		return this
	}

	/**
	Sets the `innerText` of the target DOM element to the value of dataModel.get(dataField), even as it changes.

	`formatter` defaults to the identity function but can be any function that accepts the value and returns a string.

	@example
	* this.component = new Component(
	* 	new DataModel({ description: 'Some example text' })
	* )
	* this.component.bindText(
	* 	'description', 		// dataField
	* 	this.component.dom,	// target
	* 	(value) => { return (typeof value === 'string') ? value.toUpperCase() : '' }
	* )
	// Now any changes to the DataModel's `description` field will be displayed by the component

	@param {string} dataField The name of the field to watch
	@param {HTMLElement} target The DOM element whose `innerText` will be manipulated
	@param {function(value: *): string} [formatter=null]
	@param {DataModel} [dataModel=this.dataObject] defaults to this Component's `dataObject`
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

	/**
	Sets an attribute of the target DOM element to the value of dataModel.get(dataField), even as it changes.

	`formatter` defaults to the identity function but can be any function that accepts the value and returns a string.

	@example
	* this.component = new Component(
	* 	new DataModel({ isAmazing: false })
	* )
	* this.component.bindAttribute(
	* 	'isAmazing', 		// dataField
	* 	this.component.dom,	// target
	* 	'data-example',		// attributeName
	* 	(value) => { return value ? 'is-amazing' : 'not-amazing' }
	* )
	* // Now any changes to this.component.dataObject will change the `data-example` attribute
	* this.component.dataObject.set('isAmazing', true)

	@param {string} dataField - The name of the field on the `DataModel`
	@param {HTMLElement} target - The DOM element to manipulate 
	@param {string} attributeName - The DOM element's attribute to change
	@param {function(value: *): string} [formatter=null] - defaults to identity (no change to field data)
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
export { Component }
