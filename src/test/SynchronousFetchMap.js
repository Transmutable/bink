import MockResponse from './MockResponse.js'
import SynchronousPromise from './SynchronousPromise.js'

// Load this up with <url string, { data: responseData, status: INT }> for synchronousFetch to use
const SynchronousFetchMap = new Map()

// This is used in setup and teardown of a Test to replace window.fetch with a synchronous version that is easier to test
SynchronousFetchMap.synchronousFetch = function (url) {
	return new SynchronousPromise(() => {
		const info = SynchronousFetchMap.get(url)
		if (!info) {
			return new MockResponse('Not found', 404)
		}
		return new MockResponse(info)
	})
}

export default SynchronousFetchMap
