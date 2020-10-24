import dom from './DOM.js'
import Router from './Router.js'
import Component from './Component.js'
import Localizer from './Localizer.js'
import EventHandler from './EventHandler.js'

/**
 * App contains the orchestration logic for the entirety of what is being displayed for a given app, including the app chrome like navigation.
 *
 * App communicates these changes to {@link Component}s via events so that they may react.
 */
const App = class extends EventHandler {
	/**
	@param {Object} [options] - not used by App but handy for extending classes	
	*/
	constructor(options = {}) {
		super()
		this._options = options
		this._router = new Router()

		this._dom = dom.div({ class: 'app' })
	}

	/** @type {Router} */
	get router() {
		return this._router
	}
	/** @type {HTMLElement} */
	get dom() {
		return this._dom
	}

	/**
	appendComponent adds the childComponent's dom to this Component's equivalent attributes.
	@param {Component} childComponent
	@return {App} - the component, handy for chaining
	*/
	appendComponent(childComponent) {
		this._dom.appendChild(childComponent.dom)
		return this
	}

	/**
	removeComponent removes the childComponent's DOM from this Component's equivalent attributes.
	@param {Component} childComponent
	@return {App} - the component, handy for chaining
	*/
	removeComponent(childComponent) {
		this._dom.removeChild(childComponent.dom)
		return this
	}

	/**
	@param {boolean} shouldGather - true if the localizer should be tracking translations
	@return {undefined}
	*/
	set localizerGathering(shouldGather) {
		Localizer.Singleton.gathering = shouldGather
	}

	/** @type {boolean} */
	get localizerGathering() {
		return Localizer.Singleton.gathering
	}

	/** @type {boolean} */
	get localizerGatheredData() {
		return Localizer.Singleton.gatheredData
	}
}

export default App
export { App }
