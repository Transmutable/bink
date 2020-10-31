import dom from '../../DOM.js'

import Component from '../../Component.js'

/**
ButtonComponent displays a button, natch.
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

		this._text = ''

		// TODO implement events
		this.text = this.options.text || ''
	}

	/**
	Shows a visible alert for a short time and plays an audio alert
	*/
	showAlert() {
		this.addClass('primary-alert')
		setTimeout(() => {
			this.removeClass('primary-alert')
		}, 1100) // TODO use a setting
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
ButtonComponent.ChangedEvent = 'button-changed'

export default ButtonComponent
export { ButtonComponent }
