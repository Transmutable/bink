import dom from '../../DOM.js'
import { lt, ld, ldt } from '../../Localizer.js'

import LabelComponent from '../atoms/LabelComponent.js'

/**
WaitComponent shows a spinner to reassure the user that a process is happening.

@todo Make this watch a DataObject and react to events like saving or fetching and update

@example
const waitComponent = new WaitComponent()
// at start of some process
waitComponent.state = WaitComponent.PROCESSING
// at successful end of some process
waitComponent.state = WaitComponent.SUCCEEDED
// or at successful end of some process
waitComponent.state = WaitComponent.FAILED
// or to reset to nothing happening
waitComponent.state = WaitComponent.NOTHING_HAPPENING

*/
const WaitComponent = class extends LabelComponent {
	/**
	@param {DataObject} [dataObject=null]
	@param {Object} [options=null]
	*/
	constructor(dataObject = null, options = {}) {
		super(dataObject, options)
		this.addClass('wait-component')
		this.setName('WaitComponent')

		this._state = WaitComponent.NOTHING_HAPPENING
		this._animationInterval = null
		this._animationIndex = 0

		this._updateDisplay()
	}

	/**
	Will be one of:

	- WaitComponent.NOTHING_HAPPENING
	- WaitComponent.PROCESSING
	- WaitComponent.FAILED
	- WaitComponent.SUCCEEDED

	@type {string}
	*/
	get state() {
		return this._state
	}

	/**
	Must be one of:

	- WaitComponent.NOTHING_HAPPENING
	- WaitComponent.PROCESSING
	- WaitComponent.FAILED
	- WaitComponent.SUCCEEDED

	@param {string} val
	*/
	set state(val) {
		if (this._state === val) return
		if (_states.includes(val) === false) {
			console.error('unknown state', val)
			return
		}
		this._state = val
		this._updateDisplay()
	}

	_startAnimation() {
		if (this._animationInterval !== null) return
		this._animationIndex = 0
		this._animationInterval = setInterval(() => {
			this.removeClass(..._animationClassNames)
			this.addClass(_animationClassNames[this._animationIndex])
			this._animationIndex = (this._animationIndex + 1) % _animationClassNames.length
		}, _animationTicks)
	}

	_stopAnimation() {
		if (this._animationInterval !== null) {
			clearInterval(this._animationInterval)
			this._animationInterval = null
		}
		this._animationIndex = 0
		this.removeClass(..._animationClassNames)
	}

	_updateDisplay() {
		switch (this._state) {
			case WaitComponent.NOTHING_HAPPENING:
				this._stopAnimation()
				this.removeClass('processing', 'failed', 'succeeded')
				this.addClass('nothing-happening')
				this.text = lt('')
				break
			case WaitComponent.PROCESSING:
				this._startAnimation()
				this.removeClass('nothing-happening', 'failed', 'succeeded')
				this.addClass('processing')
				this.text = lt('Processing...')
				break
			case WaitComponent.FAILED:
				this._stopAnimation()
				this.removeClass('nothing-happening', 'processing', 'succeeded')
				this.addClass('failed')
				this.text = lt('Failed')
				break
			case WaitComponent.SUCCEEDED:
				this._stopAnimation()
				this.removeClass('nothing-happening', 'processing', 'failed')
				this.addClass('succeeded')
				this.text = lt('Succeeded')
				break
		}
	}
}

WaitComponent.NOTHING_HAPPENING = 'nothing-happening'
WaitComponent.PROCESSING = 'processing'
WaitComponent.FAILED = 'failed'
WaitComponent.SUCCEEDED = 'succeeded'

const _animationTicks = 1500

const _animationClassNames = ['wait-top', 'wait-right', 'wait-bottom', 'wait-left']

const _states = [
	WaitComponent.NOTHING_HAPPENING,
	WaitComponent.PROCESSING,
	WaitComponent.FAILED,
	WaitComponent.SUCCEEDED,
]

export default WaitComponent
export { WaitComponent }
