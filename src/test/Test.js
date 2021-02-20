import EventHandler from '../EventHandler.js'

/**
	A test object that holds state.
*/
const Test = class extends EventHandler {
	constructor(name, testFunction, setupFunction = null, teardownFunction = null) {
		super()
		this.name = new String(name || '')
		this.testFunction = testFunction
		this.setupFunction = setupFunction
		this.teardownFunction = teardownFunction
		this.assertionCount = 0
	}

	/**
	@return {Object}
	@property {bool} passed
	@property {Object} [context] - a set of key:value pairs for communicating more info to test harnasses
	*/
	async run() {
		this.trigger(Test.Started, this)
		if (typeof this.setupFunction == 'function') {
			try {
				this.setupFunction(this)
				this.trigger(Test.SetupSecceeded, this)
			} catch (e) {
				const context = {
					message: 'Failed during setup',
					error: e,
				}
				this.trigger(Test.SetupFailed, this, context)
				return {
					passed: false,
					context: context,
				}
			}
		}
		try {
			const context = this.testFunction(this)
			this.trigger(Test.Passed, this, context)
			return {
				passed: true,
				context: context || null,
			}
		} catch (e) {
			const context = {
				error: e,
			}
			this.trigger(Test.Failed, this, context)
			return {
				passed: false,
				context: context,
			}
		} finally {
			if (typeof this.teardownFunction == 'function') {
				try {
					this.teardownFunction(this)
					this.trigger(Test.TeardownSucceeded, this)
				} catch (e) {
					this.trigger(Test.TeardownFailed, this, e)
					console.error('Teardown error', e)
				}
			}
		}
	}

	/**
	assert*(...) functions return nothing if the assertion is true and throw an Error if the assertion is false
	*/
	assertTrue(value) {
		this.assertionCount += 1
		if (!value) {
			throw new Error(`${value} is not true`)
		}
	}
	assertType(value, typeName) {
		this.assertionCount += 1
		if (value == null) {
			throw new Error(`${value} is null, so it not of type ${typeName}`)
		}
		if (typeof value !== typeName) {
			throw new Error(`${value} is of type ${typeof value}, not ${typeName}`)
		}
	}
	assertInstanceOf(value, clazz) {
		this.assertionCount += 1
		if (value instanceof clazz) {
			return
		}
		throw new Error(`${value} is not an instance of ${clazz}`)
	}
	assertNull(value) {
		this.assertionCount += 1
		if (value !== null) {
			throw new Error(`${value} is not null`)
		}
	}
	assertEqual(val1, val2) {
		this.assertionCount += 1
		if (val1 === null) {
			if (val2 !== null) {
				throw new Error(`${val1} != ${val2}`)
			}
		}
		if (val2 === null) {
			if (val1 !== null) {
				throw new Error(`${val1} != ${val2}`)
			}
		}
		if (val1 == null) {
			return
		}
		if (typeof val1 == 'undefined') {
			if (typeof val2 !== 'undefined') {
				throw new Error(`${val1} != ${val2}`)
			}
		}
		if (typeof val2 == 'undefined') {
			if (typeof val1 !== 'undefined') {
				throw new Error(`${val1} != ${val2}`)
			}
		}
		if (typeof val1 == 'undefined') {
			return
		}
		if (typeof val1.equals == 'function') {
			if (val1.equals(val2) == false) {
				throw new Error(`${val1} != ${val2}`)
			}
		} else if (val1 != val2) {
			throw new Error(`${val1} != ${val2}`)
		}
		return
	}
	assertNotEqual(val1, val2) {
		if (val1 == val2) {
			throw new Error(`${val1} == ${val2} (and it should not)`)
		}
	}
	assertRegExpMatchCount(regExp, value, matchCount = 1, flags = '') {
		if (typeof regExp === 'string') {
			regExp = new RegExp(regExp)
		}
		const result = value.match(regExp)
		if (result === null) {
			if (matchCount === 0) return
			throw new Error(`Expected ${matchCount} match(es) but received none: '${value}'.match(${regExp})`)
		}
		if (result.length !== matchCount) throw new Error(`Expected ${matchCount} matches: ${result}`)
	}
	assertRegExpMatches(regExp, value, matches = [], flags = '') {
		if (typeof regExp === 'string') {
			regExp = new RegExp(regExp, flags)
		}
		const result = value.match(regExp)
		if (result === null) {
			if (matches.length === 0) return
			throw new Error(`Expected ${matches.length} match(es) but received none: '${value}'.match(${regExp})`)
		}
		if (result.length !== matches.length) throw new Error(`${result} !== ${matches} for '${value}'.match(${regExp})`)
		for (let i = 0; i < matches.length; i++) {
			if (matches[i] !== result[i]) throw new Error(`${result} !== ${matches} for '${value}'.match(${regExp})`)
		}
	}
}

// Events
Test.Started = Symbol('test-started')
Test.SetupSucceeded = Symbol('test-setup-succeeded')
Test.SetupFailed = Symbol('test-setup-failed')
Test.Passed = Symbol('test-passed')
Test.Failed = Symbol('test-failed')
Test.TeardownSucceeded = Symbol('test-teardown-succeeded')
Test.TeardownFailed = Symbol('test-teardown-failed')

export default Test
