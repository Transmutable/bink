import Test from '../src/test/Test.js'
import Runner from '../src/test/Runner.js'
import SynchronousFetchMap from '../src/test/SynchronousFetchMap.js'
import TestResultsRenderer from '../src/test/TestResultsRenderer.js'

import { dom, Router, Component, DataModel, DataObject, EventHandler, DataCollection } from '../src/index.js'

const tests = []

tests.push(
	new Test('Events test', (test) => {
		const model = new DataModel()
		const receivedEvents = []
		model.addListener(EventHandler.ALL_EVENTS, (eventName, target, ...params) => {
			receivedEvents.push({ eventName: eventName, target: target, params: params })
		})
		model.addListener('changed:foo', (eventName, target, ...params) => {
			receivedEvents.push({ eventName: eventName, target: target, params: params })
		})
		model.addListener('changed:not_foo', (eventName, target, ...params) => {
			receivedEvents.push({ eventName: eventName, target: target, params: params })
		})
		model.set('foo', 'bar')
		test.assertEqual(receivedEvents.length, 3)
		test.assertEqual(receivedEvents[receivedEvents.length - 2].eventName, 'changed:foo')
		test.assertEqual(receivedEvents[receivedEvents.length - 2].target, model)
		test.assertEqual(receivedEvents[receivedEvents.length - 2].params[0], 'foo')

		const listener = (eventName, target, ...params) => {
			receivedEvents.push({ eventName: eventName, target: target, params: params })
		}
		model.addListener('changed:baz', listener)
		receivedEvents.length = 0
		model.set('baz', 23)
		test.assertEqual(receivedEvents.length, 3)
		model.removeListener('changed:bogus', listener) // Wrong eventName so should not be removed
		receivedEvents.length = 0
		model.set('baz', 100)
		test.assertEqual(receivedEvents.length, 3) // Should still be a listener
		model.removeListener('changed:baz', listener)
		receivedEvents.length = 0
		model.set('baz', 43)
		test.assertEqual(receivedEvents.length, 2) // Should only match the EventListener.ALL_EVENTS listener from above

		model.cleanup()
		receivedEvents.length = 0
		model.trigger('changed:foo', model, 'foo')
		test.assertEqual(receivedEvents.length, 0)

		const model2 = new DataModel({ foo: 'bar' })
		receivedEvents.length = 0
		model2.addListener('changed:foo', listener, true) // listen just once
		model2.set('foo', 'baz')
		test.assertEqual(receivedEvents.length, 1)
		model2.set('foo', 'blitz')
		test.assertEqual(receivedEvents.length, 1) // should have been removed as a listener
	})
)

tests.push(
	new Test('DataModel', (test) => {
		class FlowersCollection extends DataCollection {}
		const model = new DataModel(null, {
			fieldDataObjects: { flowers: FlowersCollection },
		})
		const receivedEvents = []
		model.addListener(EventHandler.ALL_EVENTS, (eventName, target, ...params) => {
			receivedEvents.push({ eventName: eventName, target: target, params: params })
		})
		test.assertNull(model.get('bogus'))
		test.assertEqual(model.get('bogus', 'moon'), 'moon')
		model.set('moon', 'unit')
		test.assertEqual(model.get('moon'), 'unit')
		test.assertEqual(model.get('moon', 'goon'), 'unit')
		test.assertEqual(receivedEvents.length, 2)
		test.assertEqual(receivedEvents[0].eventName, 'changed:moon')
		test.assertEqual(receivedEvents[1].eventName, 'changed')
		model.setBatch({
			dink: 'donk',
			pink: 'punk',
		})
		test.assertEqual(model.get('dink'), 'donk')
		test.assertEqual(model.get('pink'), 'punk')
		test.assertEqual(receivedEvents.length, 5)
		test.assertEqual(receivedEvents[2].eventName, 'changed:dink')
		test.assertEqual(receivedEvents[3].eventName, 'changed:pink')
		test.assertEqual(receivedEvents[4].eventName, 'changed')
		model.set('dink', 'donk')
		test.assertEqual(receivedEvents.length, 5) // Set to same value, should trigger no events

		model.set('flowers', [{ petals: 5 }, { petals: 6 }])
		test.assertInstanceOf(model.get('flowers'), FlowersCollection)
		let flowerCount = 0
		for (const flower of model.get('flowers')) {
			flowerCount++
		}
		test.assertEqual(flowerCount, 2)

		model.set('subModel', new DataModel({ mesmer: 'scout' }))
		test.assertInstanceOf(model.get('subModel'), DataModel)
		test.assertEqual(model.get('subModel').get('mesmer'), 'scout')
		model.set('subModel', { cheese: 'tall' })
		test.assertInstanceOf(model.get('subModel'), DataModel)
		test.assertEqual(model.get('subModel').get('cheese'), 'tall')
		test.assertEqual(model.get('subModel').get('mesmer'), null)

		receivedEvents.length = 0
		model.increment('pageCount') // Creates the field since it doesn't exist
		test.assertEqual(model.get('pageCount'), 1)
		test.assertEqual(receivedEvents.length, 2)
		test.assertEqual(receivedEvents[0].eventName, 'changed:pageCount')
		receivedEvents.length = 0
		model.increment('pageCount', -2)
		test.assertEqual(model.get('pageCount'), -1)
		test.assertEqual(receivedEvents.length, 2)
		test.assertEqual(receivedEvents[0].eventName, 'changed:pageCount')
		model.increment('pageCount', 10)
		test.assertEqual(model.get('pageCount'), 9)

		class ChildModel extends DataModel {
			get countPlusFour() {
				return this.get('count') + 4
			}
		}
		const parentModel = new DataModel({ id: 5, child: { count: 20 } }, { fieldDataObjects: { child: ChildModel } })
		test.assertInstanceOf(parentModel.get('child'), ChildModel) // child should be mapped to DataModel by fieldDataObjects
		test.assertEqual(parentModel.get('child').countPlusFour, 24)
	})
)

