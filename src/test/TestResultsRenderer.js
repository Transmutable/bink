const TestResultsRenderer = class {
	constructor(runner) {
		this._el = document.createElement('ul')
		this._el.setAttribute('class', 'test-results-runner')
		this._runner = runner
		this._listenToRunner()

		this._tests = null // populated in _handleRunStarted
	}

	get el() {
		return this._el
	}

	_getTestEl(index) {
		if (index < 0 || index >= this._el.children.length) return null
		return this._el.children[index]
	}

	_handleRunStarted(eventName, runner, tests) {
		this._el.innerHTML = ''
		for (let i = 0; i < tests.length; i++) {
			const test = tests[i]

			const liEl = document.createElement('li')
			this._el.appendChild(liEl)
			liEl.setAttribute('class', 'test-result')
			liEl.dataset.name = test.name
			liEl.dataset.index = i

			const nameEl = document.createElement('h2')
			liEl.appendChild(nameEl)
			nameEl.innerText = test.name
			nameEl.setAttribute('class', 'name')

			const statusEl = document.createElement('p')
			liEl.appendChild(statusEl)
			statusEl.setAttribute('class', 'status')
			statusEl.innerText = 'waiting...'

			const contextEl = document.createElement('table')
			liEl.appendChild(contextEl)
			contextEl.setAttribute('class', 'context')
		}
	}

	_renderContext(index, test, context) {
		if (!context) return
		const tableEl = this._getTestEl(index).querySelector('.context')
		for (const key of Object.keys(context)) {
			const rowEl = document.createElement('tr')
			tableEl.appendChild(rowEl)
			const headingEl = document.createElement('th')
			rowEl.appendChild(headingEl)
			headingEl.innerText = `${key}:`
			const dataEl = document.createElement('td')
			rowEl.appendChild(dataEl)
			if (typeof context[key] === 'object' && typeof context[key].stack === 'string') {
				dataEl.innerText = `${context[key]}\n\t${context[key].stack}`
			} else {
				dataEl.innerText = new String(context[key] || '')
			}
		}
	}

	_handleRunEnded(...params) {}

	_handleSetupSucceeded(...params) {}

	_handleSetupFailed(eventName, index, test, context) {
		const el = this._getTestEl(index)
		if (el === null) return
		el.setAttribute('data-status', 'failed')
		el.querySelector('.status').innerText = 'setup failed'
		this._renderContext(index, test, context)
	}

	_handleTestStarted(eventName, index, test) {
		const el = this._getTestEl(index)
		if (el === null) return
		el.setAttribute('data-status', 'started')
		el.querySelector('.status').innerText = 'started'
	}

	_handleTestPassed(eventName, index, test, context) {
		const el = this._getTestEl(index)
		if (el === null) return
		el.setAttribute('data-status', 'passed')
		el.querySelector('.status').innerText = 'passed'
		this._renderContext(index, test, context)
	}

	_handleTestFailed(eventName, index, test, context) {
		const el = this._getTestEl(index)
		if (el === null) return
		el.setAttribute('data-status', 'failed')
		el.querySelector('.status').innerText = 'failed'
		this._renderContext(index, test, context)
	}

	_handleTeardownSucceeded(...params) {}

	_handleTeardownFailed(...params) {}

	_listenToRunner() {
		this._runner.addListener(this._runner.events.RunStarted, (...params) => {
			this._handleRunStarted(...params)
		})

		this._runner.addListener(this._runner.events.RunEnded, (...params) => {
			this._handleRunEnded(...params)
		})

		this._runner.addListener(this._runner.events.Started, (...params) => {
			this._handleTestStarted(...params)
		})

		this._runner.addListener(this._runner.events.SetupSucceeded, (...params) => {
			this._handleSetupSucceeded(...params)
		})

		this._runner.addListener(this._runner.events.SetupFailed, (...params) => {
			this._handleSetupFailed(...params)
		})

		this._runner.addListener(this._runner.events.Passed, (...params) => {
			this._handleTestPassed(...params)
		})

		this._runner.addListener(this._runner.events.Failed, (...params) => {
			this._handleTestFailed(...params)
		})

		this._runner.addListener(this._runner.events.TeardownSucceeded, (...params) => {
			this._handleTeardownSucceeded(...params)
		})

		this._runner.addListener(this._runner.events.TeardownFailed, (...params) => {
			this._handleTeardownFailed(...params)
		})
	}
}

export default TestResultsRenderer
