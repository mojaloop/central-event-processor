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

const Expect = require('chai').expect
const EventSchema = require('../../../src/models/events').eventModel

describe('Mongo eventModel', () => {

  // Db field name
  it('Field name should throw error if invalid name is created', (done) => {
    var eventModel = new EventSchema({ name: '' })

    eventModel.validate((err) => {
      Expect(err.errors.name).to.exist
      done()
    })
  })

  it('Field name should succeed if name is created', (done) => {
    var eventModel = new EventSchema({ name: 'dfsp1' })

    eventModel.validate((err) => {
      Expect(!err)
      done()
    })
  })

  // Db field currency
  it('Field timesTriggered should throw error if invalid object is created', (done) => {
    var eventModel = new EventSchema({ currency: '' })

    eventModel.validate((err) => {
      Expect(err.errors.currency).to.exist
      done()
    })
  })

  it('Field timesTriggered should succeed if an object is created', (done) => {
    var eventModel = new EventSchema({ currency: 'USD' })

    eventModel.validate((err) => {
      Expect(!err)
      done()
    })
  })

  // Db field limitType
  it('Field limitType should throw error if invalid object is created', (done) => {
    var eventModel = new EventSchema({ limitType: '' })

    eventModel.validate((err) => {
      Expect(err.errors.limitType).to.exist
      done()
    })
  })

  it('Field limitType should succeed if an object is created', (done) => {
    var eventModel = new EventSchema({ limitType: Object })

    eventModel.validate((err) => {
      Expect(!err)
      done()
    })
  })

  // Db field action
  it('Field action should throw error if invalid action is created', (done) => {
    var eventModel = new EventSchema({ action: '' })

    eventModel.validate((err) => {
      Expect(err.errors.action).to.exist
      done()
    })
  })

  it('Field action should succeed if action is created', (done) => {
    var eventModel = new EventSchema({ action: 'Test' })

    eventModel.validate((err) => {
      Expect(!err)
      done()
    })
  })

  // Db field templateType
  it('Field templateType should throw error if invalid templateType is created', (done) => {
    var eventModel = new EventSchema({ templateType: '' })

    eventModel.validate((err) => {
      Expect(err.errors.templateType).to.exist
      done()
    })
  })

  it('Field templateType should succeed if templateType is created', (done) => {
    var eventModel = new EventSchema({ templateType: 'Test' })

    eventModel.validate((err) => {
      Expect(!err)
      done()
    })
  })

  // Db field language
  it('Field language should throw error if invalid language is created', (done) => {
    var eventModel = new EventSchema({ language: '' })

    eventModel.validate((err) => {
      Expect(err.errors.language).to.exist
      done()
    })
  })

  it('Field language should succeed if language is created', (done) => {
    var eventModel = new EventSchema({ language: 'EN' })

    eventModel.validate((err) => {
      Expect(!err)
      done()
    })
  })

  // Db field isActive
  it('Field isActive should throw error if invalid isActive is created', (done) => {
    var eventModel = new EventSchema({ isActive: 'Test' })

    eventModel.validate((err) => {
      Expect(err.errors.isActive).to.exist
      done()
    })
  })

  it('Field isActive should succeed if isActive is created', (done) => {
    var eventModel = new EventSchema({ isActive: true })

    eventModel.validate((err) => {
      Expect(!err)
      done()
    })
  })
})