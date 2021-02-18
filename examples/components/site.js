import dom from '../../src/DOM.js'
import { App } from '../../src/App.js'
import { lt } from '../../src/Localizer.js'
import { Component } from '../../src/Component.js'
import { DataModel } from '../../src/DataModel.js'
import { DataCollection } from '../../src/DataCollection.js'

import * as components from '../../src/components/index.js'

import { MediaGridComponent } from '../../src/components/organisms/MediaGridComponent.js'

const APIDocRoot = '../../docs/api/class/src/components'
const SourceRoot = '../../docs/api/file/src/components'

class AtomsComponent extends MediaGridComponent {
	constructor(dataObject=null, options={}) {
		super(new DataCollection([
			{
				clazz: components.ButtonComponent,
				options: { text: lt('Go go') },
				doc: '/atoms/ButtonComponent.js~ButtonComponent.html',
				src: '/atoms/ButtonComponent.js.html'
			},
			{
				clazz: components.HeadingComponent,
				options: { text: 'Heading' },
				doc: '/atoms/HeadingComponent.js~HeadingComponent.html',
				src: '/atoms/HeadingComponent.js.html'
			},
			{
				clazz: components.ImageComponent,
				options: { image: '/examples/media/test-image.jpg' },
				doc: '/atoms/ImageComponent.js~ImageComponent.html',
				src: '/atoms/ImageComponent.js.html'
			},
			{
				clazz: components.LabelComponent,
				options: { text: lt('This is a label') },
				doc: '/atoms/LabelComponent.js~LabelComponent.html',
				src: '/atoms/LabelComponent.js.html'
			},
			{
				clazz: components.LinkComponent,
				options: {
					text: lt('This is a link'),
					url: '#nowhere'
				},
				doc: '/atoms/LinkComponent.js~LinkComponent.html',
				src: '/atoms/LinkComponent.js.html'
			},
			{
				clazz: components.ProgressComponent,
				data: new DataModel({
					value: 0.25
				}),
				options: {
					dataField: 'value'
				},
				doc: '/atoms/ProgressComponent.js~ProgressComponent.html',
				src: '/atoms/ProgressComponent.js.html'
			},
			{
				clazz: components.SelectionComponent,
				options: {
					items: [[lt('One'), 1], [lt('Two'), 2], [lt('Three'), 3]]
				},
				doc: '/atoms/SelectionComponent.js~SelectionComponent.html',
				src: '/atoms/SelectionComponent.js.html'
			},
			{
				clazz: components.SliderComponent,
				options: { },
				doc: '/atoms/SliderComponent.js~SliderComponent.html',
				src: '/atoms/SliderComponent.js.html'
			},
			{
				clazz: components.SwitchComponent,
				options: { },
				doc: '/atoms/SwitchComponent.js~SwitchComponent.html',
				src: '/atoms/SwitchComponent.js.html'
			},
			{
				clazz: components.TextComponent,
				options: { text: lt('This is a TextComponent') },
				doc: '/atoms/TextComponent.js~TextComponent.html',
				src: '/atoms/TextComponent.js.html'
			},
			{
				clazz: components.TextInputComponent,
				options: {
					placeholder: lt('Enter text here')
				},
				doc: '/atoms/TextInputComponent.js~TextInputComponent.html',
				src: '/atoms/TextInputComponent.js.html'
			},
			{
				clazz: components.ToggleComponent,
				options: { },
				doc: '/atoms/ToggleComponent.js~ToggleComponent.html',
				src: '/atoms/ToggleComponent.js.html'
			},
			{
				clazz: components.VideoComponent,
				options: {
					mimeType: 'video/mp4',
					video: '/examples/media/test16x9video.mov'
				},
				doc: '/atoms/VideoComponent.js~VideoComponent.html',
				src: '/atoms/VideoComponent.js.html'
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
				},
				doc: '/molecules/AudioPlayerComponent.js~AudioPlayerComponent.html',
				src: '/molecules/AudioPlayerComponent.js.html'
			},
			{
				clazz: components.FormComponent, // TODO add field Components
				doc: '/molecules/FormComponent.js~FormComponent.html',
				src: '/molecules/FormComponent.js.html'
			},
			{
				clazz: components.ImageCardComponent,
				options: {
					title: lt('Image title'),
					image: '/examples/media/test-image.jpg'
				},
				doc: '/molecules/ImageCardComponent.js~ImageCardComponent.html',
				src: '/molecules/ImageCardComponent.js.html'
			},
			{
				clazz: components.MenuComponent,
				doc: '/molecules/MenuComponent.js~MenuComponent.html',
				src: '/molecules/MenuComponent.js.html'
			},
			{
				clazz: components.PaginationComponent,
				doc: '/molecules/PaginationComponent.js~PaginationComponent.html',
				src: '/molecules/PaginationComponent.js.html'
			},
			{
				clazz: components.ToolTipComponent,
				options: {
					component: new components.TextComponent(undefined, { text: 'This is the info component' })
				},
				doc: '/molecules/ToolTipComponent.js~ToolTipComponent.html',
				src: '/molecules/ToolTipComponent.js.html'
			},
			{
				options: {
					mimeType: 'video/mp4',
					video: '/examples/media/test16x9video.mov'
				},
				clazz: components.VideoPlayerComponent,
				doc: '/molecules/VideoPlayerComponent.js~VideoPlayerComponent.html',
				src: '/molecules/VideoPlayerComponent.js.html'
			},
			{
				clazz: components.WaitComponent,
				doc: '/molecules/WaitComponent.js~WaitComponent.html',
				src: '/molecules/WaitComponent.js.html'
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
				clazz: components.CollectionComponent,
				doc: '/organisms/CollectionComponent.js~CollectionComponent.html',
				src: '/organisms/CollectionComponent.js.html'
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
				},
				doc: '/organisms/MastheadComponent.js~MastheadComponent.html',
				src: '/organisms/MastheadComponent.js.html'
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
			return
		}
		const optionz = this.dataObject.get('options', null)
		const dataz = this.dataObject.get('data', null)
		const doc = this.dataObject.get('doc', null)
		const src = this.dataObject.get('src', null)

		this._targetComponent = new clazz(dataz, optionz).appendTo(this.mainComponent)
		this.titleComponent.text = this._targetComponent.dom.getAttribute('data-name')
		if (doc) {
			new components.LinkComponent(undefined, {
				text: 'API doc',
				url: APIDocRoot + doc
			}).appendTo(this.captionComponent)
		}
		if (src) {
			new components.LinkComponent(undefined, {
				text: 'Source code',
				url: SourceRoot + src
			}).appendTo(this.captionComponent)
		}
	}
}

function init() {
	const app = new SplashApp()
	window.document.body.innerHTML = ''
	window.document.body.appendChild(app.dom)
}
init()
