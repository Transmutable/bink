import dom from '../../DOM.js'

import Component from '../../Component.js'

/**
ButtonComponent displays a button, natch.

@example
const buttonComponent = new ButtonComponent(undefined, {
	text: 'Click me'
})

// Read and set the text
buttonComponent.text // 'Click me'
buttonComponent.text = 'Do it'
buttonComponent.text // 'Do it'

// Listen for the button activation (This is usually what you want)
buttonComponent.addEventListener(ButtonComponent.ActivatedEvent, (eventName) => {
	console.log('Button was activated')
})

// Listen for changes to state (You usually want ButtonComponent.ActivatedEvent)
buttonComponent.addEventListener(ButtonComponent.ChangedEvent, (eventName, isDown) => {
	console.log('Button is pressed:', isDown)
})

*/
const ButtonComponent = class extends Component {
	/**
	@param {DataObject} [dataObject]
	@param {Object} [options]
	@param {string} [options.text='']
	*/
	constructor(dataObject = null, options = {}) {
		super(
			dataObject,
			Object.assign(
				{
					dom: dom.button({ class: 'button' }),
				},
				options
			)
		)
		this.addClass('button-component')
		this.setName('ButtonComponent')

		this._text = null
		this.text = this.options.text || ''

		this.listenTo('mousedown', this.dom, () => {
			this.trigger(ButtonComponent.ChangedEvent, true)
		})
		this.listenTo('mouseup', this.dom, () => {
			this.trigger(ButtonComponent.ChangedEvent, false)
		})
		this.listenTo('click', this.dom, () => {
			this.trigger(ButtonComponent.ActivatedEvent)
		})
	}

	/** @type {string} */
	get text() {
		return this._text
	}

	/** @param {string} value */
	set text(value) {
		if (value === this._text) return
		this._text = value
		this.dom.innerText = this._text
	}
}
ButtonComponent.ChangedEvent = Symbol('button-changed') // Called for mouseup and mousedown
ButtonComponent.ActivatedEvent = Symbol('button-activated') // Called on click

export default ButtonComponent
export { ButtonComponent }
