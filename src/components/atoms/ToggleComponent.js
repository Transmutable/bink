import dom from '../../DOM.js'
import Component from '../../Component.js'

import ImageComponent from './ImageComponent.js'

/**
ToggleComponent shows a triangle and represents an open or closed state.
The user can change the toggle state by clicking the toggle.

@example
const component = new ToggleComponent()
component.listenTo(ToggleComponent.ToggleEvent, (eventName, toggleComponent, isOpen) => {
	console.log('Toggle is open', isOpen)
})

@todo Allow the use of different emoji or even images
*/
const ToggleComponent = class extends Component {
	/**
	@param {DataObject} [dataObject=null]
	@param {Object} [options=null]
	*/
	constructor(dataObject = null, options = {}) {
		super(
			dataObject,
			Object.assign(
				{
					dom: dom.div('◀'),
					name: 'ToggleComponent',
				},
				options
			)
		)
		this.addClass('toggle-component')
		this._opened = false

		this.listenTo('click', this.dom, (ev) => {
			this.toggle()
		})
	}

	/** @return {boolean} true if the toggle is open */
	get opened() {
		return this._opened
	}

	/**
	Sets the toggle open
	*/
	open() {
		if (this._opened) return
		this._opened = true
		this.addClass('open')
		this.trigger(ToggleComponent.ToggleEvent, this, this._opened)
	}

	/**
	Sets the toggle closed
	*/
	close() {
		if (this._opened === false) return
		this._opened = false
		this.removeClass('open')
		this.trigger(ToggleComponent.ToggleEvent, this, this._opened)
	}

	/**
	@param {boolean} open - whether the toggle should be open or not
	*/
	toggle(open) {
		if (typeof open === 'boolean') {
			if (open) {
				this.close()
			} else {
				this.open()
			}
			return
		}
		if (this._opened) {
			this.close()
		} else {
			this.open()
		}
	}
}

ToggleComponent.ToggleEvent = 'toggle-change-event'

export default ToggleComponent
export { ToggleComponent }
