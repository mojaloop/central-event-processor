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

const CurrentPositionSchema = require('../../../src/models/currentPosition').currentPositionModel
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')

Test('curentPosition model test', currentPositionModelTest => {
  let sandbox
  currentPositionModelTest.beforeEach(test => {
    sandbox = Sinon.createSandbox()
    test.end()
  })

  currentPositionModelTest.afterEach(test => {
    sandbox.restore()
    test.end()
  })

  const validRecord = {
    name: 'dfsp1',
    positionType: 'transfer',
    currency: 'USD',
    positionValue: 100,
    transferId: '435c6890-376f-4947-9d70-7063dd3745d4',
    messagePayload: 'payload'
  }

  currentPositionModelTest.test('Action model should', isActiveFieldTest => {
    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      const currentPositionModel = new CurrentPositionSchema(Object.assign({}, validRecord, { name: '' }))
      try {
        await currentPositionModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'name' in e.errors, `Error: ${e.errors.name}`)
        test.end()
      }
    })

    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      const currentPositionModel = new CurrentPositionSchema(Object.assign({}, validRecord, { currency: '' }))
      try {
        await currentPositionModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'currency' in e.errors, `Error: ${e.errors.currency}`)
        test.end()
      }
    })

    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      const currentPositionModel = new CurrentPositionSchema(Object.assign({}, validRecord, { positionValue: 'A' }))
      try {
        await currentPositionModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'positionValue' in e.errors, `Error: ${e.errors.positionValue}`)
        test.end()
      }
    })
    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      const currentPositionModel = new CurrentPositionSchema(Object.assign({}, validRecord, { percentage: 'A' }))
      try {
        await currentPositionModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'percentage' in e.errors, `Error: ${e.errors.percentage}`)
        test.end()
      }
    })
    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      const currentPositionModel = new CurrentPositionSchema(Object.assign({}, validRecord, { transferId: '' }))
      try {
        await currentPositionModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'transferId' in e.errors, `Error: ${e.errors.transferId}`)
        test.end()
      }
    })
    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      const currentPositionModel = new CurrentPositionSchema(Object.assign({}, validRecord, { positionType: 'test' }))
      try {
        await currentPositionModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'positionType' in e.errors, `Error: ${e.errors.positionType}`)
        test.end()
      }
    })
    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      const currentPositionModel = new CurrentPositionSchema(Object.assign({}, validRecord, { messagePayload: null }))
      try {
        await currentPositionModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'messagePayload' in e.errors, `Error: ${e.errors.messagePayload}`)
        test.end()
      }
    })
    isActiveFieldTest.test('create object', async test => {
      const currentPositionModel = new CurrentPositionSchema(Object.assign({}, validRecord))
      try {
        await currentPositionModel.validate()
        test.pass('with valid field values')
        test.end()
      } catch (e) {
        test.fail(`${e} thrown`)
        test.end()
      }
    })

    isActiveFieldTest.end()
  })
  currentPositionModelTest.end()
})
