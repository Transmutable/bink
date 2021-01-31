import dom from '../../DOM.js'

import Component from '../../Component.js'

/**
ProgressComponent tracks change of a process and displays a progress bar

@example <caption>Watch a DataModel's field</caption>
const progressComponent = new ProgressComponent(myDataModel, {
	dataField: 'completion'
})

@todo make it watch a field on the dataObject with a filter function that maps to 'starting'|'complete'|'failed'|[0,1]
*/
const ProgressComponent = class extends Component {
	/**
	@param {DataObject} [dataObject=null]
	@param {Object} [options=null]
	@param {number} [options.initialValue=0]
	@param {string} [options.dataField=null] - a DataModel field to track with this progress readout
	*/
	constructor(dataObject = null, options = {}) {
		super(
			dataObject,
			Object.assign(
				{
					initialValue: 0,
					dataField: null,
				},
				options
			)
		)
		this._updateFromData = this._updateFromData.bind(this)
		this.addClass('progress-component')
		this.setName('ProgressComponent')

		this._trackComponent = new Component(null, {}).appendTo(this).addClass('track-component').setName('TrackComponent')
		this._fillComponent = new Component(null, {})
			.appendTo(this._trackComponent)
			.addClass('fill-component')
			.setName('FillComponent')

		this._value = -1 // ranges from 0 to 1
		this.value = this.options.initialValue
		if (this.dataObject && this.options.dataField) {
			this.listenTo(`changed:${this.options.dataField}`, this.dataObject, this._updateFromData)
			this._updateFromData()
		}
	}

	/**
	value - float from 0 to 1
	*/
	get value() {
		return this._value
	}

	/**
	value - float from 0 to 1
	*/
	set value(val) {
		val = parseFloat(val)
		if (Number.isNaN(val)) return
		if (val < 0) val = 0
		if (val > 1) val = 1
		if (this._value === val) return
		this._value = val
		this._updateDisplay()
	}

	_updateFromData() {
		if (!this.dataObject || !this.options.dataField) return
		this.value = this.dataObject.get(this.options.dataField, 0)
	}

	_updateDisplay() {
		this._fillComponent.dom.style['width'] = this.value * 100 + '%'
	}
}

export default ProgressComponent
export { ProgressComponent }
