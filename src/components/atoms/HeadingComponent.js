import dom from '../../DOM.js'

import TextComponent from '../atoms/TextComponent.js'

/**
HeadingComponent represents a title or heading made up only of text.

@example <caption>Use static text</caption>
const headingComponent = new HeadingComponent(undefined, {
	text: 'Welcome to Bink'
})

@example <caption>Use bound text</caption>
const headingComponent = new HeadingComponent(yourDataModel, {
	dataField: 'title'
})
*/
const HeadingComponent = class extends TextComponent {
	/**
	@param {DataObject} dataObject
	@param {Object} [options={}] See the {@link TextComponent.constructor} options, including dynamic text formatting.
	*/
	constructor(dataObject = null, options = {}) {
		super(dataObject, Object.assign({ dom: dom.h1() }, options))
		this.addClass('heading-component')
		this.setName('HeadingComponent')
	}
}

export default HeadingComponent
export { HeadingComponent }
