import dom from '../../DOM.js'

import TextComponent from './TextComponent.js'

/**
LinkComponent displays an `a` element containing static text or text that is bound to a field in the dataObject.

This class is meant to be used where you'd include an inline text link. See the {@link Component.constructor}'s `option.anchor` parameter if you want click events on a Component's DOM element to trigger navigation. 

@example <caption>Use static text</caption>
* const component = new LinkComponent(undefined, {
* 	text: 'Click me',
* 	url: '/some-other-page/'
* })

@example <caption>Use bound text</caption>
* const component = new LinkComponent(yourDataModel, {
* 	dataField: 'name',
* 	url: '#some-other-view'
* })

*/
const LinkComponent = class extends TextComponent {
	/**
	@param {DataObject} [dataObject=null]
	@param {Object} [options={}] See the {@link TextComponent.constructor} options, including dynamic text formatting.
	@param {string} [options.url=''] The URL to which the link should anchor. This can conflict with the `options.anchor` passed to Component.constructor.
	*/
	constructor(dataObject = null, options = {}) {
		super(dataObject, Object.assign({ dom: dom.a() }, options))
		this.addClass('link-component')
		this.setName('LinkComponent')
		this.dom.setAttribute('href', this.options.url || '')
	}
}

export default LinkComponent
export { LinkComponent }
