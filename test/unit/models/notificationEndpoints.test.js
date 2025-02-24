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

const NotificationEndpointSchema = require('../../../src/models/notificationEndpoint').notificationEndpointModel
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')

Test('NotificationEndpoint model', NotificationEndpointModelTest => {
  let sandbox

  NotificationEndpointModelTest.beforeEach(test => {
    sandbox = Sinon.createSandbox()
    test.end()
  })

  NotificationEndpointModelTest.afterEach(test => {
    sandbox.restore()
    test.end()
  })

  const validRecord = {
    name: 'dfsp1',
    type: 'limitType',
    value: 100
  }
  NotificationEndpointModelTest.test('Action model should', isActiveFieldTest => {
    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      const notificationEndpointModel = new NotificationEndpointSchema(Object.assign({}, validRecord, { name: '' }))
      try {
        await notificationEndpointModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'name' in e.errors, `Error: ${e.errors.name}`)
        test.end()
      }
    })

    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      const notificationEndpointModel = new NotificationEndpointSchema(Object.assign({}, validRecord, { type: null }))
      try {
        await notificationEndpointModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'type' in e.errors, `Error: ${e.errors.type}`)
        test.end()
      }
    })

    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      const notificationEndpointModel = new NotificationEndpointSchema(Object.assign({}, validRecord, { value: null }))
      try {
        await notificationEndpointModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'value' in e.errors, `Error: ${e.errors.value}`)
        test.end()
      }
    })

    isActiveFieldTest.test('create object', async test => {
      const notificationEndpointModel = new NotificationEndpointSchema(Object.assign({}, validRecord))
      try {
        await notificationEndpointModel.validate()
        test.pass('with valid field values')
        test.end()
      } catch (e) {
        test.fail(`${e} thrown`)
        test.end()
      }
    })
    isActiveFieldTest.end()
  })
  NotificationEndpointModelTest.end()
})
