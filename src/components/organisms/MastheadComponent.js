import dom from '../../DOM.js'

import Component from '../../Component.js'

import LabelComponent from '../atoms/LabelComponent.js'
import HeadingComponent from '../atoms/HeadingComponent.js'

import MenuComponent from '../molecules/MenuComponent.js'

/**
MastheadComponent contains:
- a brand Component
- a navigation MenuComponent

It's usually used at the top of a page to show the site brand and a navigation menu
*/
const MastheadComponent = class extends Component {
	/**
	@param {DataObject} [dataObject]
	@param {Object} options
	@param {string or Component} options.brand - the main title
	@param {string} options.brandAnchor - an activation URL for the brand 
	@param {Object[]} options.menuItems
	@param {string} options.menuItems.name
	@param {string} options.menuItems.anchor
	*/
	constructor(dataObject = null, options = {}) {
		super(
			dataObject,
			Object.assign(
				{
					brand: null,
					brandAnchor: null,
					menuItems: [],
				},
				options
			)
		)
		this.addClass('masthead-component')
		this.setName('MastheadComponent')

		if (this.options.brand instanceof Component) {
			this._brand = this.options.brand
		} else {
			const brandOptions = {}
			if (typeof this.options.brand === 'string') {
				brandOptions.text = this.options.brand
			}
			if (typeof this.options.brandAnchor === 'string') {
				// TODO replace activation anchor
				brandOptions.activationAnchor = this.options.brandAnchor
			}
			this._brand = new HeadingComponent(null, brandOptions)
		}
		this._brand.addClass('brand-component')
		this._brand.setName('BrandComponent')
		this.appendComponent(this._brand)

		this._navigationMenu = new MenuComponent().appendTo(this)
		if (this.options.menuItems) {
			for (const item of this.options.menuItems) {
				this._navigationMenu.appendMenuItem(
					new LabelComponent(
						null,
						{
							text: item.name,
							activationAnchor: item.anchor,
						},
						this.inheritedOptions
					)
				)
			}
		}
	}

	/** @type {NavigationMenu} */
	get navigationMenu() {
		return this._navigationMenu
	}
}

MastheadComponent.MODE_REQUEST_EVENT = 'mode-request'

export default MastheadComponent
export { MastheadComponent }
