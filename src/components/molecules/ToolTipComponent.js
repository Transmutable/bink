import dom from '../../DOM.js'
import Component from '../../Component.js'

import LabelComponent from '../atoms/LabelComponent.js'

/**
ToolTipComponent shows a Component next to another Component

If possible, it's better to use the [title](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/title) element attribute, but this is useful for tooltips with more than text.

@todo Replace the hacky 'X' close widget with something better

@example
const tipInfoComponent = new MyInfoComponent(...) // The tool tip info
const toolTipComponent = new ToolTipComponent(null, {
	component: tipInfoComponent
})

const targetComponent = new MyComponent(...) // The component which needs a tool tip

// On some user action, show the tool tip next to some Component
toolTipComponent.show(targetComponent)

*/
const ToolTipComponent = class extends Component {
	/**
	@param {DataObject} [dataObject=null]
	@param {Object} options
	@param {Component} options.component
	*/
	constructor(dataObject = null, options = {}) {
		super(dataObject, options)
		this.addClass('tool-tip-component')
		this.setName('ToolTipComponent')

		this._closeComponent = new LabelComponent(undefined, { text: 'X' }).appendTo(this)
		this._closeComponent.addClass('close-component')
		this.listenTo('click', this._closeComponent.dom, (ev) => {
			this.hide()
		})

		if (this.options.component) {
			options.component.addClass('info-component')
			this.appendComponent(this.options.component)
		}
	}

	/** @param {Component} target */
	show(target = null) {
		super.show()
		if (target === null) return
		this.dom.style.position = 'relative'
		this.dom.style.left = 0
		this.dom.style.top = 0
		const targetPosition = target.documentPosition()
		const position = this.documentPosition()
		this.dom.style.left = targetPosition[0] - position[0]
		this.dom.style.top = targetPosition[1] - position[1]
	}
}

export default ToolTipComponent
export { ToolTipComponent }
