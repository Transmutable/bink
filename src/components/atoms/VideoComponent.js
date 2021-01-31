import dom from '../../DOM.js'
import Component from '../../Component.js'
import { lt, ld, ldt } from '../../Localizer.js'

/**
VideoComponent displays a single video.

If you want to display controls, use {@link VideoPlayerComponent}.

@example
const component = new VideoComponent(undefined, {
	preview: '/static/preview-image.png',
	video: '/static/video.mp4',
	mimeType: 'video/mp4'
})

*/
const VideoComponent = class extends Component {
	/**
	@param {DataObject} [dataObject=null]
	@param {Object} [options={}]
	@param {string} [options.preview=null] the URL to a still image to show until the user plays the video
	@param {string} [options.video=null] - the URL to a video
	@param {string} [options.mimeType=null] - the mimeType for the video

	*/
	constructor(dataObject = null, options = {}) {
		super(
			dataObject,
			Object.assign(
				{
					preview: null,
					video: null,
					mimeType: null,
				},
				options
			)
		)
		this.addClass('video-component')
		this.setName('VideoComponent')
		this._handleVideoCanPlay = this._handleVideoCanPlay.bind(this)
		this._videoCanPlay = false // False until the video is loaded

		this._videoRequested = false // False until the video is asked to load or play
		this._source = null
		this._video = null

		this._heightScale = 0.01
		this._widthScale = null
		this._ratio = null
		this.resize(VideoComponent.RATIO_16x9)

		if (this.options.preview) {
			this._preview = dom.img({ src: this.options.preview }).appendTo(this.dom).addClass('preview')
		} else {
			this._preview = dom.span(lt('Click to play')).appendTo(this.dom).addClass('preview')
		}
		this.listenTo('click', this._preview, (ev) => {
			if (this._videoCanPlay === false) {
				this.loadVideo() // Will nop if already requested
				this.listenTo(
					VideoComponent.VideoCanPlayEvent,
					this,
					() => {
						this._video.play()
					},
					true
				)
			} else {
				this._video.play()
			}
		})
	}

	cleanup() {
		if (this._video) this._video.removeEventListener('canplay', this._handleVideoCanPlay, false)
	}

	get source() {
		return this._source
	}

	get video() {
		return this._video
	}

	get paused() {
		if (this._videoRequested === false) return true
		return this._video.paused
	}

	get currentTime() {
		if (this._videoRequested === false) return 0
		return this._video.currentTime
	}

	/**
	@val {float} the time at the current frame in seconds
	*/
	set currentTime(val) {
		if (this._videoRequested === false) return
		this._video.currentTime = val
	}

	/**
	@return {float} the total duration of the video in seconds or 0 if it isn't yet loaded
	*/
	get duration() {
		if (this._videoRequested === false) return 0
		return this._video.duration
	}

	/**
	Play the video, loading it if it isn't already.
	*/
	play() {
		if (this._videoRequested === false) this.loadVideo()
		this._video.play()
	}

	/**
	Pause the video, loading it if it isn't already.
	*/
	pause() {
		if (this._videoRequested === false) this.loadVideo()
		this._video.pause()
	}

	/**
	Call this to switch between playing and paused states.
	*/
	toggle() {
		if (this._videoRequested === false) this.loadVideo()
		if (this.paused) {
			this.play()
		} else {
			this.pause()
		}
	}

	/**
	Call this to start loading the video
	*/
	loadVideo() {
		if (this._videoRequested) return false
		this._videoRequested = true

		this._source = dom.source({
			src: this.options.video,
			type: this.options.mimeType,
		})
		this._video = dom.video(this._source)

		this.dom.removeChild(this._preview)
		this.dom.appendChild(this._video)

		this._video.crossOrigin = 'anonymous'
		this._video.addEventListener('canplay', this._handleVideoCanPlay, false)
		this._video.load()

		this.trigger(VideoComponent.VideoInitializedEvent, this)
		return true
	}

	/**
	Sets the attributes on the `video` HTMLElement.
	@param {string} url - the relative or full URL to the video
	@param {string} mimeType - a mime type like 'video/mp4'
	*/
	setSourceAttributes(url, mimeType) {
		this.options.video = url
		this.options.mimeType = mimeType
		if (this._videoRequested) {
			// the video elements are already created so reset video
			this._source.setAttribute('src', url)
			this._source.setAttribute('type', mimeType)
			this._video.load()
		}
	}

	_handleVideoCanPlay(ev) {
		const videoWidth = ev.target.videoWidth
		const videoHeight = ev.target.videoHeight
		if (videoWidth <= 0 || videoHeight <= 0) {
			console.error('Could not read the video dimensions', ev)
			return
		}
		this.resize(videoWidth / videoHeight)
		this._videoCanPlay = true
		this.trigger(VideoComponent.VideoCanPlayEvent, this)
	}

	resize(ratio) {
		this._ratio = ratio
		this._widthScale = this._heightScale * this._ratio
		// TODO resize
	}
}

VideoComponent.VideoCanPlayEvent = Symbol('vc-video-can-play')
VideoComponent.VideoInitializedEvent = Symbol('vc-video-component-initialized')

VideoComponent.RATIO_16x9 = 16 / 9
VideoComponent.RATIO_1x1 = 1

export default VideoComponent
export { VideoComponent }
