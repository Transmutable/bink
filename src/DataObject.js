import EventHandler from './EventHandler.js'

/**
`DataObject` is the abstract base class for {@link DataModel} and {@link DataCollection}.

This holds the event handling and the generic function of fetching data from a remote service.
*/
const DataObject = class extends EventHandler {
	/**
	@param {Object} [options={}] Not used by DataObject but helpful for extending classes
	*/
	constructor(options = {}) {
		super()
		/** @type {Object<string,*>} */
		this.options = options
		this._new = true // True until the first fetch returns, regardless of http status
		/** True after {@link DataObject.cleanup} has been called. */
		this.cleanedUp = false
	}

	/**
	When models are no longer needed `cleanup` should be called to release resources like event listeners.

	@return {DataObject} returns `this` for easy chaining
	*/
	cleanup() {
		if (this.cleanedUp) return
		this.cleanedUp = true
		super.cleanup()
		return this
	}

	/**
	True until a fetch (even a failed fetch) returns	

	@return {boolean}
	*/
	get isNew() {
		return this._new
	}

	/**
	The URL (relative or full) as a string for the endpoint used by {@link DataObject.fetch}.
	@return {string} 
	*/
	get url() {
		throw new Error('Extending classes must implement url()')
	}

	/** Clear out old data and set it to data, should trigger a 'reset' event */
	reset(data = {}) {
		throw new Error('Extending classes must implement reset')
	}

	/** Extending classes can override this to parse the data received via a fetch */
	parse(data) {
		return data
	}

	/** Extending classes can override this to allow less strict equality */
	equals(obj) {
		return this === obj
	}

	/**
	If already reset, immediately call callback, otherwise wait until the first reset and then call callback

	@example
	class ExampleModel extends DataModel {
		get url() { return '/api/example' }
	}
	const model = new ExampleModel()
	model.onFirstReset((model) => { ... })
	model.fetch()
	// the callback passed to onFirstReset will be called when the fetch completes

	@param {func(dataObject: DataObject)} callback
	*/
	onFirstReset(callback) {
		if (this._new) {
			this.addListener(
				'reset',
				() => {
					callback(this)
				},
				true
			)
		} else {
			callback(this)
		}
	}
	/**
	Extending classes can override this to add headers, methods, etc to the fetch call

	By default the only fetch option set is `credentials: same-origin'.

	@return {Object}
	*/
	get fetchOptions() {
		return {
			credentials: 'same-origin',
		}
	}

	/**
	Ask the server for data for this model or collection.

	Depends on {@link DataObject.url}, {@link DataObject.parse} and {@link DataObject.reset}.

	@return {Promise<DataObject, Error>}
	*/
	fetch() {
		return new Promise(
			function (resolve, reject) {
				this.trigger(DataObject.FetchingEvent, this)
				this._innerFetch(this.url, this.fetchOptions)
					.then((response) => {
						if (response.status != 200) {
							throw 'Fetch failed with status ' + response.status
						}
						return response.json()
					})
					.then((data) => {
						data = this.parse(data)
						this._new = false
						this.reset(data)
						this.trigger(DataObject.FetchedEvent, this, data, null)
						resolve(this)
					})
					.catch((err) => {
						this._new = false
						this.trigger(DataObject.FetchedEvent, this, null, err)
						reject(err)
					})
			}.bind(this)
		)
	}

	/**
	This overrides the use of window.fetch, mostly during testing.

	For example, MockService overrides this to intercept fetch calls and return its own responses for matched endpoints
	*/
	_innerFetch(...params) {
		return fetch(...params)
	}

	/**
	Fetch each DataObject and then wait for them all to return

	This resolves when the fetches complete, regardless of whether they succeed or fail.

	@example
	this.model = new DataModel()
	this.collection = new DataCollection()
	DataObject.fetchAll(model, collection).then((mod, col) => { ... })

	@param {...DataObject} dataObjects
	@return {Promise<...DataObjects>,Error>}
	*/
	static fetchAll(...dataObjects) {
		const allAreFetched = () => {
			for (const dataObject of dataObjects) {
				if (dataObject.isNew) return false
			}
			return true
		}
		return new Promise((resolve, reject) => {
			if (allAreFetched()) {
				resolve(...dataObjects)
				return
			}
			for (const dataObject of dataObjects) {
				dataObject
					.fetch()
					.then(() => {
						if (allAreFetched()) resolve(...dataObjects)
					})
					.catch((err) => {
						if (allAreFetched()) resolve(...dataObjects)
					})
			}
		})
	}

	/**
	Tell the server to create (POST) or update (PUT) this model or collection.

	If {@link DataObject.isNew} is true it will POST, otherwise it will PUT.

	@return {Promise<DataObject,Error>}
	*/
	save() {
		return new Promise(
			function (resolve, reject) {
				this.trigger(DataObject.SavedEvent, this)
				const options = Object.assign({}, this.fetchOptions)
				if (this.isNew) {
					options.method = 'post'
				} else {
					options.method = 'put'
				}
				options.body = JSON.stringify(this.data)
				this._innerFetch(this.url, options)
					.then((response) => {
						if (response.status != 200) {
							throw 'Save failed with status ' + response.status
						}
						return response.json()
					})
					.then((data) => {
						data = this.parse(data)
						this.reset(data)
						this._new = false
						this.trigger(DataObject.SavedEvent, this, data, null)
						resolve(this)
					})
					.catch((err) => {
						this.trigger(DataObject.SavedEvent, this, null, err)
						reject(err)
					})
			}.bind(this)
		)
	}

	/**
	Call `DELETE` on this object's remote endpoint.

	@return {Promise<undefined,Error>}
	*/
	delete() {
		return new Promise(
			function (resolve, reject) {
				this.trigger(DataObject.DeletingEvent, this)
				const options = Object.assign({}, this.fetchOptions)
				options.method = 'delete'
				this._innerFetch(this.url, options)
					.then((response) => {
						if (response.status != 200) {
							throw 'Delete failed with status ' + response.status
						}
						this.trigger(DataObject.DeletedEvent, this, null)
						resolve()
					})
					.catch((err) => {
						this.trigger(DataObject.DeletedEvent, this, err)
						reject(err)
					})
			}.bind(this)
		)
	}
}

DataObject.FetchingEvent = Symbol('do-fetching')
DataObject.FetchedEvent = Symbol('do-fetched')
DataObject.SavedEvent = Symbol('do-saved')
DataObject.NoChangeEvent = Symbol('do-no-change')
DataObject.DeletingEvent = Symbol('no-deleting')
DataObject.DeletedEvent = Symbol('no-deleted')

export default DataObject
