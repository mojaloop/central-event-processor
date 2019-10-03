/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>
 * Valentin Genev <valentin.genev@modusbox.com>
 * Deon Botha <deon.botha@modusbox.com>
 --------------
 ******/

'use strict'

const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
// const P = require('bluebird')
// const Mongoose = require('mongoose').Mongoose
// const mongoose = new Mongoose()
// const Mockgoose = require('mockgoose').Mockgoose
// const mockgoose = new Mockgoose(mongoose)
// const Database = require('../../../src/lib/database').db
// const config = require('../../../src/lib/config')
// const Logger = require('@mojaloop/central-services-logger')
const ActionSchema = require('../../../src/models/action').actionModel

Test('Action model', ActionModelTest => {
  let sandbox

  ActionModelTest.beforeEach(test => {
    sandbox = Sinon.createSandbox()
    test.end()
  })

  ActionModelTest.afterEach(test => {
    sandbox.restore()
    test.end()
  })

  const validRecord = {
    isActive: true,
    timesTriggered: 1,
    fromEvent: '5cab41eee0b9297d0f6df878',
    triggeredBy: '5cab41eee0b9297d0f6df878'
  }

  ActionModelTest.test('Action model should', isActiveFieldTest => {
    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      let actionModel = new ActionSchema(Object.assign({}, validRecord, { isActive: 'test' }))
      try {
        await actionModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'isActive' in e.errors, `Error: ${e.errors.isActive}`)
        test.end()
      }
    })

    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      let actionModel = new ActionSchema(Object.assign({}, validRecord, { timesTriggered: 'test' }))
      try {
        await actionModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'timesTriggered' in e.errors, `Error: ${e.errors.timesTriggered}`)
        test.end()
      }
    })

    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      let actionModel = new ActionSchema(Object.assign({}, validRecord, { fromEvent: 'test' }))
      try {
        await actionModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'fromEvent' in e.errors, `Error: ${e.errors.fromEvent}`)
        test.end()
      }
    })
    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      let actionModel = new ActionSchema(Object.assign({}, validRecord, { triggeredBy: 1 }))
      try {
        await actionModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'triggeredBy' in e.errors, `Error: ${e.errors.triggeredBy}`)
        test.end()
      }
    })
    isActiveFieldTest.test('create object', async test => {
      let actionModel = new ActionSchema(Object.assign({}, validRecord))
      try {
        await actionModel.validate()
        test.pass('with valid field values')
        test.end()
      } catch (e) {
        test.fail(`${e} thrown`)
        test.end()
      }
    })
    isActiveFieldTest.end()
  })
  ActionModelTest.end()
})
