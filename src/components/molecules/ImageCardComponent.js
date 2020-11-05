import ImageComponent from '../atoms/ImageComponent.js'

import CardComponent from './CardComponent.js'

/**
ImageCardComponent is a {@link CardComponent} that shows a single image and metadata.
It shows the image, an optional title, and an optional caption.
*/
const ImageCardComponent = class extends CardComponent {
	/**
	@param {Object} [options]
	@param {string} [options.image=null] a URL to an image
	@param {string} [options.imageField=null] the field name in the DataObject that holds the URL to an image
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
					imageField: 'image',
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
			imageField: this.options.imageField,
		}).appendTo(this.mainComponent)
	}
}

export default ImageCardComponent
export { ImageCardComponent }
