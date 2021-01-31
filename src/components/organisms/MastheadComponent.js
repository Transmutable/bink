import dom from '../../DOM.js'

import Component from '../../Component.js'

import LabelComponent from '../atoms/LabelComponent.js'
import HeadingComponent from '../atoms/HeadingComponent.js'

import MenuComponent from '../molecules/MenuComponent.js'

/**
MastheadComponent contains:
- a brand Component (a {@link HeadingComponent} by default)
- a navigation {@link MenuComponent}

This is usually placed at the top of a page to show the site brand and a navigation menu. Then a {@link Router} is used to respond to document.location changes.

@example
const mastheadComponent = new MastheadComponent(undefined, {
	brand: 'Bink', // 'brand' could also be a Component like an ImageComponent
	menuItems: [
		{ name: 'Home', anchor: '/' },
		{ name: 'About', anchor: '/#about' },
		{ name: 'Account', anchor: '/#account' },
	]
})
*/
const MastheadComponent = class extends Component {
	/**
	@param {DataObject} [dataObject=null]
	@param {Object} [options={}]
	@param {string or Component} options.brand - the main title
	@param {string} [options.brandAnchor="/"] - an activation URL for the brand HeadingComponent
	@param {Object[]} [options.menuItems=[]]
	@param {string} options.menuItems.name
	@param {string} options.menuItems.anchor
	*/
	constructor(dataObject = null, options = {}) {
		super(
			dataObject,
			Object.assign(
				{
					brand: null,
					brandAnchor: '/',
					menuItems: [],
				},
				options
			)
		)
		this.addClass('masthead-component')
		this.setName('MastheadComponent')

		if (this.options.brand instanceof Component) {
			this._brandComponent = this.options.brand
		} else {
			const brandOptions = {}
			if (typeof this.options.brand === 'string') {
				brandOptions.text = this.options.brand
			}
			if (typeof this.options.brandAnchor === 'string') {
				brandOptions.anchor = this.options.brandAnchor
			}
			this._brandComponent = new HeadingComponent(null, brandOptions)
		}
		this._brandComponent.addClass('brand-component')
		this._brandComponent.setName('BrandComponent')
		this.appendComponent(this._brandComponent)

		this._menuComponent = new MenuComponent().appendTo(this)
		if (this.options.menuItems) {
			for (const item of this.options.menuItems) {
				this._menuComponent.appendMenuItem(
					new LabelComponent(
						null,
						{
							text: item.name,
							anchor: item.anchor,
						},
						this.inheritedOptions
					)
				)
			}
		}
	}

	/** @type {Component} */
	get brandComponent() {
		return this._brandComponent
	}

	/** @type {MenuComponent} */
	get menuComponent() {
		return this._menuComponent
	}
}

export default MastheadComponent
export { MastheadComponent }
