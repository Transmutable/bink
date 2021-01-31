import dom from '../../DOM.js'
import Component from '../../Component.js'

/**
SwitchComponent gives the user the ability to flip a switch.
The switch may be on/off or momentary with push-to-break or push-to-make options.

@example <caption>Allow the user to change a boolean data field</caption>
const switchComponent = new SwitchComponent(myDataModel, {
	dataField: 'activated'
})

@todo Add a Bink event on switch change (DataModel 'changed:fieldName' events work, of course)
*/
const SwitchComponent = class extends Component {
	/**
	@param {DataObject} [dataObject=null]
	@param {Object} [options=null]
	@param {string} [options.dataField=null] - a field in dataObject that this switch should reflect and control
	*/
	constructor(dataObject = null, options = {}) {
		super(
			dataObject,
			Object.assign(
				{
					dataField: null,
				},
				options
			)
		)
		this.addClass('switch-component')
		this.setName('SwitchComponent')
		this._on = null

		this._handle = dom
			.div({
				class: 'handle',
			})
			.appendTo(this.dom)

		if (this.options.dataField && this.dataObject) {
			this.dataObject.onFirstReset(() => {
				this._updateFromData()
			})
		} else {
			this.on = true
		}

		this.listenTo('click', this.dom, (ev) => {
			this.on = !this.on
		})
	}

	get on() {
		return this._on
	}

	set on(value) {
		if (this._on === value) return
		this._on = value
		this._updateDisplay()
		if (this.dataObject && this.options.dataField) {
			this.dataObject.set(this.options.dataField, this._on)
		}
	}

	_updateFromData() {
		if (!this.dataObject || !this.options.dataField) return
		this._on = !!this.dataObject.get(this.options.dataField, false)
		this._updateDisplay()
	}

	_updateDisplay() {
		if (this._on) {
			this._handle.innerText = 1
			this.removeClass('off')
			this.addClass('on')
		} else {
			this._handle.innerText = 0
			this.addClass('off')
			this.removeClass('on')
		}
	}
}

export default SwitchComponent
export { SwitchComponent }
