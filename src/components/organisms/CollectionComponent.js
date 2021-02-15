import dom from '../../DOM.js'
import Component from '../../Component.js'
import { lt, ld } from '../../Localizer.js'
import DataObject from '../../DataObject.js'
import DataCollection from '../../DataCollection.js'

import LabelComponent from '../atoms/LabelComponent.js'

/**
DefaultItemComponent is used by {@link CollectionComponent} if no 'itemComponent' option is passed.

The only thing in this {@link Component} is a {@link LabelComponent} with the first field that exists of: 'title', 'name', or 'text'.

You'll usually want to pass an `itemComponent` option to `CollectionComponent` to present a custom item.
*/
const DefaultItemComponent = class extends Component {
	constructor(dataObject = null, options = {}) {
		super(dataObject, Object.assign({ dom: dom.li() }, options))
		if (dataObject instanceof DataObject === false) throw new Error('DefaultItemComponent requires a dataObject')
		this.addClass('default-item-component')
		this.setName('DefaultItemComponent')

		const itemName = dataObject.getFirst('title', 'name', 'text') || new String(dataObject)
		this._labelComponent = new LabelComponent(undefined, { text: lt('Item: ') + itemName }).appendTo(this)
	}
}

/**
CollectionComponent provides a generic list UI for {@link DataCollection}s.

@todo Add rearrangement via drag and drop
@todo Add pagination support once {@link DataCollection} supports it

@example <caption>Use the DefaultItemComponent</caption>
const myCollection = new DataCollection(...snip...)
const collectionComponent = new CollectionComponent(myCollection)

@example <caption>Use a custom item Component</caption>
const myCollection = new DataCollection(...snip...)
class CustomItemComponent extends Component {
	constructor(dataObject=null, options={}) {
		// Set up your item UI here
	}
}
const collectionComponent = new CollectionComponent(myCollection, {
	itemComponent: CustomItemComponent, // the class, not an instance
	itemOptions: { someKey: 'someValue' } // passed as options to item component constructors
})

@example <caption>Responding to clicks on items</caption>
const myCollection = new DataCollection(...snip...)
const collectionComponent = new CollectionComponent(myCollection, {
	onClick: (dataModel) => {
		// Do something with the DataModel whose item has been clicked
	}
})

*/
const CollectionComponent = class extends Component {
	/**
	@param {DataObject} [dataObject=null]
	@param {Object} [options={}]
	@param {Component} [options.itemComponent=DefaultItemComponent] a Component class used to render each item in this list
	@param {Object} [options.itemOptions] a set of options to pass to each item Component
	@param {function(obj: DataObject)} [options.onClick] a function to call with the dataObject whose item Component is clicked
	*/
	constructor(dataObject = null, options = {}) {
		super(dataObject, Object.assign({ dom: dom.ul() }, options))
		this.addClass('collection-component')
		this.setName('CollectionComponent')

		if (dataObject instanceof DataCollection === false) throw 'CollectionComponent requires a DataCollection dataObject'
		this._inGroupChange = false // True while resetting or other group change
		this._dataObjectComponents = new Map() // dataObject.id -> Component

		this.listenTo(DataObject.ResetEvent, this.dataObject, (...params) => {
			this._handleCollectionReset(...params)
		})
		this.listenTo(DataObject.AddedEvent, this.dataObject, (...params) => {
			this._handleCollectionAdded(...params)
		})
		this.listenTo(DataObject.RemovedEvent, this.dataObject, (...params) => {
			this._handleCollectionRemoved(...params)
		})
		if (this.dataObject.isNew === false) {
			this._handleCollectionReset(undefined, this.dataObject)
		} else if (this.dataObject.length > 0) {
			this._inGroupChange = true
			for (const dataObject of this.dataObject) {
				this._add(this._createItemComponent(dataObject), false)
			}
			this._inGroupChange = false
			this.trigger(CollectionComponent.Reset, this)
		}
	}

	/**
	@param {int} index
	@return {?Component} indexed `Component` or `null` if index is out of bounds
	*/
	at(index) {
		if (index < 0) return null
		if (index >= this.children.length) return null
		return this.children.item(index).component
	}

	/**
	@param {DataObject} dataObject
	@return {?Component}
	*/
	componentForDataObject(dataObject) {
		return this._dataObjectComponents.get(dataObject.get('id'))
	}

	/**
	Call this to change whether item Components are show or hidden based on the result of a function.

	A common pattern is to listen to Collection events like fetched or reset and then re-run a filter.

	@example
	const collectionComponent = new CollectionComponent(...snip...)

	// Only show items for DataModels with an 'active' field that is true
	collectionComponent.filter((dataModel) => {
		return dataModel.get('active') === true
	})

	// Show all items by passing a null filter
	collectionComponent.filter(null)

	@param {function(model: DataObject): boolean} filterFn - returns true if the DataObject's item Component should be shown
	*/
	filter(filterFn = null) {
		for (const itemComponent of this._dataObjectComponents.values()) {
			let display
			if (typeof filterFn === 'function') {
				display = filterFn(itemComponent.dataObject)
			} else {
				display = true
			}
			if (display) {
				itemComponent.show()
			} else {
				itemComponent.hide()
			}
		}
	}

	_handleCollectionAdded(eventName, collection, dataObject) {
		this._add(this._createItemComponent(dataObject))
	}
	_handleCollectionRemoved(eventName, collection, dataObject) {
		const component = this.componentForDataObject(dataObject)
		if (component) {
			this._remove(component)
		}
	}
	_handleCollectionReset(eventName, target) {
		if (target !== this.dataObject) return // It was a reset for an item in the collection, not the collection itself
		this._inGroupChange = true
		this.trigger(CollectionComponent.Resetting, this)
		for (const itemComponent of this._dataObjectComponents.values()) {
			this._remove(itemComponent)
		}
		this._dataObjectComponents.clear()
		for (const dataObject of this.dataObject) {
			this._add(this._createItemComponent(dataObject))
		}
		this._inGroupChange = false
		this.trigger(CollectionComponent.Reset, this)
	}
	_handleItemClick(ev, itemComponent) {
		if (this.options.onClick) {
			ev.preventDefault()
			this.options.onClick(itemComponent.dataObject)
		}
	}
	_add(itemComponent, checkForDoubles = true) {
		/** @todo this assumes the PK is called 'id' */
		if (checkForDoubles && this._dataObjectComponents.get(itemComponent.dataObject.get('id'))) {
			// Already have it, ignore the add
			return
		}
		this._dataObjectComponents.set(itemComponent.dataObject.get('id'), itemComponent)

		this.appendComponent(itemComponent)

		if (this.options.onClick) {
			this.listenTo('click', itemComponent.dom, (ev) => {
				this._handleItemClick(ev, itemComponent)
			})
		}
		this.listenTo('deleted', itemComponent.dataObject, this._handleDeleted.bind(this), true)
	}
	_remove(itemComponent) {
		this._dataObjectComponents.delete(itemComponent.dataObject.get('id'))
		this.removeComponent(itemComponent)
		itemComponent.removeEventListener('click', null)
		itemComponent.cleanup()
	}
	_handleDeleted(eventName, dataObject, error) {
		if (error) return
		const component = this._dataObjectComponents.get(dataObject.get('id'))
		if (component) {
			this._remove(component)
		}
	}
	_createItemComponent(itemDataObject) {
		let options
		if (this.options.itemOptions) {
			options = Object.assign({}, this.options.itemOptions)
		} else {
			options = {}
		}
		let itemComponent
		if (this.options.itemComponent) {
			itemComponent = new this.options.itemComponent(itemDataObject, options)
		} else {
			itemComponent = new DefaultItemComponent(itemDataObject, options)
		}
		itemComponent.addClass('collection-item')
		return itemComponent
	}
}
CollectionComponent.Resetting = 'collection-component-resetting'
CollectionComponent.Reset = 'collection-component-reset'

export default CollectionComponent
export { CollectionComponent, DefaultItemComponent }
