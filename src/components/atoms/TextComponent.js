import dom from '../../DOM.js'
import Component from '../../Component.js'

/**
TextComponent holds a string which may include paragraphs but not other media.

@example <caption>Show static text</caption>
const textComponent = new TextComponent(undefined, {
	text: 'Static text goes here'
})

@example <caption>Show dynamically bound text</caption>
const textComponent = new TextComponent(myDataModel, {
	dataField: 'title'
})

@example <caption>Show dynamically bound and formatted text</caption>
// Displays either 'Is active' or 'Is not active', depending on the data field
const textComponent = new TextComponent(myDataModel, {
	dataField: 'isActive', // a boolean field
	dataFieldFormatter: (value) => { return value === true ? 'Is active' : 'Is not active' }
})

*/
const TextComponent = class extends Component {
	/**
	@param {Object} [options={}] see the {@link Component} options
	@param {string} [options.text=''] the initial text shown in the heading
	@param {string} [options.dataField=null] a field in the dataObject to bind to as the text
	@param {function} [options.dataFieldFormatter=null] a function that takes in a dataField value and returns a string
	*/
	constructor(dataObject = null, options = {}) {
		super(dataObject, options)
		this.addClass('text-component')
		this.setName('TextComponent')
		this._updateTextFromData = this._updateTextFromData.bind(this)

		this._text = ''

		if (typeof this.options.text === 'string') {
			this.text = this.options.text
		}
		if (this.dataObject && typeof this.options.dataField === 'string') {
			this.listenTo(`changed:${this.options.dataField}`, this.dataObject, this._updateTextFromData)
			this._updateTextFromData()
		}
	}

	/** @type {string} */
	get text() {
		return this._text
	}
	/** @type {string} */
	set text(value) {
		if (this._text === value) return
		this._text = value || ''
		this.dom.innerText = this._text
	}

	_updateTextFromData() {
		if (!this.dataObject || !this.options.dataField) return
		if (this.options.dataFieldFormatter) {
			this.text = this.options.dataFieldFormatter(this.dataObject.get(this.options.dataField) || '')
		} else {
			this.text = this.dataObject.get(this.options.dataField) || ''
		}
	}
}

export default TextComponent
export { TextComponent }
