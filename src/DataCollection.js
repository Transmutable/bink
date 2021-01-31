import DataModel from './DataModel.js'
import DataObject from './DataObject.js'
import EventHandler from './EventHandler.js'

/**
An ordered list of DataModel instances, either locally or [fetched](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) from a service.

There are various ways to sort the collection, from {@link DataCollection.sort} to {@link DataCollection.keepSortedByField}.
The comparator functions used in sorting should use the same return values (e.g. -1, 0, 1) as the [Array.prototype.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) comparators.

@example <caption>Constructed with data:</caption>
this.collection = new DataCollection([
	{ id: 0, title: 'first model'},
	{ id: 1, title: 'second model'},
	{ id: 3, title: 'third model'}
])

@example <caption>A custom class that is populated from a service:</caption>
class ExampleCollection extends Collection {
	get url() { return '/api/examples' }
}
this.collection = new ExampleCollection()
this.collection.fetch().then(() => { ... }).catch((err) => { ... })

*/
const DataCollection = class extends DataObject {
	/**
	@param {Array<Object>} [data=[]] An array of data objects that are loaded into {@link DataModel}s
	@param {Object} [options={}]
	@param {class} [options.dataObject=DataModel] the `class` of a `DataObject` type to use to wrap each data item in this collection
	*/
	constructor(data = [], options = {}) {
		super(options)
		if (data == null) data = []
		/** @type {Array<DataObject>} */
		this.dataObjects = []
		this._inReset = false
		this._inAddBatch = false
		this._boundRelayListener = this._relayListener.bind(this)

		for (const datum of data) {
			this.add(this._generateDataObject(datum))
		}
	}

	cleanup() {
		super.cleanup()
		for (const obj of this.dataObjects) {
			obj.removeListener(this._boundRelayListener)
		}
		this.dataObjects.length = 0
	}

	/**
	@param {int} index
	@return {DataObject} the DataObject at `index` in the internal list
	@throws {Error} throw when index is out of range
	*/
	at(index) {
		if (index < 0 || index > this.dataObjects.length - 1) {
			throw new Error(`Index out of range: ${index}`)
		}
		return this.dataObjects[index]
	}

	/**
	@param {Object} data - the data used to create a new DataModel in this collection
	@param {Object} [options={}] - the options passed into {@link DataModel.constructor}
	@return {Promise<DataModel,Error>}
	*/
	create(data, options = {}) {
		// Creates an child instance and POSTs it to the collection
		return new Promise(
			function (resolve, reject) {
				const fetchOptions = Object.assign(options, this.fetchOptions)
				fetchOptions.method = 'post'
				fetchOptions.body = JSON.stringify(data)
				this._innerFetch(this.url, fetchOptions)
					.then((response) => {
						if (response.status != 200) {
							throw new Error('Create failed with status ' + response.status)
						}
						return response.json()
					})
					.then((data) => {
						const dataObject = this._generateDataObject(data)
						this.add(dataObject)
						resolve(dataObject)
					})
					.catch(reject)
			}.bind(this)
		)
	}

	/**
	@param {DataObject} dataObject
	@return {DataCollection} - returns `this` for easy chaining
	*/
	add(dataObject) {
		if (dataObject instanceof DataObject == false) {
			dataObject = this._generateDataObject(dataObject)
		}
		if (this.dataObjects.indexOf(dataObject) !== -1) {
			// TODO stop using indexOf because equality doesn't work
			return
		}
		this.dataObjects.push(dataObject)
		dataObject.collection = this
		this.trigger(DataCollection.AddedEvent, this, dataObject)
		if (this._comparator && this._inReset == false && this._inAddBatch == false) {
			this.sort(this._comparator)
		}
		dataObject.addListener(EventHandler.ALL_EVENTS, this._boundRelayListener)
	}

	_relayListener(...params) {
		this.trigger(...params)
	}

	/**
	Add an array of DataObjects to the end of the collection
	@param {Array<DataObject>} dataObjects
	*/
	addBatch(dataObjects) {
		this._inAddBatch = true
		for (let dataObject in dataObjects) {
			if (dataObject instanceof DataObject == false) {
				dataObject = this._generateDataObject(dataObject)
			}
			this.add(dataObject)
		}
		this._inAddBatch = false
	}

	/**
	@param {DataObject} dataObject
	@return {int|-1}
	*/
	indexOf(dataObject) {
		for (let i = 0; i < this.dataObjects.length; i++) {
			if (this.dataObjects[i].equals(dataObject)) {
				return i
			}
		}
		return -1
	}

	/**
	Find the first DataModel with a certain field value.

	@example
	this.collection = new DataCollection(...)
	this.collection.fetch().then(() => {
		console.log('DataModel with id 42:', this.collection.firstByField('id', 42)
	})


	@param {string} dataField - The name of the DataModel field in which to look
	@param {*} value - The value of the field to match using `===`
	@return {DataObject|null} The first matching DataModel or null if there is no match
	*/
	firstByField(dataField, value) {
		for (const model of this) {
			if (model.get(dataField) === value) {
				return model
			}
		}
		return null
	}

	/**
	@param {DataObject} dataObject
	@return {DataCollection} returns `this` (the collection) for easy chaining
	*/
	remove(dataObject) {
		const index = this.indexOf(dataObject)
		if (index === -1) {
			return this
		}
		this.dataObjects[index].removeListener(EventHandler.ALL_EVENTS, this._boundRelayListener)
		this.dataObjects.splice(index, 1)
		dataObject.collection = null
		this.trigger(DataCollection.RemovedEvent, this, dataObject)
		return this
	}

	/**
	Reset the state of the collection.

	@param {Array<Object>} data - Used like the `data` parameter of the contructor to reset the state of the collection
	*/
	reset(data) {
		this._inReset = true
		for (const obj of this.dataObjects.slice()) {
			this.remove(obj)
		}
		for (const datum of data) {
			this.add(this._generateDataObject(datum))
		}
		this._inReset = false
		if (this._comparator) {
			this.sort(this._comparator)
		}
		this.trigger(DataCollection.ResetEvent, this)
	}

	/**
	Rearranges the order of the Collection using a specific sorting algorithm

	@param {function(dataObject1: DataObject, dataObject2: DataObject): integer} comparator
	*/
	sort(comparator = DataCollection.defaultComparator) {
		this.dataObjects.sort(comparator)
		this.trigger(DataCollection.SortedEvent, this)
	}

	/**


	@param {string} attributeName
	@param {function(dataObject1: DataObject, dataObject2: DataObject): integer} [comparator=DataCollection.defaultComparator]
	*/
	sortByAttribute(attributeName, comparator = DataCollection.defaultComparator) {
		this.sort((obj1, obj2) => {
			return comparator(obj1.get(attributeName), obj2.get(attributeName))
		})
	}

	/**
	@param {string} dataField
	@param {function(dataObject1: DataObject, dataObject2: DataObject): integer} [comparator=DataCollection.defaultComparator]
	*/
	keepSortedByField(dataField, comparator = DataCollection.defaultComparator) {
		this._comparator = (obj1, obj2) => {
			return comparator(obj1.get(dataField), obj2.get(dataField))
		}
		this.addListener(DataCollection.ChangedEventPrefix + dataField, () => {
			if (this._comparator && this._inReset == false && this._inAddBatch == false) {
				this.sort(this._comparator)
			}
		})
	}

	/** @return {Iterator<DataObject>} */
	*[Symbol.iterator]() {
		for (const obj of this.dataObjects) {
			yield obj
		}
	}

	/**
	The number of data items in this collection

	@type {int}
	*/
	get length() {
		return this.dataObjects.length
	}

	_generateDataObject(data) {
		const options = { collection: this }
		let dataObj
		if (this.options.dataObject) {
			dataObj = new this.options.dataObject(data, options)
		} else {
			dataObj = new DataModel(data, options)
		}
		dataObj._new = false
		return dataObj
	}
}

DataCollection.ChangedEventPrefix = 'changed:'

DataCollection.AddedEvent = Symbol('dc-added')
DataCollection.RemovedEvent = Symbol('dc-removed')
DataCollection.ResetEvent = Symbol('dc-reset')
DataCollection.SortedEvent = Symbol('dc-sorted')

DataCollection.defaultComparator = function (dataObject1, dataObject2) {
	if (dataObject1 === dataObject2) return 0
	if (typeof dataObject1.equals === 'function' && dataObject1.equals(dataObject2)) return 0
	if (typeof dataObject1.get === 'function' && typeof dataObject2.get === 'function') {
		const val1 = dataObject1.get('id', -1)
		const val2 = dataObject2.get('id', -1)
		if (val1 === val2) return 0
		if (val1 < val2) return -1
		return 1
	}
	if (dataObject1 < dataObject2) return -1
	return 1
}

export default DataCollection
export { DataCollection }
