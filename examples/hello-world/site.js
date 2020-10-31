import { App } from '../../src/App.js'
import { lt } from '../../src/Localizer.js'
import { HeadingComponent } from '../../src/components/atoms/HeadingComponent.js'

class SplashApp extends App {
	constructor(options={}) {
		super(options)
		this._headingComponent = new HeadingComponent(undefined, {
			text: lt('Hello, world')
		}).appendTo(this)
	}
}

function init() {
	const app = new SplashApp()
	window.document.body.innerHTML = ''
	window.document.body.appendChild(app.dom)
}
init()
