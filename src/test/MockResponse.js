/*
	MockResponse sort of acts like the Response object returned from fetch
*/
export default class MockResponse {
	constructor(status = 200, responseData = {}, blob = null) {
		this.status = status
		this.responseData = responseData
		this.blob = blob
	}
	json() {
		return this.responseData
	}
}
