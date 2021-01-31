import dom from './DOM.js'
import Router from './Router.js'
import Component from './Component.js'
import Localizer from './Localizer.js'
import EventHandler from './EventHandler.js'

/**
`App` contains the orchestration logic for the entirety of what is being displayed for a given app, including the app chrome like navigation.

App communicates these changes to {@link Component}s via events so that they may react.

The [hello-world example](https://github.com/Transmutable/bink/blob/main/examples/hello-world/site.js) has the most basic App and the [components example](https://github.com/Transmutable/bink/blob/main/examples/components/site.js) is more complex.

@example <caption>Set up a basic user administration page</caption>
import { AdminApp } from '{some path}/App.js'
import { UpdateBioComponent } from './UpdateBioComponent.js'
import { ResetPasswordComponent } from './ResetPasswordComponent.js'
import { UpdatePortraitComponent } from './UpdatePortraitComponent.js'
import { UserModel } from './UserModel.js'

class AdminApp extends App {
	constructor(){
		// Get user model (see DataObject, DataModel, and DataCollection docs)
		this.dataObject = new UserModel()
		this.dataObject.fetch().catch(err => { ... handle error ... })

		// Set up the masthead
		this._masthead = new MastheadComponent(
			undefined,
			{
				brand: 'Your Brand',
				brandAnchor: '/',
				menuItems: [
					{ name: 'Bio', anchor: '#' },
					{ name: 'Password', anchor: '#password' },
					{ name: 'Portrait', anchor: '#portrait' }
				]
			}	
		).appendTo(this)

		// Set up three sub-views with Components (see Component docs)
		this._bioComponent = new UpdateBioComponent(this.dataObject).appendTo(this)
		this._passwordComponent = new ResetPasswordComponent(this.dataObject).appendTo(this)
		this._portraitComponent = new UpdatePortraitComponent(this.dataObject).appendTo(this)

		// Set up the Router (see Router docs)
		this._router = new Router()
		this._router.addRoute(/^$/, 'default')
		this._router.addRoute(/^password$/, 'password')
		this._router.addRoute(/^portait$/, 'portrait')
		router.addListener('blog-app', (routeName) => {
			switch (routeName) {
				case 'default':
					this._bioComponent.show()
					this._passwordComponent.hide()
					this._portraitComponent.hide()
					break
				case 'password':
					this._bioComponent.hide()
					this._passwordComponent.show()
					this._portraitComponent.hide()
					break
				case 'portrait'
					this._bioComponent.hide()
					this._passwordComponent.hide()
					this._portraitComponent.show()
					break
			}
		})
	}	
}

*/
const App = class extends EventHandler {
	/**
	@param {Object} [options={}]
	@param {HTMLElement} [options.dom=div]
	*/
	constructor(options = {}) {
		super()
		this._options = options
		this._router = new Router()

		this._dom = this._options.dom || dom.div()
		this._dom.addClass('app')
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
	Adds the childComponent's `dom` to this Component's `dom`.

	@param {Component} childComponent
	@return {App} - this App, handy for chaining
	*/
	appendComponent(childComponent) {
		this._dom.appendChild(childComponent.dom)
		return this
	}

	/**
	Removes the childComponent's `dom` from this Component's `dom`.

	@param {Component} childComponent
	@return {App} - this App, handy for chaining
	*/
	removeComponent(childComponent) {
		this._dom.removeChild(childComponent.dom)
		return this
	}

	/**
	@param {boolean} shouldGather - true if the {@link Localizer} should be tracking translations
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
