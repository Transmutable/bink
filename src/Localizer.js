import EventHandler from './EventHandler.js'
import dom from './DOM.js'

let Singleton = null
let MonthNames = null // [locale, [names]]
let DateFieldOrder = null

const TestDateMilliseconds = 1517385600000

const GatheringCookieName = 'bink-localizer-gathering'

/**
`Localizer` provides the functionality necessary to:

- pick a string translation based on language
- format dates based on locale and time zone

In most cases you should use {@link Localizer.Singleton} instead of creating your own Localizer.

@todo detect language, locale, and timezone
@todo load translations
*/
const Localizer = class extends EventHandler {
	/**
	In most cases you should use {@link Localizer.Singleton} instead of creating your own Localizer.
	*/
	constructor() {
		super()
		this._translations = new Map() // <string, Translation>
		this._defaultLocales = navigator.languages ? navigator.languages : [navigator.language]
		this._defaultTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

		this._dateTimeFormatter = new Intl.DateTimeFormat(this._defaultLocales)

		this._gathering = dom.getCookie(GatheringCookieName) === 'true'
		this._gatheredStrings = this._gathering ? [] : null
	}

	/**
	A list of [BCP 47](https://tools.ietf.org/html/bcp47) locale strings from [navigator](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorLanguage/languages).

	@return {Array<string>}
	*/
	get defaultLocales() {
		return this._defaultLocales
	}

	/**
	@return {Intl.DateTimeFormat}
	*/
	get defaultTimeZone() {
		return this._defaultTimeZone
	}

	/**
	@type {boolean} true if the Localizer is accumulating strings to translate
	*/
	get gathering() {
		return this._gathering
	}

	/**
	This should NOT be turned on in production because it continuously grows in memory.
	@param {boolean} val - true if the Localizer should accumulate strings to translate
	*/
	set gathering(val) {
		if (!!val) {
			if (this._gathering) return
			dom.setCookie(GatheringCookieName, 'true')
			this._gathering = true
			this._gatheredStrings = []
		} else {
			if (this._gathering === false) return
			dom.removeCookie(GatheringCookieName)
			this._gathering = false
			this._gatheredStrings = null
		}
	}

	/**
	@type {Array<Object>} the gathered string translation
	@property {string} key
	@property {string} value
	@property {string} defaultValue
	*/
	get gatheredData() {
		if (this._gathering === false) return null
		return {
			strings: this._gatheredStrings,
		}
	}

	_gatherString(key, value, defaultValue) {
		if (!key || !key.trim()) return
		this._gatheredStrings.push({
			key: key,
			value: value,
			defaultValue: defaultValue,
		})
	}

	/**
	@param {string} key
	@param {string} [defaultValue=null]
	@return {string} the translated string
	*/
	translate(key, defaultValue = null) {
		const translation = this._translations.get(key)
		if (!translation) {
			if (this._gathering) this._gatherString(key, null, defaultValue)
			return defaultValue !== null ? defaultValue : key
		}
		const value = translation.get(key)
		if (!value) {
			if (this._gathering) this._gatherString(key, null, defaultValue)
			return defaultValue !== null ? defaultValue : key
		}
		if (this._gathering) this._gatherString(key, value, defaultValue)
		return value
	}

	/** @type {Array<string>} */
	get monthNames() {
		if (MonthNames === null || MonthNames[0] !== this._defaultLocales[0]) {
			MonthNames = []
			MonthNames[0] = this._defaultLocales
			MonthNames[1] = []
			const options = {
				month: 'long',
			}
			const date = new Date()
			date.setDate(1)
			for (let i = 0; i < 12; i++) {
				date.setMonth(i)
				MonthNames[1].push(date.toLocaleString(this._defaultLocales, options))
			}
		}
		return MonthNames[1]
	}

	/**
	Different locales order their dates in various ways: mm/dd/yyyy or yyyy.mm.dd or 2012년 12월 20일 목요일
	@type {string[]} - a length 3 array of 'day', 'month', and 'year' in the order that this locale renders date fields
	*/
	get dateFieldOrder() {
		if (DateFieldOrder !== null) return DateFieldOrder

		if (typeof this._dateTimeFormatter.formatToParts === 'function') {
			DateFieldOrder = this._dateTimeFormatter
				.formatToParts(new Date(), {
					year: 'numeric',
					month: 'numeric',
					day: 'numeric',
				})
				.filter((part) => part.type !== 'literal')
				.map((part) => part.type)
			return DateFieldOrder
		}

		// Ok the correct but less supported function is not there, try this hack
		const tokens = new Date(TestDateMilliseconds)
			.toLocaleDateString(this._defaultLocales, {
				day: 'numeric',
				month: 'numeric',
				year: 'numeric',
			})
			.split(/[\/ \.]/)
			.filter((token) => token.trim().length > 0)
		let monthIndex = 0
		let yearIndex = 0
		for (let i = 1; i < 3; i++) {
			if (tokens[i].length < tokens[monthIndex].length) monthIndex = i
			if (tokens[i].length > tokens[yearIndex].length) yearIndex = i
		}
		DateFieldOrder = []
		DateFieldOrder[monthIndex] = 'month'
		DateFieldOrder[yearIndex] = 'year'
		for (let i = 0; i < 3; i++) {
			if (!DateFieldOrder[i]) {
				DateFieldOrder[i] = 'day'
				break
			}
		}
		return DateFieldOrder
	}

	/**
	@param {Date} date
	@param {Object} options
	@return {string} - the date in locale form
	*/
	formatDateObject(date, options) {
		return date.toLocaleDateString(this._defaultLocales, options)
	}

	/**
	@param {Date} date
	@param {boolean} long - true if the month should be long form
	@param {Object} options
	@return {string} - the date in locale form
	*/
	formatDate(date, long = false, options = null) {
		return this.formatDateObject(
			date,
			options || {
				year: 'numeric',
				month: long ? 'long' : 'numeric',
				day: 'numeric',
			}
		)
	}

	/**
	@param {Date} date
	@param {boolean} [long=false] - true if the month should be long form
	@param {Object} options
	@return {string} - the date and time in locale form
	*/
	formatDateTime(date, long = false, options = null) {
		return this.formatDateObject(
			date,
			options || {
				hour: 'numeric',
				minute: 'numeric',
				second: 'numeric',
				hour12: false,
				timeZone: this._defaultTimeZone,
				year: 'numeric',
				month: long ? 'long' : 'numeric',
				day: 'numeric',
			}
		)
	}

	/**
	In almost all cases you should use this singleton instead of constructing your own {@link Localizer}.

	@example
	Localizer.Singleton.formatDate(new Date())

	@return {Localizer}
	*/
	static get Singleton() {
		if (Singleton === null) {
			Singleton = new Localizer()
		}
		return Singleton
	}
}

