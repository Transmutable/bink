import dom from '../../DOM.js'
import { lt, ld, ldt } from '../../Localizer.js'

import Component from '../../Component.js'

import AudioComponent from '../atoms/AudioComponent.js'
import ButtonComponent from '../atoms/ButtonComponent.js'

/**
AudioPlayerComponent shows an {@link AudioComponent} along with play/pause controls.

@todo Add an optional progress component
@todo Make this reactive to a DataModel

@example
new AudioPlayerComponent(undefined, { audio: '/static/audio.wav' })
*/
const AudioPlayerComponent = class extends Component {
	/**
	@param {DataObject} [dataObject=null]
	@param {Object} [options=null]
	@param {string} [options.audio=null] - a URL to an audio file
	@param {HTMLElement} [options.audioDOM=null] - an HTML `audio` element to use as a source
	*/
	constructor(dataObject = null, options = {}) {
		super(dataObject, options)
		this.addClass('audio-player-component')
		this.setName('AudioPlayerComponent')
		this._updateDisplay = this._updateDisplay.bind(this)

		this._audioComponent = new AudioComponent(this.dataObject, {
			audio: this.options.audio,
			audioDOM: this.options.audioDOM,
		}).appendTo(this)

		this._toggleButton = new ButtonComponent()
			.appendTo(this)
			.addClass('toggle-button-component')
			.setName('ToggleButtonComponent')
		this.listenTo('click', this._toggleButton.dom, (eventName, active) => {
			if (active === false) return
			if (this.audio.paused) {
				this.audio.play()
			} else {
				this.audio.pause()
			}
		})

		this.listenTo('playing', this.audio, this._updateDisplay)
		this.listenTo('pause', this.audio, this._updateDisplay)
		this.listenTo('ended', this.audio, this._updateDisplay)
		this.listenTo('emptied', this.audio, this._updateDisplay)

		this._updateDisplay()
	}

	get audio() {
		return this._audioComponent.audio
	}

	_updateDisplay() {
		if (this.audio.paused) {
			this._toggleButton.text = lt('Play')
		} else {
			this._toggleButton.text = lt('Pause')
		}
	}
}

export default AudioPlayerComponent
export { AudioPlayerComponent }
