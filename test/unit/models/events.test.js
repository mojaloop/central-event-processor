/*****
 License
 --------------
 Copyright © 2020-2025 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Mojaloop Foundation for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.

 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>
 * Valentin Genev <valentin.genev@modusbox.com>
 * Deon Botha <deon.botha@modusbox.com>
 --------------
 ******/

'use strict'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const EventSchema = require('../../../src/models/events').eventModel

Test('Event model', EventModelTest => {
  let sandbox

  EventModelTest.beforeEach(test => {
    sandbox = Sinon.createSandbox()
    test.end()
  })

  EventModelTest.afterEach(test => {
    sandbox.restore()
    test.end()
  })

  const validRecord = {
    isActive: true,
    name: 'dfsp1',
    currency: 'USD',
    limitType: 'limitType',
    notificationEndpointType: 'notificationEndpointType',
    action: 'produceToKafkaTopic',
    templateType: 'email',
    language: 'english'
  }

  EventModelTest.test('Event model should', isActiveFieldTest => {
    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      const eventModel = new EventSchema(Object.assign({}, validRecord, { isActive: 'test' }))
      try {
        await eventModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'isActive' in e.errors, `Error: ${e.errors.isActive}`)
        test.end()
      }
    })

    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      const eventModel = new EventSchema(Object.assign({}, validRecord, { name: '' }))
      try {
        await eventModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'name' in e.errors, `Error: ${e.errors.name}`)
        test.end()
      }
    })

    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      const eventModel = new EventSchema(Object.assign({}, validRecord, { currency: '' }))
      try {
        await eventModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'currency' in e.errors, `Error: ${e.errors.currency}`)
        test.end()
      }
    })

    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      const eventModel = new EventSchema(Object.assign({}, validRecord, { limitType: null }))
      try {
        await eventModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'limitType' in e.errors, `Error: ${e.errors.limitType}`)
        test.end()
      }
    })

    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      const eventModel = new EventSchema(Object.assign({}, validRecord, { notificationEndpointType: null }))
      try {
        await eventModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'notificationEndpointType' in e.errors, `Error: ${e.errors.notificationEndpointType}`)
        test.end()
      }
    })

    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      const eventModel = new EventSchema(Object.assign({}, validRecord, { action: 1 }))
      try {
        await eventModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'action' in e.errors, `Error: ${e.errors.action}`)
        test.end()
      }
    })

    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      const eventModel = new EventSchema(Object.assign({}, validRecord, { templateType: null }))
      try {
        await eventModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'templateType' in e.errors, `Error: ${e.errors.templateType}`)
        test.end()
      }
    })

    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      const eventModel = new EventSchema(Object.assign({}, validRecord, { language: null }))
      try {
        await eventModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'language' in e.errors, `Error: ${e.errors.language}`)
        test.end()
      }
    })

    isActiveFieldTest.test('create object', async test => {
      const eventModel = new EventSchema(Object.assign({}, validRecord))
      try {
        await eventModel.validate()
        test.pass('with valid field values')
        test.end()
      } catch (e) {
        test.fail(`${e} thrown`)
        test.end()
      }
    })
    isActiveFieldTest.end()
  })
  EventModelTest.end()
})
