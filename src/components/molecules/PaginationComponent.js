import dom from '../../DOM.js'
import Component from '../../Component.js'
import { lt, ld, ldt } from '../../Localizer.js'

import TextComponent from '../atoms/TextComponent.js'
import LabelComponent from '../atoms/LabelComponent.js'

/**
PaginationComponent shows controls for moving forward and back in list or collection.const

@todo Make this watch a DataCollection or other DataObject that has a pagination interface and events

@example
const paginationComponent = new PaginationComponent(null, {
	totalCount: 10,
	currentIndex: 1
})

*/
const PaginationComponent = class extends Component {
	/**
	@param {DataObject} [dataObject=null]
	@param {Object} [options=null]
	@param {number} [options.totalCount=1]
	@param {number} [options.currentIndex=1]
	*/
	constructor(dataObject = null, options = {}) {
		super(
			dataObject,
			Object.assign(
				{
					totalCount: 1,
					currentIndex: 1,
				},
				options
			)
		)
		this.addClass('pagination-component')
		this.setName('PaginationComponent')

		this._totalCount = this.options.totalCount
		this._currentIndex = this.options.currentIndex

		this._leftArrow = new TextComponent(undefined, { text: lt('Left') })
			.appendTo(this)
			.addClass('left-arrow')
			.setName('LeftArrow')
		this.listenTo('click', this._leftArrow.dom, (ev) => {
			this.currentIndex = this.currentIndex - 1
		})

		this._statusLabel = new LabelComponent().appendTo(this)

		this._rightArrow = new TextComponent(undefined, { text: lt('Right') })
			.appendTo(this)
			.addClass('right-arrow')
			.setName('RightArrow')
		this.listenTo('click', this._rightArrow.dom, (ev) => {
			this.currentIndex = this.currentIndex + 1
		})
		this._updateDisplay()
	}

	/** @type {number} */
	get totalCount() {
		return this._totalCount
	}
	/** @param {number} val */
	set totalCount(val) {
		if (val === this._totalCount) return
		this._totalCount = val
		this._updateDisplay()
	}

	/** @type {number} */
	get currentIndex() {
		return this._currentIndex
	}
	/** @param {number} val */
	set currentIndex(val) {
		if (val === this._currentIndex) return
		if (val < 1 || val > this._totalCount) return
		this._currentIndex = val
		this._updateDisplay()
		this.trigger(PaginationComponent.CurrentIndexChanged, this._currentIndex, this._totalCount, this)
	}

	_updateDisplay() {
		this._statusLabel.text = this._currentIndex + '\n' + lt('of') + '\n' + this._totalCount
		if (this._currentIndex === 1) {
			this._leftArrow.addClass('disabled')
		} else {
			this._leftArrow.removeClass('disabled')
		}
		if (this._currentIndex === this._totalCount) {
			this._rightArrow.addClass('disabled')
		} else {
			this._rightArrow.removeClass('disabled')
		}
	}
}

PaginationComponent.CurrentIndexChanged = Symbol('current-index-changed')

export default PaginationComponent
export { PaginationComponent }
