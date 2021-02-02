// Usually these would be imported from an npm package but for this demo they're locally loaded
import { App } from '../../src/App.js'
import { lt } from '../../src/Localizer.js'
import { HeadingComponent } from '../../src/components/atoms/HeadingComponent.js'

/*
App instances run the entire single page app by orchestrating DataObjects and Components.

This App simply loads a single HeadingComponent that reads a static string: "Hello, world".
*/
class SplashApp extends App {
	constructor(options={}) {
		super(options)

		// A Component renders something to the DOM, in this case an 'h1' element
		this._headingComponent = new HeadingComponent(undefined, {
			text: lt('Hello, world')
		}).appendTo(this)

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
