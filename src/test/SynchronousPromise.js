/*
	SynchronousPromise sort of acts like a Promise but is not asynchronous
*/
export default class SynchronousPromise {
	constructor(resolveFunction = null, rejectFunction = null) {
		this.resolveFunction = resolveFunction
		this.rejectFunction = rejectFunction
	}
	then(func) {
		let result = null
		if (this.resolveFunction) {
			result = func(this.resolveFunction())
		}
		return new SynchronousPromise(() => {
			return result
		})
	}
	catch(func) {
		let result = null
		if (this.rejectFunction) {
			result = func(this.rejectFunction())
		}
		return new SynchronousPromise(() => {
			return result
		})
	}
}
