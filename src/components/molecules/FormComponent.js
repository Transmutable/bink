import dom from '../../DOM.js'
import Component from '../../Component.js'
import { throttle } from '../../throttle.js'
import { lt, ld, Localizer } from '../../Localizer.js'

import LabelComponent from '../atoms/LabelComponent.js'
import SwitchComponent from '../atoms/SwitchComponent.js'
import ButtonComponent from '../atoms/ButtonComponent.js'
import HeadingComponent from '../atoms/HeadingComponent.js'
import TextInputComponent from '../atoms/TextInputComponent.js'
import SelectionComponent from '../atoms/SelectionComponent.js'

import WaitComponent from './WaitComponent.js'

/**
FormComponent is meant to be used to modify values of a {@link DataModel}.

FormComponent holds:

- a heading that titles the form
- a set of {@link FormFieldComponent}s that provide input UI for fields in the DataModel


@todo Create a PasswordInputFieldComponent
@todo Create a form error display element and per-field error display elements
@todo Add a `WaitComponent` to show while submitting the form
@todo Add default Submit/Reset/Clear controls

@example
class SignInComponent extends FormComponent {
	constructor(dataModel=null, options={}) {
		super(dataModel, Object.assign({
			heading: 'Sign-in:'
		}, options))
		this.addClass('sign-in-component')

		this._usernameComponent = new TextInputFieldComponent(
			this.dataObject,
			{ label: lt('username'), placeholder: lt('Enter your account username') }
		).appendTo(this.fieldsComponent)

		this._passwordComponent = new PasswordInputFieldComponent(
			this.dataObject,
			{ label: lt('password'), placeholder: lt('Enter your account password') }
		).appendTo(this.fieldsComponent)
	}
}
*/
const FormComponent = class extends Component {
	/**
	@param {DataObject} [dataObject]
	@param {Object} [options] see the {@Component} for inherited options
	@param {string} [options.heading=null] the heading text for this form
	*/
	constructor(dataObject = null, options = {}) {
		super(dataObject, options)
		this.setName('FormComponent')
		this.addClass('form-component')

		this._headingComponent = new HeadingComponent(undefined, { dom: dom.h2(this.options.heading || '') }).appendTo(this)
		if (!this.options.heading) {
			this._headingComponent.hide()
		}

		this._fieldsComponent = new Component().appendTo(this)
		this._fieldsComponent.setName('FieldsComponent')
		this._fieldsComponent.addClass('fields-component')
	}

	/** @type {Component} in which you should place your field Components */
	get fieldsComponent() {
		return this._fieldsComponent
	}
}

/**
FormFieldComponent is the base {@link Component} for fields in a {@link FormComponent}.

It only contains a {@link LabelComponent} as direct sub-classes (listed above) will add input `Component`s.

If you have a unique field type then this is the class to extend with your custom UI.
*/
const FormFieldComponent = class extends Component {
	/**
	@param {string}   [options.label=null] the display text for this input field used in a LabelComponent
	@param {string}   [options.dataField=null] the name of the {@link DataModel} field for this form element 

	@todo Make the label reactive to a DataModel field
	*/
	constructor(dataObject = null, options = {}) {
		super(
			dataObject,
			Object.assign(
				{
					label: null,
					dataField: null,
				},
				options
			)
		)
		this.setName('FormFieldComponent')
		this.addClass('form-field-component')

		this._label = new LabelComponent(undefined, {
			text: this.options.label || '',
		}).appendTo(this)
		if (!this.options.label) this._label.hide()
	}
}

