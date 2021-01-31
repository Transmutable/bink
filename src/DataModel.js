import DataObject from './DataObject.js'

/**
Holds a map of <string, value> pairs, sometimes fetched from or sent to a back-end server.

@example <caption>Directly loading data</caption>
this.model = new DataModel({ id: 42, something: 'different' })
this.model.get('id') // returns 42
this.model.get('something') // returns 'different'
this.model.get('bogus', 'default') // returns 'default'

@example <caption>Fetching data from a service</caption>
class ExampleModel extends DataModel {
	get url() { return '/api/example' }
}
this.model = new ExampleModel()
this.model.fetch().then(() => { ... }).catch(err => { ... })
*/
const DataModel = class extends DataObject {
	/**
	@param {Object} [data={}]
	@param {Object} [options={}]
	@param {Object} [options.fieldDataObjects=null] a map of dataField (string) to DataObject (class), used to create sub-objects in this Model's data
	*/
	constructor(data = {}, options = {}) {
		super(options)
		if (typeof this.options.fieldDataObjects === 'undefined') {
			this.options.fieldDataObjects = {}
		}
		/** @type {Object<string,*>} */
		this.data = {}
		/** @type {DataCollection|null} */
		this.collection = null // set or unset by a DataCollection that contains this model

		this.setBatch(data)
	}

	/**
	See {@link DataObject.cleanup} for details.
	*/
	cleanup() {
		super.cleanup()
		// TODO - need to clean up any sub-DataObjects
		this.data = null
	}

	/**
	@param {string} dataField
	@return {boolean} true if this model contains a field with the name of `dataField`
	*/
	has(dataField) {
		return typeof this.data[dataField] !== 'undefined'
	}

	/**
	Find a value held within this DataModel.

	@param {string} dataField
	@param {*} [defaultValue=null] a value to return if the field value is `undefined`, `null`, or the empty string
	@return {*} may be native types or, if mapped by options.fieldDataObjects, another DataObject
	*/
	get(dataField, defaultValue = null) {
		if (typeof this.data[dataField] === 'undefined' || this.data[dataField] === null || this.data[dataField] === '') {
			return defaultValue
		}
		return this.data[dataField]
	}

	/**
	Return the first value that this `DataModel.has` or 'undefined' if none are found

	@param {string[]} dataFields
	@return {*} may be undefined, native types, or (if mapped by options.fieldDataObjects) another DataObject
	*/
	getFirst(...dataFields) {
		for (let i = 0; i < dataFields.length; i += 1) {
			if (this.has(dataFields[i])) {
				return this.get(dataFields[i])
			}
		}
		return undefined
	}

	/**
	Set a key/value pair

	@param {string} dataField
	@param {*} value - the new value of the field
	*/
	set(dataField, value) {
		const batch = {}
		batch[dataField] = value
		return this.setBatch(batch)
	}

	/**
	Set a group of values. The 'values' parameter should be an object that works in for(key in values) loops like a dictionary: {}
	If a key is in options.fieldDataObjects then the value will be used to contruct a DataObject and that will be the saved value.
	*/
	setBatch(values) {
		const changes = {}
		let changed = false
		for (const key in values) {
			const result = this._set(key, values[key])
			if (result !== DataObject._NO_CHANGE) {
				changed = true
				changes[key] = result
				this.trigger(`changed:${key}`, this, key, result)
			}
		}
		if (changed) {
			this.trigger('changed', this, changes)
		}
		return changes
	}

	/**
	Add a value to a field, creating the value if necessary
	@param {string} dataField
	@param {int} [amount=1]
	@return {*} the new value of the field
	*/
	increment(dataField, amount = 1) {
		const currentVal = dataField in this.data ? this.data[dataField] : 0
		this.set(dataField, currentVal + amount)
		return this.get(dataField)
	}

	_set(dataField, data) {
		// _set does not fire any events, so you probably want to use set or setBatch
		if (data instanceof DataObject) {
			if (this.data[dataField] instanceof DataObject) {
				this.data[dataField].reset(data.data)
			} else {
				this.data[dataField] = data
			}
		} else if (this.options.fieldDataObjects[dataField]) {
			if (this.data[dataField]) {
				this.data[dataField].reset(data)
			} else {
				this.data[dataField] = new this.options.fieldDataObjects[dataField](data)
			}
		} else {
			if (this.data[dataField] === data) {
				return DataObject._NO_CHANGE
			}
			if (this.data[dataField] instanceof DataObject) {
				this.data[dataField].reset(data)
			} else {
				this.data[dataField] = data
			}
		}
		return this.data[dataField]
	}

	/**
	Calls the DELETE method on the service resource
	@return {Promise}
	*/
	delete() {
		return new Promise((resolve, reject) => {
			super
				.delete()
				.then((...params) => {
					if (this.collection !== null) {
						this.collection.remove(this)
					}
					resolve(...params)
				})
				.catch((...params) => {
					reject(...params)
				})
		})
	}

	/**
	@param {Object} [data={}]
	*/
	reset(data = {}) {
		for (const key in this.data) {
			if (typeof data[key] === 'undefined') {
				this.data[key] = null
			}
		}
		this.setBatch(data)
		this.trigger('reset', this)
	}

	/**
	@param {*} obj - the value to compare to `this` or `this.get('id')`
	*/
	equals(obj) {
		if (obj === null || typeof obj === 'undefined') return false
		if (this === obj) return true
		if (typeof obj !== typeof this) return false
		if (obj.get('id') === this.get('id')) return true
		return false
	}
}

export default DataModel
export { DataModel }
