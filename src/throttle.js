/**
`throttle` will rate limit a function call.

This code is cribbed from https://github.com/jashkenas/underscore

@example <caption>Throttling rendering info</caption>

var count = 0 // This will be incremented in every animation frame

// We want to call this in every animation frame but only run it once a second (1000 ms)
const throttledDebug = throttle(() => { 
	console.log('Render count', count)
}, 1000)

// This is the function that is called in every animation frame
function render() {
	count += 1
	throttledDebug() // Called every frame but run only once a second
	window.requestAnimationFrame(render)
}
window.requestAnimationFrame(render)

@param {function} func
@param {int} wait - the minimum number of milliseconds between calls.
@param {boolean} [leading=true] - if true, the first call to the throttled function is immediately called.
@param {boolean} [trailing=true] - if true, once the wait time has passed the function is called. 
@return {function} - the throttled function
*/
function throttle(func, wait, leading = true, trailing = true) {
	let timeout, context, args, result
	let previous = 0

	const later = function () {
		previous = leading === false ? 0 : Date.now()
		timeout = null
		result = func.apply(context, args)
		if (!timeout) context = args = null
	}

	const throttled = function () {
		const now = Date.now()
		if (!previous && leading === false) previous = now
		const remaining = wait - (now - previous)
		context = this
		args = arguments
		if (remaining <= 0 || remaining > wait) {
			if (timeout) {
				clearTimeout(timeout)
				timeout = null
			}
			previous = now
			result = func.apply(context, args)
			if (!timeout) context = args = null
		} else if (!timeout && trailing !== false) {
			timeout = setTimeout(later, remaining)
		}
		return result
	}

	throttled.cancel = function () {
		clearTimeout(timeout)
		previous = 0
		timeout = context = args = null
	}

	return throttled
}

/**
A handy utility function for throttling console logging to once per second

@param {*[]} params - The parameters to pass to `console.log`
*/
const throttledConsoleLog = throttle(function (...params) {
	console.log(...params)
}, 1000)

export { throttle, throttledConsoleLog }
