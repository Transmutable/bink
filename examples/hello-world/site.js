// Usually these would be imported from an npm package but for this demo they're locally loaded
import { App } from '../../src/App.js'
import { lt } from '../../src/Localizer.js'
import { ButtonComponent } from '../../src/components/atoms/ButtonComponent.js'
import { HeadingComponent } from '../../src/components/atoms/HeadingComponent.js'

/*
Component instances are responsible for a fragment of the DOM, listening to input events, and reacting to model changes.

This Component simply asks to be clicked and then changes its message when that happens.
*/
class ClickMeButton extends ButtonComponent {
	constructor(dataObject=null, options={}) {
		super(dataObject, Object.assign({
			text: lt('Click me') // `lt` is the `Localizer` translation method
		}, options))

		// Add to the existing `class` attribute on `this.dom`. This is good practice but still optional.
		this.addClass('click-me-button-component')

		// Setting the name sets `this.dom.data[name]` for use during debugging. This is optional but handy.
		this.setName('ClickMeButtonComponent')

		// ButtonComponent has an event type, ActivatedEvent that we listen to
		this.listenTo(ButtonComponent.ActivatedEvent, this, (eventName) => {
			this.text = lt('You Clicked Me')
		})
		// Because we used `this.listenTo` the event listener will be automatically cleaned up when `Component.cleanup` is called.
	}
}

/*
App instances run the entire single page app by orchestrating DataObjects and Components.

This App simply loads a single HeadingComponent and the ClickMeButton from above
*/
class SplashApp extends App {
	constructor(options={}) {
		super(options)

		// A Component renders something to the DOM, in this case an 'h1' element
		this._headingComponent = new HeadingComponent(undefined, {
			text: lt('Hello, world')
		}).appendTo(this)

		this._clickMeButton = new ClickMeButton().appendTo(this)
	}
}

// Since this is the JS loaded by the page, here is where we initialize the App:
function init() {
	// Create the app
	const app = new SplashApp()

	// Clear the loading message
	window.document.body.innerHTML = ''

	// Add the app to the document
	window.document.body.appendChild(app.dom)
}
init()
