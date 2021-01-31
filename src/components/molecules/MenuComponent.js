import dom from '../../DOM.js'
import Component from '../../Component.js'

import ToggleComponent from '../atoms/ToggleComponent.js'

/**
MenuComponent holds a set of menu item {@link Component}s and a {@link ToggleComponent} to show and hide the menu.

This class is often used as a base class and in the extending constructor it loads its menu items but it's also possible to use it directly (see below).

@example <caption>Directly create a three item menu</caption>
const menuComponent = new MenuComponent()
menuComponent.appendMenuItem(new MyMenuItemComponent(...))
menuComponent.appendMenuItem(new MyMenuItemComponent(...))
menuComponent.appendMenuItem(new MyMenuItemComponent(...))

menuComponent.addListener(MenuComponent.SelectedEvent, (eventName, menuComponent, selectedIndex) => {
	const menuItemComponent = menuComponent.menuItems[selectedIndex]
})

menuComponent.addListener(ToggleComponent.ToggleEvent, (eventName, menuComponent, isOpen) => {
	// react to the change here
})

*/
const MenuComponent = class extends Component {
	/**
	@param {DataModel} [dataObject=null]
	@param {Object} [options=null]
	*/
	constructor(dataObject = null, options = {}) {
		super(dataObject, options)
		this.addClass('menu-component')
		this.setName('MenuComponent')

		this._selectedIndex = -1
		this._menuItems = []

		this._toggleComponent = new ToggleComponent().appendTo(this)
		this.listenTo(ToggleComponent.ToggleEvent, this._toggleComponent, (eventName, toggleComponent, opened) => {
			if (opened) {
				this.addClass('open')
			} else {
				this.removeClass('open')
			}
			this.trigger(ToggleComponent.ToggleEvent, this, this._toggleComponent.opened)
		})

		/* terrible hack to prevent selection of the toggle, but the user-select CSS is non-standard and needs browser prefixes 😢 */
		this.dom.setAttribute('onselectstart', 'return false;')

		this._menuItemsComponent = new Component()
			.appendTo(this)
			.addClass('menu-items-component')
			.setName('MenuItemsComponent')
	}

	/**
	@type {ToggleComponent}
	*/
	get toggleComponent() {
		return this._toggleComponent
	}

	/**
	@type {Component[]}
	*/
	get menuItems() {
		return this._menuItems
	}

	/**
	@type {number}
	*/
	get selectedIndex() {
		return this._selectedIndex
	}

	/**
	@param {number} index the index of the menu item to set selected
	*/
	set selectedIndex(index) {
		if (!this._menuItems[index]) {
			console.error('no such menu index', index)
			return
		}
		if (this._selectedIndex === index) return
		this._selectedIndex = index
		this._updateSelectionDisplay()
		this.trigger(MenuComponent.SelectedEvent, this, this._selectedIndex)
	}

	/**
	@type {boolean} true if the toggle component is open
	*/
	get opened() {
		return this._toggleComponent.opened
	}

	/**
	Open the toggle component
	*/
	open() {
		this._toggleComponent.open()
	}

	/**
	Close the toggle component
	*/
	close() {
		this._toggleComponent.close()
	}

	/**
	Toggle the toggle component open or closed

	@param {boolean} open
	*/
	toggle(open) {
		this._toggleComponent.toggle(open)
	}

	/**
	@param {Component} component - A menu item Component to add to the menu
	*/
	appendMenuItem(component) {
		this._menuItems.push(component)
		this._menuItemsComponent.appendComponent(component)
		component.addClass('menu-item')
		if (this._menuItems.length === 1) {
			this.selectedIndex = 0
		}
	}

	/**
	@param {number} index - the index of the menu item to toggle
	@param {boolean} visible - whether to show or hide the menu item
	*/
	toggleMenuItemVisibility(index, visible) {
		if (index < 0 || index >= this._menuItems.length) return
		if (visible) {
			this._menuItems[index].show()
		} else {
			this._menuItems[index].hide()
		}
	}

	_updateSelectionDisplay() {
		for (let i = 0; i < this._menuItems.length; i++) {
			if (i === this._selectedIndex) {
				this._menuItems[i].addClass('selected')
			} else {
				this._menuItems[i].removeClass('selected')
			}
		}
	}
}

MenuComponent.NavigatedEvent = 'menu-navigated'

export default MenuComponent
export { MenuComponent }
