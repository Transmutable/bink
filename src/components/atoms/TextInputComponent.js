import dom from '../../DOM.js'
import Component from '../../Component.js'

/**
TextInputComponent shows the user a field or area in which to enter text.

@example <caption>Set `TextInputComponent.text` to user's input (no DataModel)</caption>
const component = new TextInputComponent(undefined, {
	text: 'Starting text',
	placeholder: 'Enter some text here' // Shown when no text had been entered
})
// Listen for text changes
component.listenTo(TextInputComponent.TextChangeEvent, (eventName, textValue) => {
	console.log('Text was input', textValue)
})

@example <caption>Bind text input to a DataModel field</caption>
const component = new TextInputComponent(myDataModel, {
	textField: 'biography',
	placeholder: 'Tell us who you are', // Shown when no text had been entered
	submitOnEnter: true
})
// Listen for text submission, usually by pressing the 'Enter' key
component.listenTo(TextInputComponent.TextSubmitEvent, (eventName, newValue) => {
	console.log('New text was submitted', newValue)
})

*/
const TextInputComponent = class extends Component {
	/**
	@param {string} [options.text=''] initial text
	@param {string} [options.dataField=''] a field on the dataObject on which to bind
	@param {string} [options.placeholder=''] text to show when the input is empty
	@param {bool} [options.submitOnEnter=true] trigger a submit event on `enter` keyUp event
	*/
	constructor(dataObject = null, options = {}) {
		super(
			dataObject,
			Object.assign(
				{
					text: '',
					placeholder: '',
					dom: dom.input({ type: 'text' }),
					name: 'TextInputComponent',
					submitOnEnter: true,
				},
				options
			)
		)
		this.addClass('text-input-component')
		this._handleModelChange = this._handleModelChange.bind(this)

		this._placeholderText = this.options.placeholder
		if (this._placeholderText) {
			this.dom.setAttribute('placeholder', this._placeholderText)
		}

		this._text = null
		this._shifted = false

		this.listenTo('input', this.dom, (ev) => {
			this.text = this.dom.value;
		})
		this.listenTo('keyup', this.dom, (ev) => {
			if (this.options.submitOnEnter && ev.keyCode === 13) {
				this.trigger(TextInputComponent.TextSubmitEvent, this._text)
				this.text = ''
			}
		})

		if (this.dataObject && this.options.dataField) {
			this.text = this.dataObject.get(this.options.dataField, '')
			this.listenTo(`changed:${this.options.dataField}`, this.dataObject, this._handleModelChange)
		} else {
			this.text = this.options.text
		}
		this.dom.value = this.text;
	}

	_handleModelChange() {
		this.text = this.dataObject.get(this.options.dataField, '')
	}

	get text() {
		return this._text
	}
	set text(value) {
		value = value || ''
		if (this._text === value) return
		this._text = value
		const usingPlaceholder = !this._text
		if (usingPlaceholder) {
			this.addClass('placeholder')
		} else {
			this.removeClass('placeholder')
		}
		this.value = this._text
		if (this.dataObject && this.options.dataField && this.dataObject.get(this.options.dataField) !== this._text) {
			this.dataObject.set(this.options.dataField, this._text)
		}
		this.trigger(TextInputComponent.TextChangeEvent, this._text)
	}
}
TextInputComponent.TextChangeEvent = 'text-input-change'
TextInputComponent.TextSubmitEvent = 'text-input-submit'

export default TextInputComponent
export { TextInputComponent }