/**
SelectionFieldComponent provides a dropdown selector for use in {@link FormComponent}s.
*/
const SelectionFieldComponent = class extends FormFieldComponent {
	/**
	@param {DataModel} dataObject
	@param {Object} options see {@link FormFieldComponent} for more options (like `label`)
	@param {Object[]} options.items an array of [display name, value] to be used as choices in the selector
	*/
	constructor(dataObject, options) {
		super(dataObject, options)
		this.setName('SelectionFieldComponent')
		this.addClass('selection-field-component')

		this._selectionComponent = new SelectionComponent(this.dataObject, {
			items: options.items,
		}).appendTo(this)
		this._selectionComponent.selectedIndex = 0

		if (this.dataObject && this.options.dataField) {
			this._updateInputFromModel()
			this.listenTo(SelectionComponent.SelectionIndexChangedEvent, this._selectionComponent, () => {
				this._updateModelFromInput()
			})
		}
	}

	_updateInputFromModel() {
		if (!this.dataObject || !this.options.dataField) return
		const data = Number.parseInt(this.dataObject.get(this.options.dataField, 0))
		if (Number.isNaN(data)) {
			this._selectionComponent.selectedIndex = 0
			return
		}
		this._selectionComponent.selectedIndex = Number.parseInt(data)
	}

	_updateModelFromInput() {
		if (!this.dataObject || !this.options.dataField) return
		this.dataObject.set(this.options.dataField, this._selectionComponent.selectedIndex)
	}
}

/**
SwitchFieldComponent shows a {@link SwitchComponent} to toggle a boolean field value in a {@link FormComponent}.
*/
const SwitchFieldComponent = class extends FormFieldComponent {
	/**
	@param {DataModel} [dataObject]
	@param {Object}    [options] see {@link FormFieldComponent} for more options
	*/
	constructor(dataObject = null, options = {}) {
		super(dataObject, options)
		this.setName('SwitchFieldComponent')
		this.addClass('switch-field-component')

		this._switchComponent = new SwitchComponent(this.dataObject, {
			dataField: this.options.dataField,
		}).appendTo(this)
	}
}

/**
DateFieldComponent provides day, month, and year input for use in a {@link FormComponent}.
*/
const DateFieldComponent = class extends FormFieldComponent {
	/**
	@param {DataModel} [dataObject]
	@param {Object}    [options] see {@link FormFieldComponent} for more options
	*/
	constructor(dataObject = null, options = {}) {
		super(dataObject, options)
		this.setName('DateFieldComponent')
		this.addClass('date-field-component')
		this._throttledUpdateModelFromInput = throttle(this._updateModelFromInput.bind(this), 1000, false, true)

		this._dayInputComponent = new TextInputComponent(this.dataObject, {
			placeholder: lt('dd'),
		})
			.addClass('day-input-component')
			.setName('DayInputComponent')

		this._monthInputComponent = new TextInputComponent(this.dataObject, {
			placeholder: lt('mm'),
		})
			.addClass('month-input-component')
			.setName('MonthInputComponent')

		this._yearInputComponent = new TextInputComponent(this.dataObject, {
			placeholder: lt('yyyy'),
		})
			.addClass('year-input-component')
			.setName('YearInputComponent')

		// Different places have different orders for their date fields, so handle that here
		Localizer.Singleton.dateFieldOrder.forEach((fieldName) => {
			switch (fieldName) {
				case 'month':
					this.appendComponent(this._monthInputComponent)
					break
				case 'day':
					this.appendComponent(this._dayInputComponent)
					break
				case 'year':
					this.appendComponent(this._yearInputComponent)
					break
			}
		})

		this._dateLabelComponent = new LabelComponent(this.dataObject, {})
			.appendTo(this)
			.addClass('date-label-component')
			.setName('DateLabelComponent')

		if (this.dataObject && this.options.dataField) {
			this._updateInputFromModel()
			this.listenTo(`changed:${this.options.dataField}`, this.dataObject, () => {
				this._updateLabelFromModel()
			})
			this._updateLabelFromModel()
			this.listenTo(TextInputComponent.TextChangeEvent, this._dayInputComponent, this._throttledUpdateModelFromInput)
			this.listenTo(TextInputComponent.TextChangeEvent, this._monthInputComponent, this._throttledUpdateModelFromInput)
			this.listenTo(TextInputComponent.TextChangeEvent, this._yearInputComponent, this._throttledUpdateModelFromInput)
		}
	}

	/** @return {Date?} the date specified in the input fields or null if it is not parsed */
	get inputDate() {
		const day = Number.parseInt(this._dayInputComponent.text)
		if (Number.isNaN(day)) return null
		let month = Number.parseInt(this._monthInputComponent.text)
		if (Number.isNaN(month)) return null
		month = month - 1 // Date uses zero indexed months
		let year = Number.parseInt(this._yearInputComponent.text)
		if (Number.isNaN(year)) return null
		if (year < 100) year = year + 1900 // Fix up two digit years

		// Dates should always be serialized into UTC
		const result = new Date(Date.UTC(year, month, day, 0, 0, 0))
		if (Number.isNaN(result.getTime())) return null
		return result
	}

	_updateLabelFromModel() {
		const modelData = this.dataObject.get(this.options.dataField, null)
		if (modelData === null) {
			this._dateLabelComponent.text = '---------'
			return
		}
		const modelDate = new Date(modelData)
		if (Number.isNaN(modelDate.getTime())) {
			this._dateLabelComponent.text = '---------'
			return
		}
		this._dateLabelComponent.text = ld(
			new Date(modelDate.getUTCFullYear(), modelDate.getUTCMonth(), modelDate.getUTCDate(), 0, 0, 0)
		)
	}

	_updateModelFromInput() {
		if (!this.dataObject || !this.options.dataField) return
		const inputDate = this.inputDate
		// Set the data field to an ISO string date or remove it if the input is invalid
		this.dataObject.set(this.options.dataField, inputDate ? inputDate.toISOString() : undefined)
	}

	_clearInput() {
		this._dateLabelComponent.text = ''
		this._dayInputComponent.text = ''
		this._monthInputComponent.text = ''
		this._yearInputComponent.text = ''
	}

	_updateInputFromModel() {
		if (!this.dataObject || !this.options.dataField) return
		const modelData = this.dataObject.get(this.options.dataField, null)
		if (modelData === null) {
			this._clearInput()
			return
		}
		const modelDate = new Date(modelData)
		if (Number.isNaN(modelDate.getTime())) {
			this._clearInput()
			console.error('invalid date data', modelData)
			return
		}
		this._updateInputFromDate(new Date(modelData))
	}

	/**
	@param {string or Date} date
	*/
	_updateInputFromDate(date) {
		if (!date) {
			this._clearInput()
			return
		}
		if (typeof date === 'string') {
			date = new Date(date)
		}
		if (date instanceof Date === false) {
			this._clearInput()
			return
		}
		if (Number.isNaN(date.getTime())) {
			this._clearInput()
			return
		}
		this._dayInputComponent.text = date.getUTCDate()
		this._monthInputComponent.text = date.getUTCMonth() + 1
		this._yearInputComponent.text = date.getUTCFullYear()
	}
}

