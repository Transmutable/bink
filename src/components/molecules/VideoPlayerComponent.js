import dom from '../../DOM.js'
import { lt, ld, ldt } from '../../Localizer.js'

import Component from '../../Component.js'

import VideoComponent from '../atoms/VideoComponent.js'
import ButtonComponent from '../atoms/ButtonComponent.js'
import SliderComponent from '../atoms/SliderComponent.js'

/**
VideoPlayerComponent shows a {@link VideoComponent} as well as play/pause and shuttle controls.
*/
const VideoPlayerComponent = class extends Component {
	/**
	@param {DataObject} [dataObject=null]
	@param {Object} [options=null]
	@param {string} [options.video=''] - a URL to a video
	@param {string} [options.mimeType=''] - the MIME type for the video, like 'video/mp4'
	*/
	constructor(dataObject = null, options = {}) {
		super(
			dataObject,
			Object.assign(
				{
					video: '',
					mimeType: ''
				},
				options
			)
		)
		this.addClass('video-player-component')
		this.setName('VideoPlayerComponent')
		this._updateDisplay = this._updateDisplay.bind(this)

		this._backdropComponent = new Component().appendTo(this)
		this._backdropComponent.addClass('backdrop-component')
		this._backdropComponent.setName('BackdropComponent')

		this._videoComponent = new VideoComponent(
			undefined,
			{
				video: this.options.video,
				mimeType: this.options.mimeType
			}
		).appendTo(this._backdropComponent)
		this.listenTo(VideoComponent.VIDEO_INITIALIZED, this._videoComponent, (eventName, component) => {
			this._addEventListeners()
		})

		this._controlsComponent = new Component(null, {}).appendTo(this)
		this._controlsComponent.addClass('video-player-controls')
		this._controlsComponent.setName('VideoPlayerControls')

		this._toggleButtonComponent = new ButtonComponent()
			.appendTo(this._controlsComponent)
			.addClass('toggle-button-component')
			.setName('ToggleButtonComponent')
		this.listenTo(
			'click',
			this._toggleButtonComponent.dom,
			(ev) => { this._videoComponent.toggle() }
		)

		this._sliderComponent = new SliderComponent().appendTo(this._controlsComponent)
		this.listenTo(SliderComponent.VALUE_CHANGE_VIA_INPUT, this._sliderComponent, (eventName, newFraction) => {
			this._videoComponent.currentTime = newFraction * Math.max(1, this._videoComponent.duration)
		})
		this._updateDisplay()
	}

	get video() {
		return this._videoComponent.video
	}

	/**
	@param {string} url - the relative or full URL to the video
	@param {string} mimeType - a mime type like 'video/mp4'
	*/
	setVideoSource(url, mimeType) {
		this._videoComponent.setSourceAttributes(url, mimeType)
	}

	_updateDisplay() {
		if (this._sliderComponent.userIsChanging === false) {
			if (this._videoComponent.currentTime === 0) {
				this._sliderComponent.valueFraction = 0
			} else {
				this._sliderComponent.valueFraction =
					Math.max(0, this._videoComponent.currentTime) /
					Math.max(1, this._videoComponent.duration, this._videoComponent.currentTime)
			}
		}
		if (this._videoComponent.paused) {
			this._toggleButtonComponent.text = lt('Play')
		} else {
			this._toggleButtonComponent.text = lt('Pause')
		}
	}

	_addEventListeners() {
		const video = this.video
		// TODO convert to listenTo
		video.addEventListener('playing', this._updateDisplay, false)
		video.addEventListener('play', this._updateDisplay, false)
		video.addEventListener('timeupdate', this._updateDisplay, false)
		video.addEventListener('pause', this._updateDisplay, false)
		video.addEventListener('ended', this._updateDisplay, false)
	}

	cleanup() {
		const video = this.video
		// TODO convert to listenTo
		video.removeEventListener('playing', this._updateDisplay, false)
		video.removeEventListener('play', this._updateDisplay, false)
		video.removeEventListener('timeupdate', this._updateDisplay, false)
		video.removeEventListener('pause', this._updateDisplay, false)
		video.removeEventListener('ended', this._updateDisplay, false)
	}
}

export default VideoPlayerComponent
export { VideoPlayerComponent }