/**
Translation holds a map of source phrases to translated phrases in a given language
*/
const Translation = class {
	constructor(language) {
		this._language = language
		/** @type {Map<{string} key, {string} value>} */
		this._map = new Map()
	}
	get language() {
		return this._language
	}

	get(key) {
		return this._map.get(key)
	}
}

/**
A shorthand function for getting a translation

@param {string} key the source phrase, like 'Hello!'
@param {string} [defaultValue=null] the value to return if there is no translation
@return {string} a translation, like '¡Hola!'
*/
function lt(key, defaultValue) {
	return Localizer.Singleton.translate(key, defaultValue)
}

/**
A shorthand function for getting a localized date

@param {Date} date
@param {boolean} [long=true]
@param {options} [options=null]
@return {string} a localized string representing the date
*/
function ld(date, long = true, options = null) {
	return Localizer.Singleton.formatDate(date, long, options)
}

/**
A shorthand function for getting a localized date and time

@param {Date} date
@param {boolean} [long=true]
@param {options} [options=null]
@return {string} a localized string representing the date and time
*/
function ldt(date, long = true, options = null) {
	return Localizer.Singleton.formatDateTime(date, long, options)
}

/**
A shorthand function for getting a localized date or time string using your own options
@see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString

@param {Date} date
@param {options} [options=null]
@return {string} a localized string representing the date
*/
function ldo(date, options = null) {
	return Localizer.Singleton.formatDateObject(date, options)
}

export default Localizer
export { Localizer, Translation, lt, ld, ldt, ldo }