tests.push(
	new Test('DataCollection', (test) => {
		const col1 = new DataCollection()
		const receivedEvents = []
		col1.addListener(EventHandler.ALL_EVENTS, (eventName, target, ...params) => {
			receivedEvents.push({ eventName: eventName, target: target, params: params })
		})
		test.assertEqual(col1.length, 0)

		const model1 = new DataModel({ foo: 'bar' })
		col1.add(model1)
		test.assertEqual(receivedEvents.length, 1)
		test.assertEqual(receivedEvents[0].eventName, DataCollection.AddedEvent)
		test.assertEqual(col1.length, 1)
		test.assertEqual(col1.at(0).get('foo'), 'bar')

		receivedEvents.length = 0
		col1.remove(model1)
		test.assertEqual(receivedEvents.length, 1)
		test.assertEqual(receivedEvents[0].eventName, DataCollection.RemovedEvent)
		test.assertEqual(col1.length, 0)
		col1.remove(model1)
		test.assertEqual(receivedEvents.length, 1)
		test.assertEqual(col1.length, 0)

		receivedEvents.length = 0
		col1.addBatch([
			new DataModel({ id: 1 }),
			new DataModel({ id: 2 }),
			new DataModel({ id: 3 }),
			new DataModel({ id: 4 }),
		])
		test.assertEqual(receivedEvents.length, 4)
		for (const event in receivedEvents) {
			test.assertEqual(event.eventName, DataCollection.RemovedEvent)
		}

		receivedEvents.length = 0
		col1.reset([{ id: 10 }, { id: 11 }])
		test.assertEqual(receivedEvents[0].eventName, DataCollection.RemovedEvent)
		test.assertEqual(receivedEvents[1].eventName, DataCollection.RemovedEvent)
		test.assertEqual(receivedEvents[2].eventName, DataCollection.RemovedEvent)
		test.assertEqual(receivedEvents[3].eventName, DataCollection.RemovedEvent)
		test.assertEqual(receivedEvents[4].eventName, DataCollection.AddedEvent)
		test.assertEqual(receivedEvents[5].eventName, DataCollection.AddedEvent)
		test.assertEqual(receivedEvents[6].eventName, DataCollection.ResetEvent)
	})
)

