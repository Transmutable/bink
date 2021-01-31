import EventHandler from './EventHandler.js'

/**
Router maps [`window.history`](https://developer.mozilla.org/en-US/docs/Web/API/Window/history) events and URL path fragments (the part after the `#` in https://example.com/path#one-two-three) to events.

This is usually used by an {@link App} to show and hide {@link Component}s based on the URL.

@example <caption>routing `/^blog\/([0-9]+)\/app\/([0-9a-z]+)$/` to an event with parameters for blog and app IDs</caption>
let router = new Router()

// Set up a couple of routes, each with a URL matching regexs and a route name

// matches http://<domain>/<path> and http://<domain>/<path>#
router.addRoute(/^$/, 'default')

// matches http://<domain>/<path>#blog/1123/app/abc-123
router.addRoute(/^blog\/([0-9]+)\/app\/([0-9a-z\-]+)$/, 'blog-app')

// Listen for the route
router.addListener('blog-app', (routeName, hash, ...regexMatches, ...parameters) => {
	// If this was an event triggered by routing to #blog/1123/app/abc-123 then:
	// `routeName` would be 'blog-app'
	// `hash` would be 'blog/1123/app/abc-123'
	// `regexMatches` would be ['1123', 'abc-123']
	// `parameters` is empty in this example but could be any number of extra items in the route (see `addRoute`)
})
*/
const Router = class extends EventHandler {
	constructor() {
		super()
		/** @type {boolean} */
		this.cleanedUp = false
		/** @type {Array<Router>} */
		this.routes = []
		this._checkHash = this._checkHash.bind(this)
		window.addEventListener('hashchange', this._checkHash, false)
	}
	cleanup() {
		if (this.cleanedUp) return
		this.cleanedUp = true
		window.removeEventListener('hashchange', this._checkHash)
		super.cleanup()
	}
	/**
	@param {RegExp} regex - The regular expression that matches the incoming hash changes
	@param {string} eventName - The event name used when triggering
	@param {...*} parameters - Parameters passed without modification to listeners after the event name and matches
	*/
	addRoute(regex, eventName, ...parameters) {
		const route = new Route(regex, eventName, ...parameters)
		this.routes.push(route)
		this.trigger(Router.RouteAddedEvent, this, route)
	}
	/**
	This must be called in order to start routing.
	*/
	start() {
		this._checkHash()
		this.trigger(Router.StartedRoutingEvent, this)
	}
	_checkHash() {
		this._handleNewPath(document.location.hash.slice(1))
	}
	_handleNewPath(path) {
		for (const route of this.routes) {
			const matches = route.matches(path)
			if (matches == null) {
				continue
			}
			this.trigger(route.eventName, ...matches, ...route.parameters)
			return
		}
		this.trigger(Router.UnknownRouteEvent, path)
	}
}

Router.RouteAddedEvent = 'route-added'
Router.StartedRoutingEvent = 'started-routing'
Router.UnknownRouteEvent = 'unknown-route'

/*
	Route tracks URL routes for {@link Router}
*/
const Route = class {
	constructor(regex, eventName, ...parameters) {
		this.regex = regex
		this.eventName = eventName
		this.parameters = parameters
	}
	/**
	@return {boolean} true if this route matches a given path
	*/
	matches(path) {
		return path.match(this.regex)
	}
}

export default Router
export { Router, Route }
