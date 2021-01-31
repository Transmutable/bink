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

A web page's script element instantiates a Bink [`App`](https://transmutable.github.io/bink/api/class/src/App.js~App.html) that orchestrates views made up of [`Component`](https://transmutable.github.io/bink/api/class/src/Component.js~Component.html)s that reactively update the DOM based on information and events in [`DataModel`](https://transmutable.github.io/bink/api/class/src/DataModel.js~DataModel.html)s and [`DataCollection`](https://transmutable.github.io/bink/api/class/src/DataCollection.js~DataCollection.html)s as well as events from user actions.

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

- Manage a shared data structure for key/value maps (models) and ordered lists (collections)
- Wrap logic for communicating with services like remote APIs or local storage
- Provide data change events so that the UI can react
