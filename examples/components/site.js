import dom from '../../src/DOM.js'
import { App } from '../../src/App.js'
import { lt } from '../../src/Localizer.js'
import { Component } from '../../src/Component.js'
import { DataModel } from '../../src/DataModel.js'
import { DataCollection } from '../../src/DataCollection.js'

import * as components from '../../src/components/index.js'

import { MediaGridComponent } from '../../src/components/organisms/MediaGridComponent.js'

class AtomsComponent extends MediaGridComponent {
	constructor(dataObject=null, options={}) {
		super(new DataCollection([
			{
				clazz: components.ButtonComponent,
				options: { text: lt('Go go') }
			},
			{
				clazz: components.HeadingComponent,
				options: { text: 'Heading' }
			},
			{
				clazz: components.ImageComponent,
				options: { image: '/examples/media/test-image.jpg' }
			},
			{
				clazz: components.LabelComponent,
				options: { text: lt('This is a label') }
			},
			{
				clazz: components.LinkComponent,
				options: {
					text: lt('This is a link'),
					url: '#nowhere'
				}
			},
			{
				clazz: components.ProgressComponent,
				data: new DataModel({
					value: 0.25
				}),
				options: {
					dataField: 'value'
				}
			},
			{
				clazz: components.SelectionComponent,
				options: {
					items: [[lt('One'), 1], [lt('Two'), 2], [lt('Three'), 3]]
				}
			},
			{
				clazz: components.SliderComponent,
				options: { }
			},
			{
				clazz: components.SwitchComponent,
				options: { }
			},
			{
				clazz: components.TextComponent,
				options: { text: lt('This is a TextComponent') }
			},
			{
				clazz: components.TextInputComponent,
				options: {
					placeholder: lt('Enter text here')
				}
			},
			{
				clazz: components.ToggleComponent,
				options: { }
			},
			{
				clazz: components.VideoComponent,
				options: {
					mimeType: 'video/mp4',
					video: '/examples/media/test16x9video.mov'
				}
			}
		]), Object.assign({
			itemComponent: ComponentCardComponent
		}), options)
		this.addClass('atoms-component', 'view-component')
	}
}

class MoleculesComponent extends MediaGridComponent {
	constructor(dataObject=null, options={}) {
		super(new DataCollection([
			{
				clazz: components.AudioPlayerComponent,
				options: {
					audio: '/examples/media/test-sound.mp3'
				}
			},
			{
				clazz: components.FormComponent // TODO add field Components
			},
			{
				clazz: components.ImageCardComponent,
				options: {
					title: lt('Image title'),
					image: '/examples/media/test-image.jpg'
				}
			},
			{
				clazz: components.MenuComponent
			},
			{
				clazz: components.PaginationComponent
			},
			{
				clazz: components.ToolTipComponent,
				options: {
					component: new components.TextComponent(undefined, { text: 'This is the info component' })
				}
			},
			{
				options: {
					mimeType: 'video/mp4',
					video: '/examples/media/test16x9video.mov'
				},
				clazz: components.VideoPlayerComponent
			},
			{
				clazz: components.WaitComponent
			}
		]), Object.assign({
			itemComponent: ComponentCardComponent
		}), options)
		this.addClass('molecules-component', 'view-component')
	}
}

class OrganismsComponent extends MediaGridComponent {
	constructor(dataObject=null, options={}) {
		super(new DataCollection([
			{
				data: new DataCollection([
					{ name: 'First item' },
					{ name: 'Second item' },
					{ name: 'Third item' }
				]),
				clazz: components.CollectionComponent
			},
			{
				clazz: components.MastheadComponent,
				options: {
					brand: 'Brand',
					brandAnchor: './',
					menuItems: [
						{ name: 'One', anchor: '#one' },
						{ name: 'Two', anchor: '#two' },
						{ name: 'Three', anchor: '#three' }
					]
				}
			}
		]), Object.assign({
			itemComponent: ComponentCardComponent
		}), options)
		this.addClass('organisms-component', 'view-component')
	}
}

class SplashApp extends App {
	constructor(options={}) {
		super(options)


		this._headingComponent = new components.HeadingComponent(undefined, {
			text: lt('Components')
		}).appendTo(this)

		new components.HeadingComponent(undefined, {
			dom: dom.h2(),
			text: lt('Atoms')
		}).appendTo(this).addClass('section-heading')
		this._atomsComponent = new AtomsComponent().appendTo(this)

		new components.HeadingComponent(undefined, {
			dom: dom.h2(),
			text: lt('Molecules')
		}).appendTo(this).addClass('section-heading')
		this._moleculesComponent = new MoleculesComponent().appendTo(this)

		new components.HeadingComponent(undefined, {
			dom: dom.h2(),
			text: lt('Organisms')
		}).appendTo(this).addClass('section-heading')
		this._organismsComponent = new OrganismsComponent().appendTo(this)
	}
}

class ComponentCardComponent extends components.CardComponent {
	constructor(dataObject=null, options={}) {
		super(dataObject, Object.assign({
			dom: dom.li()
		}, options))
		this.addClass('component-card-component')

		const clazz = this.dataObject.get('clazz')
		if (!clazz) {
			console.error('Ooops', dataObject, options)
		}
		const optionz = this.dataObject.get('options', null)
		const dataz = this.dataObject.get('data', null)
		this._targetComponent = new clazz(dataz, optionz).appendTo(this.mainComponent)
		this.titleComponent.text = this._targetComponent.dom.getAttribute('data-name')
	}
}

function init() {
	const app = new SplashApp()
	window.document.body.innerHTML = ''
	window.document.body.appendChild(app.dom)
}
init()