tests.push(
	new Test('DataCollection sorting', (test) => {
		const col1 = new DataCollection([
			{ id: 4, foo: 'a' },
			{ id: 1, foo: 'b' },
			{ id: 2, foo: 'c' },
			{ id: 3, foo: 'd' },
		])
		col1.sort() // Sorts by id
		test.assertEqual(col1.at(0).get('id'), 1)
		test.assertEqual(col1.at(1).get('id'), 2)
		test.assertEqual(col1.at(2).get('id'), 3)
		test.assertEqual(col1.at(3).get('id'), 4)
		col1.sortByAttribute('foo')
		test.assertEqual(col1.at(0).get('foo'), 'a')
		test.assertEqual(col1.at(1).get('foo'), 'b')
		test.assertEqual(col1.at(2).get('foo'), 'c')
		test.assertEqual(col1.at(3).get('foo'), 'd')

		col1.keepSortedByField('foo')
		test.assertEqual(col1.at(0).get('foo'), 'a')
		test.assertEqual(col1.at(1).get('foo'), 'b')
		test.assertEqual(col1.at(2).get('foo'), 'c')
		test.assertEqual(col1.at(3).get('foo'), 'd')
		col1.at(0).set('foo', 'z')
		test.assertEqual(col1.at(0).get('foo'), 'b')
		test.assertEqual(col1.at(1).get('foo'), 'c')
		test.assertEqual(col1.at(2).get('foo'), 'd')
		test.assertEqual(col1.at(3).get('foo'), 'z')
		col1.reset([
			{ id: 1, foo: 'b' },
			{ id: 2, foo: 'c' },
			{ id: 3, foo: 'd' },
			{ id: 4, foo: 'a' },
		])
		test.assertEqual(col1.at(0).get('foo'), 'a')
		test.assertEqual(col1.at(1).get('foo'), 'b')
		test.assertEqual(col1.at(2).get('foo'), 'c')
		test.assertEqual(col1.at(3).get('foo'), 'd')
	})
)

tests.push(
	new Test(
		'SynchronousFetch',
		(test) => {
			SynchronousFetchMap.set('foo', { foo: 'bar' })
			let thenCount = 0
			fetch('foo')
				.then((r) => r.json())
				.then((data) => {
					thenCount += 1
					test.assertEqual(data.status, 200)
					test.assertEqual(data.foo, 'bar')
				})
				.catch(() => {
					throw new Error('Should not have caught on this promise.')
				})

			fetch('bogus')
				.then((r) => r.json())
				.then((data) => {
					thenCount += 1
					test.assertEqual(data.status, 404)
				})
				.catch(() => {
					throw new Error('Should not have caught on this promise.')
				})
			test.assertEqual(thenCount, 2) // Make sure we reached the then functions
		},
		(test) => {
			test.originalFetch = window.fetch
			window.fetch = SynchronousFetchMap.synchronousFetch
			SynchronousFetchMap.clear()
		},
		(test) => {
			window.fetch = test.originalFetch
		}
	)
)

tests.push(
	new Test('DOM manipulation', (test) => {
		const el1 = dom.div()

		// Add and remove classes
		test.assertType(el1.removeClass, 'function')
		test.assertType(el1.addClass, 'function')
		test.assertEqual(el1.addClass('foo').nodeType, 1)
		test.assertEqual(el1.getAttribute('class'), 'foo')
		el1.addClass('bar')
		test.assertEqual(el1.getAttribute('class'), 'foo bar')
		test.assertEqual(el1.removeClass('foo').nodeType, 1)
		test.assertEqual(el1.getAttribute('class'), 'bar')
		el1.removeClass('bar')
		test.assertEqual(el1.getAttribute('class'), null) // Removing the last class removes the attribute

		el1.addClass('blinz')
		el1.addClass('batz')
		test.assertEqual(el1.getAttribute('class'), 'blinz batz')
		el1.removeClass('batz')
		test.assertEqual(el1.getAttribute('class'), 'blinz')

		const el2 = dom.span().appendTo(el1)
		test.assertEqual(el1.children.length, 1)
		test.assertEqual(el1.children[0], el2)

		const el3 = dom.div({ foo: 'bar' }, 'Howdy', dom.span('Moo'))
		test.assertEqual(el3.childNodes[0].text, 'Howdy')
		test.assertEqual(el3.getAttribute('foo'), 'bar')
		test.assertEqual(el3.children[0].innerText, 'Moo')
	})
)

tests.push(
	new Test('DOM sorting', (test) => {
		const el1 = dom.div()
		test.assertEqual(el1.sort(), el1) // sort is in-place and returns the element for chaining
		el1.appendChild(dom.div({ id: 3 }))
		el1.appendChild(dom.div({ id: 5 }))
		el1.appendChild(dom.div({ id: 1 }))
		el1.appendChild(dom.div({ id: 2 }))
		el1.appendChild(dom.div({ id: 5 })) // Note, there are two fives
		el1.appendChild(dom.div({ id: 4 }))
		el1.sortByAttribute('id')
		test.assertEqual(el1.children.length, 6)
		for (let i = 0; i < el1.children.length - 1; i++) {
			test.assertEqual(el1.children.item(i).getAttribute('id'), i + 1)
		}
		test.assertEqual(el1.children.item(el1.children.length - 1).getAttribute('id'), 5)
	})
)

