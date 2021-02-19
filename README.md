# Bink

[Bink](https://github.com/Transmutable/bink) is a sleek and reactive framework for Javascript-driven web pages.

It:
- Has no dependencies
- Is written in modern Javascript
- Can be taught in less than an hour
- Enables localization and internationalization
- Provides reactive components with data binding of data models and collections

Choose Bink when:

- Your web app is inherently dynamic
- You don't need to support retired browsers like IE
- You worry about the fragility of dependency trees
- You're unhappy with ever-moving targets like React
- Your implementation team knows Javascript
- Your leadership is comfortable working without social proof

Do not choose Bink when:

- You're making a web page that can be static
- You need to support IE and other retired browsers
- You can live with the fragility of dependency trees
- You're happy within churning ecosystems like React's
- Your implementation team needs markup abstractions like JSX
- Your leadership is rewarded for "[choosing IBM](https://en.wikipedia.org/wiki/Fear,_uncertainty,_and_doubt)".

## Overview of Bink

The [API docs](https://transmutable.github.io/bink/api/) have a lot of info and example code but in general: 

A web page's script element instantiates a Bink [`App`](https://transmutable.github.io/bink/api/class/src/App.js~App.html) that coordinates dynamic user interface elements made up of [`Component`](https://transmutable.github.io/bink/api/class/src/Component.js~Component.html)s that reactively update the DOM based on information and events in [`DataModel`](https://transmutable.github.io/bink/api/class/src/DataModel.js~DataModel.html)s and [`DataCollection`](https://transmutable.github.io/bink/api/class/src/DataCollection.js~DataCollection.html)s as well as events from user actions.

### Examples on Glitch

These examples are [in the repo](https://github.com/Transmutable/bink/tree/main/examples) but here they are as Glitch projects for immediate satisfaction. Glitch lets you view the code and then remix it with no fuss.

- [Hello, world](https://glitch.com/edit/#!/northern-tricky-brook) is a bare bones page but it does demonstrate a custom App and a custom Component.
- [Components](https://glitch.com/edit/#!/valiant-agate-acoustic) shows every [Component](https://transmutable.github.io/bink/api/class/src/Component.js~Component.html)s that is included with Bink and a bit more complex use of [App](https://transmutable.github.io/bink/api/class/src/App.js~App.html).

### A quick code sample from [Hello World](https://github.com/Transmutable/bink/tree/main/examples/hello-world)

Here's a small snippet of code to give you a flavor of Bink.


```javascript
/*
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
App instances run the entire single page app by coordinating DataObjects and Components.

This App simply loads a HeadingComponent and the custom ClickMeButton from above
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
```

### What `App` provides:

- Page-level orchestration of views
- URL routing
- User input context

### What `Component` provides:

- Manage DOM fragments in views
- Provide business logic
- Track and clean up listeners and data binding

Bink ships with a library of `Component`s.

### What `DataModel` and `DataCollection` provide:

The code snippet above doesn't use dynamic data so it doesn't need `DataModel` or `DataCollection`. Here's what those classes do:

- Manage a shared data structure for key/value maps (models) and ordered lists (collections)
- Wrap logic for communicating with services like remote web APIs or local storage
- Provide data change events so that the UI can react

## Use Bink in your projects

Bink is designed to be easy to use without an ecosystem like [npm]( https://www.npmjs.com/).

The quickest way to get started is to download the latest source code release zip from the [Releases page](https://github.com/Transmutable/bink/releases) and copy the `/src/` and `/style/` directories into your project's doc root. That's how the examples mentioned above work. ☝️

If you are stuck using `npm` (perhaps via [yarn](https://yarnpkg.com/)) and need to use Bink that way (dang it) then it's available as [@transmutable/bink]( https://www.npmjs.com/package/@transmutable/bink).

## Testing

Bink includes a [basic testing harness](./src/test/) and uses that harness to [test itself](./tests/tests.js). JavaScript testing frameworks are a huge topic and generally come with huge dependency trees, so it might be worth your time to see how this one works and decide whether a basic framework is all that you need.

To run the Bink tests execute `npm run examples` and then point a browser at:

http://127.0.0.1:8000/tests/


## Who made Bink?

Bink is the result of two+ decades of work on and with browsers by [Trevor Flowers](https://trevor.smith.name/) who leads [Transmutable](https://transmutable.com/) and is [@TrevorFSmith](https://twitter.com/trevorfsmith) on Twitter.
