import App from './App.js'
import dom from './DOM.js'
import Router from './Router.js'
import Component from './Component.js'
import DataModel from './DataModel.js'
import Localizer from './Localizer.js'
import { throttle } from './throttle.js'
import DataObject from './DataObject.js'
import MockService from './MockService.js'
import DataCollection from './DataCollection.js'

/**
 * This is used by rollup to create a handy all-in-one ES module
 */

export { App, dom, Router, throttle, Component, DataModel, Localizer, DataObject, MockService, DataCollection }
