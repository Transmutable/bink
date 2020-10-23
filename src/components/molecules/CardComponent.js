import dom from '../../DOM.js'
import Component from '../../Component.js'

import LabelComponent from '../atoms/LabelComponent.js'
import HeadingComponent from '../atoms/HeadingComponent.js'

/**
CardComponent contains a list of Audio-, Video-, or Image- Components and a caption LabelComponent
*/
const CardComponent = class extends Component {
	/**
	@param {Object} [options]
	@param {string} [options.titleField=title]
	@param {string} [options.captionField=caption]
	*/
	constructor(dataObject = null, options = {}) {
		super(
			dataObject,
			Object.assign(
				{
					titleField: 'title',
					captionField: 'caption',
				},
				options
			)
		)
		this.addClass('card-component')
		this.setName('CardComponent')

		/** the main content, like an image or video */
		this._mainComponent = new Component().appendTo(this)
		this._mainComponent.addClass('main-component')
		this._mainComponent.setName('MainComponent')

		this._titleComponent = new HeadingComponent(dataObject, {
			textField: this.options.titleField,
		})
			.appendTo(this)
			.addClass('card-title-component')
			.setName('CardTitleComponent')

		this._captionComponent = new LabelComponent(dataObject, {
			textField: this.options.captionField,
		})
			.appendTo(this)
			.addClass('card-caption-component')
			.setName('CardCaptionComponent')
	}

	/** the {@link Component} in which we display the main content, like an image or video */
	get mainComponent() {
		return this._mainComponent
	}

	get titleComponent() {
		return this._titleComponent
	}
	get captionComponent() {
		return this._captionComponent
	}
}

export default CardComponent
export { CardComponent }
