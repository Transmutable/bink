import Test from './Test.js'
import EventHandler from '../EventHandler.js'

/**
Runner is responsible for running {@link Test}s and returning the results
It also emits a series of events that test harnesses can use to render status as tests are run
*/
const Runner = class extends EventHandler {
	/**
	Run tests and return a data structure of results
	@param {Test[]} tests
	@return {Object[]} - Object attributes: {bool} passed, {Test} test, {string} message
	@property {number} passedCount
	@property {number} failedCount
	@property {number} assertionCount
	*/
	async run(tests) {
		this.trigger(this.events.RunStarted, this, tests)
		const results = []
		results.passedCount = 0
		results.failedCount = 0
		results.assertionCount = 0

		for (let i = 0; i < tests.length; i++) {
			const test = tests[i]
			this._listenToTest(i, test)
			const { passed, context } = await test.run()
			results.push({
				test: test,
				passed: passed,
				context: context,
			})
			if (passed) {
				results.passedCount += 1
			} else {
				results.failedCount += 1
			}
			results.assertionCount += test.assertionCount
		}

		this.trigger(this.events.RunEnded, this, results)
		return results
	}

	/**
	Run tests and print a summary to the console
	*/
	async runAndLog(tests) {
		const results = await Runner.run(tests)
		console.log(
			`total: ${results.length}  passed: ${results.passedCount}  failed: ${results.failedCount} assertions: ${results.assertionCount}`
		)
	}

	/**
	Run tests and return TAP formatted results
	@param {Test[]} tests
	@return {string} - TAP formatted results
	*/
	async runAndTAP(tests) {
		return TAPFormatter.formatTestResults(await Runner.run(tests))
	}

	_listenToTest(index, test) {
		// Proxies test events into runner events with a test index
		test.addListener(Test.Started, (eventName, test) => {
			this.trigger(this.events.Started, index, test)
		})

		test.addListener(Test.SetupSucceeded, (eventName, test, context) => {
			this.trigger(this.events.SetupSucceeded, index, test, context)
		})

		test.addListener(Test.SetupFailed, (eventName, test, context) => {
			this.trigger(this.events.SetupFailed, index, test, context)
		})

		test.addListener(Test.Passed, (eventName, test, context) => {
			this.trigger(this.events.Passed, index, test, context)
		})

		test.addListener(Test.Failed, (eventName, test, context) => {
			this.trigger(this.events.Failed, index, test, context)
		})

		test.addListener(Test.TeardownSucceeded, (eventName, test, context) => {
			this.trigger(this.events.TeardownSucceeded, index, test, context)
		})

		test.addListener(Test.TeardownFailed, (eventName, test, context) => {
			this.trigger(this.events.TeardownFailed, index, test, context)
		})
	}
}

// Events
const events = {
	RunStarted: Symbol('run-started'),
	RunEnded: Symbol('run-ended'),
	Started: Symbol('test-started'),
	SetupSucceeded: Symbol('test-setup-succeeded'),
	SetupFailed: Symbol('test-setup-failed'),
	Passed: Symbol('test-passed'),
	Failed: Symbol('test-failed'),
	TeardownSucceeded: Symbol('test-teardown-succeeded'),
	TeardownFailed: Symbol('test-teardown-failed'),
}

Runner.prototype.events = events

/**
Implements formatting of test results into TAP v13
http://testanything.org/tap-version-13-specification.html
*/
const TAPFormatter = class {
	/**
	@param {Object[]} testResults - data returned from Runner.run(...)
	@return {string} - TAP formatted results
	*/
	static formatTestResults(testResults) {
		const tapLines = [] // An array of lines of text
		tapLines.push('TAP version 13')
		tapLines.push(`1..${testResults.length}`)
		for (let i = 0; i < testResults.length; i++) {
			tapLines.push(...TAPFormatter.formatTestResult(i + 1, testResults[i]))
		}
		return tapLines.join('\n')
	}

	static formatTestResult(testNumber, testResult) {
		const tapLines = []
		const status = testResult.passed ? 'ok' : 'not ok'
		tapLines.push(`${status} ${testNumber} ${testResult.test.name}`)
		if (testResult.context !== null && Object.keys(testResult.context).length > 0) {
			tapLines.push('\t---')
			for (const key of Object.keys(testResult.context)) {
				tapLines.push(`\t${key}: ${testResult.context[key]}`)
			}
			tapLines.push('\t...')
		}
		return tapLines
	}
}

export default Runner
