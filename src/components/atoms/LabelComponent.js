import dom from '../../DOM.js'

import TextComponent from './TextComponent.js'

/**
LabelComponent displays a single line of text
*/
const LabelComponent = class extends TextComponent {
	/**
	@param {DataObject} [dataObject=null]
	@param {Object} [options=null]
	*/
	constructor(dataObject = null, options = {}) {
		super(
			dataObject,
			Object.assign(
				{ dom: dom.label() },
				options
			)
		)
		this.addClass('label-component')
		this.setName('LabelComponent')
	}
}

export default LabelComponent
export { LabelComponent }
