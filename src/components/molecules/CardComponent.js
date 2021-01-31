import dom from '../../DOM.js'
import Component from '../../Component.js'

import LabelComponent from '../atoms/LabelComponent.js'
import HeadingComponent from '../atoms/HeadingComponent.js'

/**
CardComponent displays a piece of content like an image or video along with its title and caption.

This is often used in a {@link CollectionComponent} or a {@link MediaGridComponent} to display a collection of cards.

{@link ImageCardComponent} is an example of extending `CardComponent` for a specific media type.

The three child `Component`s are available via getters for `mainComponent`, `titleComponent`, and `captionComponent`.

@example
const model = new DataModel({
	name: 'Pimsler Particle',
	description: 'This can decrease the distance between molecules.',
	image: '/static/image.jpeg'
})
const cardComponent = new CardComponent(
	model,
	{ titleField: 'name', captionField: 'description' }
)
// Add an image as an example (though we'd really use ImageCardComponent for this)
cardComponent.mainComponent.appendComponent(
	new ImageComponent(
		model,
		{ dataField: 'image' }
	)
)

*/
const CardComponent = class extends Component {
	/**
	@param {Object} [options]
	@param {string} [options.title=null]
	@param {string} [options.titleField=title]
	@param {string} [options.captionField=caption]
	*/
	constructor(dataObject = null, options = {}) {
		super(
			dataObject,
			Object.assign(
				{
					title: null,
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
			text: this.options.title,
			dataField: this.options.titleField,
		})
			.appendTo(this)
			.addClass('card-title-component')
			.setName('CardTitleComponent')

		this._captionComponent = new LabelComponent(dataObject, {
			dataField: this.options.captionField,
		})
			.appendTo(this)
			.addClass('card-caption-component')
			.setName('CardCaptionComponent')
	}

	/**
	The {@link Component} in which we display the main content, like an image or video
	@type {Component}
	*/
	get mainComponent() {
		return this._mainComponent
	}

	/**
	The {@link Component} in which we display the title of the card
	@type {Component}
	*/
	get titleComponent() {
		return this._titleComponent
	}

	/**
	The {@link Component} in which we display the caption of the card
	@type {Component}
	*/
	get captionComponent() {
		return this._captionComponent
	}
}

export default CardComponent
export { CardComponent }
