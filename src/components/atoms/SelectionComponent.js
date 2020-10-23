import dom from '../../DOM.js'
import Component from '../../Component.js'

import LabelComponent from './LabelComponent.js'
import ToggleComponent from './ToggleComponent.js'

/**
SelectionComponent offers the user a set of choices for single or multiple selection.
*/
const SelectionComponent = class extends Component {
	/**
	@param {Object} [options]
	@param {string[] | Array<{name {string}, value {string}}>} [options.items]
	*/
	constructor(dataObject = null, options = {}) {
		super(
			dataObject,
			Object.assign(
				{
					items: [],
					dom: dom.select(),
				},
				options
			)
		)
		this.addClass('selection-component')
		this.setName('SelectionComponent')

		// Normalize the items to all be [name, value]
		this.options.items = this.options.items.map((item) => {
			if (typeof item === 'string') return [item, item]
			return item
		})

		this.options.items.forEach((item, index) => {
			this.dom.appendChild(dom.option({ value: item[1] }, item[0]))
		})

		this.listenTo('input', this.dom, (ev) => {
			this.selectedIndex = this.dom.selectedIndex
		})
	}

	get selectedIndex() {
		return this.dom.selectedIndex
	}

	set selectedIndex(index) {
		if (index >= this.dom.children.length) {
			console.error('No such index', index)
			return
		}
		let changed = false
		if (this.dom.selectedIndex !== index) {
			changed = true
			this.dom.selectedIndex = index
		}
		if (changed) {
			this.trigger(SelectionComponent.SELECTION_INDEX_CHANGED, this.dom.selectedIndex)
		}
	}
}

class SelectionItemComponent extends LabelComponent {
	constructor(dataObject = null, options = {}) {
		super(dataObject, options)
		this.addClass('selection-item')
	}
}

SelectionComponent.SELECTION_INDEX_CHANGED = 'selection-index-changed'

export default SelectionComponent
export { SelectionComponent }
