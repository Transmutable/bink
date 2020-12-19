import dom from '../../../src/DOM.js'
import { App } from '../../../src/App.js'
import { lt } from '../../../src/Localizer.js'
import { Component } from '../../../src/Component.js'
import { DataCollection } from '../../../src/DataCollection.js'

import { LabelComponent } from '../../../src/components/atoms/LabelComponent.js'
import { ButtonComponent } from '../../../src/components/atoms/ButtonComponent.js'
import { HeadingComponent } from '../../../src/components/atoms/HeadingComponent.js'
import { TextInputComponent } from '../../../src/components/atoms/TextInputComponent.js'

import { CollectionComponent } from '../../../src/components/organisms/CollectionComponent.js'

/*
Normally these Component classes would be in separate files but for this demo it's easier to read if they're all in one.

This demo uses ES module loading of separate library files but Bink is your basic ES module library that can be webpack-ed or whatever.
*/

/**
Represents the UI for a single to-do item
*/
class TodoComponent extends Component {
	constructor(dataModel, options={}){
		super(dataModel, Object.assign(options, {
			dom: dom.li()
		}))

		this._viewComponent = new Component(dataModel, {}).appendTo(this).addClass('view')
		this._toggleComponent = new Component(dataModel, {
			dom: dom.input({
				'class': 'toggle',
				'type': 'checkbox'
			})
		}).appendTo(this._viewComponent)
		this._labelComponent = new LabelComponent(dataModel, {
			textField: 'label'
		}).appendTo(this._viewComponent)
		this._destroyComponent = new ButtonComponent(
			dataModel,
			{}
		).appendTo(this._viewComponent).addClass('destroy')

		this._editComponent = new TextInputComponent(dataModel, {

		}).appendTo(this).addClass('edit').hide()
		this._editComponent.dom.setAttribute('value', dataModel.get('label', ''))

		this.bindAttribute('completed', this.dom, 'class', (value) => {
			return value ? 'completed' : ''
		})
	}
}

/**
Renders the inner footer element of the to-do list (not the credits footer)
*/
class FooterComponent extends Component {
	constructor(dataModel, options={}) {
		super(dataModel, Object.assign(options, {
			dom: dom.footer({ 'class': 'footer' })
		}))
		this.addClass('footer')

		this._countComponent = new Component(undefined, {
			dom: dom.span({ 'class': 'todo-count' })
		}).appendTo(this)
		const handleCountChange = () => {
			// TODO add the logic for updating count label
			console.log('count update', this.dataObject.length)
			this._countComponent.dom.innerHTML = `<strong>${dataModel.length}</strong> ` + lt('items left')
		}
		this.listenTo('added', this.dataObject, handleCountChange)
		this.listenTo('removed', this.dataObject, handleCountChange)
		this.listenTo('reset', this.dataObject, handleCountChange)
		handleCountChange()

		this._filtersComponent = new Component(undefined, {
			// See Dom.js for info on programmatically creating HTML fragments
			dom: dom.ul(
				{ 'class': 'filters' },
				dom.li( dom.a({ 'class': 'selected', href: '#/' }, 'All') ),
				dom.li( dom.a({ href: '#/active' }, 'Active') ),
				dom.li( dom.a({ href: '#/completed' }, 'Completed') ),
			)
		}).appendTo(this)

		this._clearComponent = new ButtonComponent(dataModel, {
			text: lt('Clear completed')
		}).appendTo(this).addClass('clear-completed')
	}
}

class TodoApp extends App {
	constructor(options={}) {
		super(Object.assign(options, {
			dom: dom.section({ 'class': 'todoapp' })
		}))

		this._todoCollection = new DataCollection([
			{ label: 'Taste JavaScript', completed: false },
			{ label: 'Buy a unicorn', completed: true }
		])

		// HEADER
		this._headerComponent = new Component(undefined, {
			dom: dom.header({ 'class': 'header' })
		}).appendTo(this)
		new HeadingComponent(undefined, {
			text: 'todos'
		}).appendTo(this._headerComponent)
		this._newInputComponent = new TextInputComponent(undefined, {
			placeholder: lt('What needs to be done?')
		}).addClass('new-todo').appendTo(this._headerComponent)
		this._newInputComponent.dom.setAttribute('autofocus', '')
 
		// MAIN LIST
		this._mainComponent = new Component(undefined, {
			dom: dom.section({ 'class': 'main' })
		}).appendTo(this)

		this._toggleAllComponent = new Component(undefined, {
			dom: dom.input({
				'id': 'toggle-all',
				'class': 'toggle-all',
				'type': 'checkbox'
			})
		}).appendTo(this._mainComponent)
		this._toggleAllLabelComponent = new LabelComponent(undefined, {
			text: lt('Mark all as complete')
		}).appendTo(this._mainComponent)
		this._toggleAllLabelComponent.dom.setAttribute('for', 'toggle-all')
		this.todoListComponent = new CollectionComponent(this._todoCollection, {
			itemComponent: TodoComponent
		}).appendTo(this._mainComponent).addClass('todo-list')

		// FOOTER
		this._footerComponent = new FooterComponent(this._todoCollection).appendTo(this)
	}
}

(function (window) {
	const app = new TodoApp()
	window.document.body.innerHTML = ''
	window.document.body.appendChild(app.dom)

})(window);

/*
<section class="todoapp">
	<header class="header">
		<h1>todos</h1>
		<input class="new-todo" placeholder="What needs to be done?" autofocus>
	</header>
	<!-- This section should be hidden by default and shown when there are todos -->
	<section class="main">
		<input id="toggle-all" class="toggle-all" type="checkbox">
		<label for="toggle-all">Mark all as complete</label>
		<ul class="todo-list">
			<!-- These are here just to show the structure of the list items -->
			<!-- List items should get the class `editing` when editing and `completed` when marked as completed -->
			<li class="completed">
				<div class="view">
					<input class="toggle" type="checkbox" checked>
					<label>Taste JavaScript</label>
					<button class="destroy"></button>
				</div>
				<input class="edit" value="Create a TodoMVC template">
			</li>
			<li>
				<div class="view">
					<input class="toggle" type="checkbox">
					<label>Buy a unicorn</label>
					<button class="destroy"></button>
				</div>
				<input class="edit" value="Rule the web">
			</li>
		</ul>
	</section>
	<!-- This footer should be hidden by default and shown when there are todos -->
	<footer class="footer">
		<!-- This should be `0 items left` by default -->
		<span class="todo-count"><strong>0</strong> item left</span>
		<!-- Remove this if you don't implement routing -->
		<ul class="filters">
			<li>
				<a class="selected" href="#/">All</a>
			</li>
			<li>
				<a href="#/active">Active</a>
			</li>
			<li>
				<a href="#/completed">Completed</a>
			</li>
		</ul>
		<!-- Hidden if no completed items are left ↓ -->
		<button class="clear-completed">Clear completed</button>
	</footer>
</section>
<footer class="info">
	<p>Double-click to edit a todo</p>
	<!-- Change this out with your name and url ↓ -->
	<p>Created by <a href="https://trevor.smith.name/">Trevor F. Smith</a></p>
	<p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
</footer>
*/
