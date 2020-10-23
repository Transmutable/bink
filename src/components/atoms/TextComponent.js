import dom from '../../DOM.js'
import Component from '../../Component.js'

/**
TextComponent holds a string which may include paragraphs but not other media.
*/
const TextComponent = class extends Component {
	/**
	@param {Object} [options={}] see the {@link Component} options
	@param {string} [options.text=''] the initial text shown in the heading
	@param {string} [options.textField=null] a field in the dataObject to bind to as the text
	@param {function} [options.textFieldFormatter=null] a function that takes in a textField value and returns a string
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
		if (this.dataObject && typeof this.options.textField === 'string') {
			this.listenTo(`changed:${this.options.textField}`, this.dataObject, this._updateTextFromData)
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
		this._updateDisplayFromText()
		this.dom.innerText = this._text
	}

	_updateTextFromData() {
		if (!this.dataObject || !this.options.textField) return
		if (this.options.textFieldFormatter) {
			this.text = this.options.textFieldFormatter(this.dataObject.get(this.options.textField) || '')
		} else {
			this.text = this.dataObject.get(this.options.textField) || ''
		}
	}
}

export default TextComponent
