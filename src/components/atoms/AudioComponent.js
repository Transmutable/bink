import dom from '../../DOM.js'
import Component from '../../Component.js'

import ImageComponent from './ImageComponent.js'

/**
AudioComponent contains a sound source and shows an icon.

If you want to display controls, use {AudioPlayerComponent}.

@todo Actually display the icon

@example
const audioComponent = new AudioComponent(undefined, {
	audio: '/media/sound.wav'
})
*/
const AudioComponent = class extends Component {
	/**
	@param {DataObject} [dataObject]
	@param {Object} [options]
	@param {string} [options.audio=null] - a URL to an audio file
	@param {HTMLElement} [options.audioDOM=null] - an HTML `audio` element to use as a source
	*/
	constructor(dataObject = null, options = {}) {
		super(
			dataObject,
			Object.assign(
				{
					audio: null,
					audioDOM: null,
				},
				options
			)
		)
		this.addClass('audio-component')
		this.setName('AudioComponent')

		if (this.options.audioDOM) {
			this._audioDOM = this.options.audioDOM
		} else {
			this._audioDOM = dom.audio(
				dom.source({
					src: this.options.audio || '',
				})
			)
		}

		this._domImage = new ImageComponent(undefined, {
			// @TODO define an audio image
		}).appendTo(this)
		this._domImage.addClass('audio-image')
		this._domImage.setName('AudioImage')
	}

	/** @type {HTMLAudioElement} */
	get audio() {
		return this._audioDOM
	}
}

export default AudioComponent
export { AudioComponent }
