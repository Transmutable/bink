import ImageComponent from '../atoms/ImageComponent.js'

import CardComponent from './CardComponent.js'

/**
ImageCardComponent is a {@link CardComponent} extension that shows a single image and metadata.
It shows the image along with an optional title and caption from the `CardComponent`.

@example <caption>Use a DataModel to drive the image card.</caption>
const model = new DataModel({
	image: '//static/image.png',
	name: 'Great Image',
	description: 'You will love it'
})

const imageCardComponent = new ImageCardComponent(model, {
	dataField: 'image',
	titleField: 'name',
	captionField: 'description'
})
*/
export default class ImageCardComponent extends CardComponent {
	/**
	@param {DataModel} [dataObject=null]
	@param {Object} [options]
	@param {string} [options.image=null] a URL to an image
	@param {string} [options.dataField=null] the field name in the DataObject that holds the URL to an image
	@param {string} [options.title=null] a string to use as a title
	@param {string} [options.titleField] the field name in the DataObject that holds the title of the image
	@param {string} [options.captionField] the field name in the dataObject that holds the caption
	*/
	constructor(dataObject, options = {}) {
		super(
			dataObject,
			Object.assign(
				{
					image: null,
					dataField: 'image',
					title: null,
					titleField: 'title',
					captionField: 'caption',
				},
				options
			)
		)
		this.addClass('image-card-component')
		this.setName('ImageCardComponent')

		this._imageComponent = new ImageComponent(dataObject, {
			image: this.options.image,
			dataField: this.options.dataField,
		}).appendTo(this.mainComponent)
	}
}

export { ImageCardComponent }
