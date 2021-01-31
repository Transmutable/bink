import dom from '../../DOM.js'

import Component from '../../Component.js'

/**
MultiComponent holds a set of {@link Component}s and shows one at a time.

@example
const multiComponent = new MultiComponent(undefined, {
	components: [
		new EditProfileComponent(...),
		new EditEmailComponent(...),
		new EditBioComponent(...)
	]
})
// Now multiComponent is showing just the first component, EditProfileComponent
multiComponent.showAt(1) // Hide EditProfileComponent and show EditEmailComponent

*/
const MultiComponent = class extends Component {
	/**
	@param {DataObject} [dataObject=null]
	@param {Object} [options={}]
	@param {Component[]} [options.components=[]]
	*/
	constructor(dataObject = null, options = {}) {
		super(dataObject, Object.assign({ components: [] }, options))
		this.addClass('multi-component')
		this.setName('MultiComponent')

		this._components = this.options.components
		this._currentComponent = null

		if (this._components.length > 0) {
			this.showAt(0)
		}
	}

	get components() {
		return this._components
	}

	*[Symbol.iterator]() {
		for (const component of this._components) {
			yield component
		}
	}

	/**
	@param {number} index - The index in this.components of the Component to show
	*/
	showAt(index) {
		if (index < 0 || index >= this._components.length) return false
		if (this._currentComponent) this.removeComponent(this._currentComponent)
		this._currentComponent = this._components[index]
		this.appendComponent(this._currentComponent)
		return true
	}

	/**
	@param {Component} component - The component to show. It will be added to this.components if it isn't already in there
	*/
	show(component) {
		let index = this._components.indexOf(component)
		if (index === -1) {
			this._components.push(component)
			index = this._components.length - 1
		}
		this.showAt(index)
	}
}

export default MultiComponent
export { MultiComponent }
