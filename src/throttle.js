/**
`throttle` will rate limit a function call.

This code is cribbed from https://github.com/jashkenas/underscore

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
A handy utility function for throttling console logging
*/
const throttledConsoleLog = throttle(function (...params) {
	console.log(...params)
}, 1000)

export { throttle, throttledConsoleLog }
