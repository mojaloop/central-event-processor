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

const LimitSchema = require('../../../src/models/limits').limitModel
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')

Test('Limit model', LimitModelTest => {
  let sandbox

  LimitModelTest.beforeEach(test => {
    sandbox = Sinon.createSandbox()
    test.end()
  })

  LimitModelTest.afterEach(test => {
    sandbox.restore()
    test.end()
  })

  const validRecord = {
    name: 'dfsp1',
    currency: 'USD',
    oldValue: 100,
    type: 'limitType',
    value: 100,
    repetitions: 3,
    threshold: 40
  }
  LimitModelTest.test('Action model should', isActiveFieldTest => {
    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      let limitModel = new LimitSchema(Object.assign({}, validRecord, { name: '' }))
      try {
        await limitModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'name' in e.errors, `Error: ${e.errors.name}`)
        test.end()
      }
    })

    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      let limitModel = new LimitSchema(Object.assign({}, validRecord, { currency: '' }))
      try {
        await limitModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'currency' in e.errors, `Error: ${e.errors.currency}`)
        test.end()
      }
    })

    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      let limitModel = new LimitSchema(Object.assign({}, validRecord, { oldValue: 'test' }))
      try {
        await limitModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'oldValue' in e.errors, `Error: ${e.errors.oldValue}`)
        test.end()
      }
    })

    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      let limitModel = new LimitSchema(Object.assign({}, validRecord, { type: null }))
      try {
        await limitModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'type' in e.errors, `Error: ${e.errors.type}`)
        test.end()
      }
    })

    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      let limitModel = new LimitSchema(Object.assign({}, validRecord, { value: 'test' }))
      try {
        await limitModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'value' in e.errors, `Error: ${e.errors.value}`)
        test.end()
      }
    })

    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      let limitModel = new LimitSchema(Object.assign({}, validRecord, { repetitions: 'test' }))
      try {
        await limitModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'repetitions' in e.errors, `Error: ${e.errors.repetitions}`)
        test.end()
      }
    })

    isActiveFieldTest.test('throw error if invalid object is created', async test => {
      let limitModel = new LimitSchema(Object.assign({}, validRecord, { threshold: null }))
      try {
        await limitModel.validate()
        test.fail()
        test.end()
      } catch (e) {
        test.ok(e instanceof Error && 'threshold' in e.errors, `Error: ${e.errors.threshold}`)
        test.end()
      }
    })

    isActiveFieldTest.test('create object', async test => {
      let limitModel = new LimitSchema(Object.assign({}, validRecord))
      try {
        await limitModel.validate()
        test.pass('with valid field values')
        test.end()
      } catch (e) {
        test.fail(`${e} thrown`)
        test.end()
      }
    })
    isActiveFieldTest.end()
  })
  LimitModelTest.end()
})
