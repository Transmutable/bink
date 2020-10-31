import dom from '../../src/DOM.js'
import { App } from '../../src/App.js'
import { lt } from '../../src/Localizer.js'
import { Component } from '../../src/Component.js'
import { DataModel } from '../../src/DataModel.js'
import { DataCollection } from '../../src/DataCollection.js'

import * as components from '../../src/components/index.js'

import { MediaGridComponent } from '../../src/components/organisms/MediaGridComponent.js'

class SplashApp extends App {
	constructor(options={}) {
		super(options)
		this._headingComponent = new components.HeadingComponent(undefined, {
			text: lt('Components')
		}).appendTo(this)

		this._atomsComponent = new AtomsComponent().appendTo(this)
	}
}

class ComponentCardComponent extends components.CardComponent {
	constructor(dataObject=null, options={}) {
		super(dataObject, Object.assign({
			dom: dom.li()
		}, options))
		this.addClass('component-card-component')

		const clazz = this.dataObject.get('clazz')
		const optionz = this.dataObject.get('options', null)
		const dataz = this.dataObject.get('data', null)
		this._targetComponent = new clazz(dataz, optionz).appendTo(this.mainComponent)
		this.titleComponent.text = this._targetComponent.dom.getAttribute('data-name')
	}
}

class AtomsComponent extends MediaGridComponent {
	constructor(dataObject=null, options={}) {
		super(new DataCollection([
			{
				clazz: components.AudioPlayerComponent
			},
			{
				clazz: components.ButtonComponent,
				options: { text: 'Go go' }
			},
			{
				clazz: components.HeadingComponent,
				options: { text: 'Heading' }
			},
			{
				clazz: components.ImageComponent,
				options: { }
			},
			{
				clazz: components.LabelComponent,
				options: { text: 'Label' }
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
				options: { text: 'Text' }
			},
			{
				clazz: components.TextInputComponent,
				options: { }
			},
			{
				clazz: components.ToggleComponent,
				options: { }
			},
			{
				clazz: components.VideoComponent,
				options: { }
			}
		]), Object.assign({
			itemComponent: ComponentCardComponent
		}), options)
		this.addClass('atoms-component', 'view-component')
	}
}

function init() {
	const app = new SplashApp()
	window.document.body.innerHTML = ''
	window.document.body.appendChild(app.dom)
}
init()
