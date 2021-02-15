import dom from '../../DOM.js'
import Component from '../../Component.js'

import CardComponent from '../molecules/CardComponent.js'
import CollectionComponent from './CollectionComponent.js'

/**
MediaGridComponent creates a CSS grid of {@link CardComponent}s like {@link ImageCardComponent} or custom components that you make for other media like videos, audio tracks, etc.

It uses a {@link CollectionComponent} with the `itemComponent` option set to a {@link CardComponent} like {@link ImageCardComponent}.

@todo Support pagination once 'CollectionComponent' supports it

@example
const dataCollection = new DataCollection(...snip...)
const mediaGridComponent = new MediaGridComponent(dataCollection, {
	itemComponent: ImageCardComponent,
	itemOptions: { someKey: 'someValue' }
})

*/
const MediaGridComponent = class extends Component {
	/**
	@param {DataCollection} dataObject
	@param {Object} [options={}]
	@param {Component} [options.itemComponent=CardComponent] the options object to pass to the item class constructor
	@param {Object} [options.itemOptions={}] the Component **class** used for each item in the DataCollection
	*/
	constructor(dataObject = null, options = {}) {
		super(
			dataObject,
			Object.assign(
				{
					itemOptions: {},
					itemComponent: CardComponent,
				},
				options
			)
		)
		this.addClass('media-grid-component')
		this.setName('MediaGridComponent')

		this._collectionComponent = new CollectionComponent(dataObject, {
			itemComponent: this.options.itemComponent,
			itemOptions: this.options.itemOptions,
			onClick: this.options.onClick,
		}).appendTo(this)
	}
}

export default MediaGridComponent
export { MediaGridComponent }
