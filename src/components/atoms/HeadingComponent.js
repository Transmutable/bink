import dom from '../../DOM.js'

import TextComponent from '../atoms/TextComponent.js'

/**
HeadingComponent represents a title or heading made up only of text.
*/
const HeadingComponent = class extends TextComponent {
	/**
	@param {DataObject} dataObject
	@param {Object} options see the {@link TextComponent} options
	*/
	constructor(dataObject = null, options = {}) {
		super(dataObject, Object.assign({ dom: dom.h1() }, options))
		this.addClass('heading-component')
		this.setName('HeadingComponent')
	}
}

export default HeadingComponent
export { HeadingComponent }
