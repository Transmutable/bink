import Component from '../../Component.js'

/**
ButtonGroupComponent gathers together {@link ButtonComponent}s.
*/
const ButtonGroupComponent = class extends Component {
	/**
	@param {DataObject} [dataObject=null]
	@param {Object} [options=null]
	*/
	constructor(dataObject = null, options = {}) {
		super(dataObject, options)
		this.addClass('button-group-component')
		this.setName('ButtonGroupComponent')
	}
}

export default ButtonGroupComponent
export { ButtonGroupComponent }
