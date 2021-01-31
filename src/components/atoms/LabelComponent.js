import dom from '../../DOM.js'

import TextComponent from './TextComponent.js'

/**
LabelComponent displays a single line of text

@example <caption>Use static text</caption>
const component = new LabelComponent(undefined, {
	text: 'Example'
})

@example <caption>Use bound text</caption>
const component = new LabelComponent(yourDataModel, {
	dataField: 'title'
})
*/
const LabelComponent = class extends TextComponent {
	/**
	@param {DataObject} [dataObject=null]
	@param {Object} [options={}] See the {@link TextComponent.constructor} options, including dynamic text formatting.
	*/
	constructor(dataObject = null, options = {}) {
		super(dataObject, Object.assign({ dom: dom.label() }, options))
		this.addClass('label-component')
		this.setName('LabelComponent')
	}
}

export default LabelComponent
export { LabelComponent }