tests.push(
	new Test('Component', (test) => {
		let component1 = new Component(undefined, {
			dom: document.createElement('bogus'),
		})
		test.assertEqual(component1.dom.tagName.toLowerCase(), 'bogus')

		const fooSpan = dom.span('Mooo', { foo: 'bar' }, dom.p({ blatz: 'biz' }, 'flowers')).appendTo(component1.dom)
		component1.dom.appendChild(fooSpan)
		test.assertEqual(fooSpan.getAttribute('foo'), 'bar')
		test.assertNotEqual(fooSpan.innerHTML.indexOf('blatz="biz"'))

		component1 = dom.div()
		component1.append('Foo')
		test.assertEqual(component1.innerHTML, 'Foo')
		component1.append({ bling: 'ring' })
		test.assertEqual(component1.getAttribute('bling'), 'ring')

		class C1 extends Component {
			constructor(dataObject, options) {
				super(dataObject, options)
				this.fooDOM = dom.div().appendTo(this.dom)
				this.bindText('foo', this.fooDOM)
				this.burfDOM = dom.div().appendTo(this.dom)
				this.bindText('burf', this.burfDOM, (value) => {
					return (value ? value : 'nothing') + ' and more!'
				})
				this.bindAttribute('blart', this.dom, 'bluez')
			}
		}

		const model1 = new DataModel({ foo: 'bar', blart: 'binz' })
		const c2 = new C1(model1, { bibim: 'bap' })
		test.assertEqual(c2.fooDOM.innerHTML, 'bar')
		test.assertEqual(c2.burfDOM.innerHTML, 'nothing and more!')
		test.assertEqual(c2.dom.getAttribute('bluez'), 'binz')

		model1.set('foo', 'biz')
		test.assertEqual(c2.fooDOM.innerHTML, 'biz')
		model1.set('foo', null)
		test.assertEqual(c2.fooDOM.innerHTML, '')
		model1.set('foo', 23)
		test.assertEqual(c2.fooDOM.innerHTML, '23')

		model1.set('burf', 'sugar')
		test.assertEqual(c2.burfDOM.innerHTML, 'sugar and more!')

		model1.set('blart', 'floop')
		test.assertEqual(c2.dom.getAttribute('bluez'), 'floop')
		c2.cleanup()
	})
)

tests.push(
	new Test(
		'Routing',
		(test) => {
			const router = new Router()
			const receivedEvents = []
			router.addListener(EventHandler.ALL_EVENTS, (eventName, target, ...params) => {
				receivedEvents.push({ eventName: eventName, target: target, params: params })
			})
			router.addRoute(/^$/, 'splash', { foo: 'bar' }, 'tinkle')
			router.addRoute(/^tos$/, 'terms-of-service')
			router.addRoute(/^blog\/([0-9]+)$/, 'blog', { hello: 'nurse' })
			router.addRoute(/^blog\/([0-9]+)\/post\/([0-9a-zA-Z]+)$/, 'post')
			test.assertEqual(receivedEvents.length, 4)
			test.assertTrue(receivedEvents.some((ev) => ev.eventName !== Router.RouteAddedEvent) === false)

			receivedEvents.length = 0
			router.start()
			test.assertEqual(receivedEvents.length, 2)
			test.assertEqual(receivedEvents[0].eventName, 'splash')
			test.assertEqual(receivedEvents[0].params[0].foo, 'bar')
			test.assertEqual(receivedEvents[1].eventName, Router.StartedRoutingEvent)

			receivedEvents.length = 0
			router._handleNewPath('bogus')
			test.assertEqual(receivedEvents.length, 1)
			test.assertEqual(receivedEvents[0].eventName, Router.UnknownRouteEvent)
			test.assertEqual(receivedEvents[0].params.length, 0)

			receivedEvents.length = 0
			router._handleNewPath('blog/23')
			test.assertEqual(receivedEvents.length, 1)
			test.assertEqual(receivedEvents[0].eventName, 'blog')
			test.assertEqual(receivedEvents[0].params[0], '23')
			test.assertEqual(receivedEvents[0].params[1].hello, 'nurse')

			receivedEvents.length = 0
			router._handleNewPath('blog/23/post/alphaZ')
			test.assertEqual(receivedEvents.length, 1)
			test.assertEqual(receivedEvents[0].eventName, 'post')
			test.assertEqual(receivedEvents[0].params[0], '23')
			test.assertEqual(receivedEvents[0].params[1], 'alphaZ')

			router.cleanup()
		},
		() => {
			document.location.hash = ''
		},
		() => {
			document.location.hash = ''
		}
	)
)
export { tests, Runner, TestResultsRenderer as Renderer }
