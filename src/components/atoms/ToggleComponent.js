import dom from '../../DOM.js'
import Component from '../../Component.js'

import ImageComponent from './ImageComponent.js'

/**
ToggleComponent shows a triangle and represents an open or closed state
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

	get opened() {
		return this._opened
	}

	open() {
		if (this._opened) return
		this._opened = true
		this.addClass('open')
		this.trigger(ToggleComponent.ToggleEvent, this._opened)
	}

	close() {
		if (this._opened === false) return
		this._opened = false
		this.removeClass('open')
		this.trigger(ToggleComponent.ToggleEvent, this._opened)
	}

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

ToggleComponent.ToggleEvent = Symbol('toggled')

export default ToggleComponent
export { ToggleComponent }