/**
TextInputFieldComponent provides a text field, natch
*/
const TextInputFieldComponent = class extends FormFieldComponent {
	/**
	@param {DataModel} [dataObject]
	@param {Object}    [options] see {@link FormFieldComponent} for more options
	@param {string}    [options.placeholder] the text displayed in the field when there is no value text
	*/
	constructor(dataObject = null, options = {}) {
		super(
			dataObject,
			Object.assign(
				{
					placeholder: null,
				},
				options
			)
		)
		this.setName('TextInputFieldComponent')
		this.addClass('text-input-field-component')

		this._textInputComponent = new TextInputComponent(dataObject, {
			placeholder: this.options.placeholder,
			dataField: this.options.dataField,
		}).appendTo(this)
		this.listenTo(TextInputComponent.TextChangeEvent, this._textInputComponent, (eventName, value) => {
			this._handleInputChange(value)
		})

		if (this.dataObject && this.options.dataField) {
			this.listenTo(`changed:${this.options.dataField}`, this.dataObject, (eventName, model, dataField, value) => {
				this._handleModelChange(value)
			})
		}
	}

	_handleInputChange(value) {
		if (!this.dataObject || !this.options.dataField) return
		if (this.dataObject.get(this.options.dataField) === value) return
		this.dataObject.set(this.options.dataField, value)
	}

	_handleModelChange(value) {
		if (this._textInputComponent.text === value) return
		this._textInputComponent.text = value
	}
}

export default FormComponent
export {
	FormComponent,
	FormFieldComponent,
	DateFieldComponent,
	SwitchFieldComponent,
	SelectionFieldComponent,
	TextInputFieldComponent,
}
