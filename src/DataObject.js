import EventHandler from './EventHandler.js'

/**
`DataObject` is the base class for DataModel and DataCollection.

It holds the event handling and the generic function of fetching data from a remote service
*/
const DataObject = class extends EventHandler {
	/**
	@param {Object} [options={}]
	*/
	constructor(options = {}) {
		super()
		this.options = options
		this._new = true // True until the first fetch returns, regardless of http status
		this.cleanedUp = false
	}

	/**
	@return {DataObject} returns `this` for easy chaining
	*/
	cleanup() {
		if (this.cleanedUp) return
		this.cleanedUp = true
		super.cleanup()
		return this
	}

	/** @type {boolean} true until a fetch (even a failed fetch) returns */
	get isNew() {
		return this._new
	}

	/** @type {string} the URL (relative or full) as a string for the endpoint used by this.fetch */
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

	/*
	If already reset, immediately call callback, otherwise wait until the first reset and then call callback
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

	By default the only fetch options is to set `credentials` to 'same-origin'

	@return {Object}
	*/
	get fetchOptions() {
		return {
			credentials: 'same-origin',
		}
	}

	/**
	Ask the server for data for this model or collection
	@return {Promise<DataObject, Error>}
	*/
	fetch() {
		return new Promise(
			function (resolve, reject) {
				this.trigger('fetching', this)
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
						this.trigger('fetched', this, data, null)
						resolve(this)
					})
					.catch((err) => {
						this._new = false
						this.trigger('fetched', this, null, err)
						reject(err)
					})
			}.bind(this)
		)
	}

	/**
	Use this to override the use of window.fetch
	For example, MockService overrides this to intercept fetch calls and return its own responses for matched endpoints
	*/
	_innerFetch(...params) {
		return fetch(...params)
	}

	/**
	Fetch each DataObject and then wait for them all to return
	Note: this resolves when the fetches complete, regardless of whether they succeed or fail.
	@param {Array<DataObject>} dataObjects
	@return {Promise<Array<DataObjects>,Error>}
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
	Tell the server to create (POST) or update (PUT) this model or collection
	@return {Promise<DataObject,Error>}
	*/
	save() {
		return new Promise(
			function (resolve, reject) {
				this.trigger('saving', this)
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
						this.trigger('saved', this, data, null)
						resolve(this)
					})
					.catch((err) => {
						this.trigger('saved', this, null, err)
						reject(err)
					})
			}.bind(this)
		)
	}

	/**
	@return {Promise<undefined,Error>}
	*/
	delete() {
		return new Promise(
			function (resolve, reject) {
				this.trigger('deleting', this)
				const options = Object.assign({}, this.fetchOptions)
				options.method = 'delete'
				this._innerFetch(this.url, options)
					.then((response) => {
						if (response.status != 200) {
							throw 'Delete failed with status ' + response.status
						}
						this.trigger('deleted', this, null)
						resolve()
					})
					.catch((err) => {
						this.trigger('deleted', this, err)
						reject(err)
					})
			}.bind(this)
		)
	}
}

DataObject._NO_CHANGE = Symbol('no change')

export default DataObject
