import dom from '../../DOM.js'
import Component from '../../Component.js'
import { lt } from '../../Localizer.js'

import ButtonComponent from '../atoms/ButtonComponent.js'

/**
ModalComponent shows another Component in front of other content.
*/
const ModalComponent = class extends Component {
	/**
	@param {DataObject} [dataObject=null]
	@param {Object} [options={}]
	*/
	constructor(dataObject = null, options = {}) {
		super(
			dataObject,
			Object.assign(
				{
					columns: ['key', 'value'],
					buttons: [
						{ name: lt('Go'), id: 'go' },
						{ name: lt('Cancel'), id: 'cancel' }
					]
				},
				options
			)
		)
		this.setName('ModalComponent')
		this.addClass('modal-component')

		for (const buttonInfo of this.options.buttons) {
			const button = new ButtonComponent(
				undefined,
				{
					id: buttonInfo.id,
					text: buttonInfo.name
				},
				this.inheritedOptions
			).appendTo(this)
			this.listenTo('click', button.dom, (actionName, active) => {
				if (active === false) return
				this.trigger(ModalComponent.ButtonActivatedEvent, buttonInfo.id, buttonInfo.name)
			})
		}
	}
}

ModalComponent.ButtonActivatedEvent = Symbol('button-action')

export default ModalComponent
export { ModalComponent }
