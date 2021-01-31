import dom from '../../DOM.js'

import Component from '../../Component.js'

/**
ImageComponent handles the display of a single image.

@example <caption>Use a static URL</caption>
const component = new ImageComponent(undefined, {
	image: '/static/image.png'
})

@example <caption>Use a bound URL</caption>
const component = new ImageComponent(myDataModel, {
	dataField: 'image'
})
*/
const ImageComponent = class extends Component {
	/**
	@param {Object} options see the {@link Component} options
	@param {string} [options.image=null] the URL of an image
	@param {string} [options.dataField=null] the name of the field in dataObject that holds the URL to the image
	*/
	constructor(dataObject = null, options = {}) {
		super(
			dataObject,
			Object.assign(
				{
					image: null,
					dataField: null,
					dom: dom.img(),
				},
				options
			)
		)
		this.addClass('image-component')
		this.setName('ImageComponent')
		this._updateFromData = this._updateFromData.bind(this)

		this._imageURL = ''

		if (this.options.image) {
			this.imageURL = this.options.image
		}
		if (this.dataObject && this.options.dataField) {
			this.listenTo(`changed:${this.options.dataField}`, this.dataObject)
			this._updateFromData()
		}
	}

	/** @type {string} */
	get imageURL() {
		return this._imageURL
	}

	/** @param {string} value the image URL */
	set imageURL(value) {
		if (value === this._imageURL) return
		this._imageURL = value
		this.dom.src = this._imageURL
	}

	_updateFromData() {
		if (!this.dataObject || !this.options.dataField) return
		this.imageURL = this.dataObject.get(this.options.dataField, '')
	}
}

export default ImageComponent
export { ImageComponent }
