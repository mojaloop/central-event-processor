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
const Assert = require('chai').assert
const NotificationEndpointSchema = require('../../../src/models/notificationEndpoint').notificationEndpointModel

describe('Mongo notificationEndpointModel', () => {

  // Db field name
  it('Field name should throw error if invalid name is created', (done) => {
    var notificationEndpointModel = new NotificationEndpointSchema({ name: '' })

    notificationEndpointModel.validate((err) => {
      Expect(err.errors.name).to.exist
      done()
    })
  })

  it('Field name should succeed if name is created', (done) => {
    var notificationEndpointModel = new NotificationEndpointSchema({ name: 'dfsp1' })

    notificationEndpointModel.validate((err) => {
      Expect(!err)
      done()
    })
  })

  // Db field type
  it('Field type should throw error if invalid object is created', (done) => {
    var notificationEndpointModel = new NotificationEndpointSchema({ type: '' })

    notificationEndpointModel.validate((err) => {
      Expect(err.errors.type).to.exist
      done()
    })
  })

  it('Field type should succeed if an object is created', (done) => {
    var notificationEndpointModel = new NotificationEndpointSchema({ type: Object })

    notificationEndpointModel.validate((err) => {
      Expect(!err)
      done()
    })
  })

  // Db field action
  it('Field action should throw error if invalid action is created', (done) => {
    var notificationEndpointModel = new NotificationEndpointSchema()

    notificationEndpointModel.validate((err) => {
      Assert.isUndefined(notificationEndpointModel.action, 'no action defined')
      done()
    })
  })

  it('Field action should succeed if action is created', (done) => {
    var notificationEndpointModel = new NotificationEndpointSchema({ action: 'Test' })

    notificationEndpointModel.validate((err) => {
      Expect(!err)
      done()
    })
  })

  // Db field value
  it('Field value should throw error if invalid value is created', (done) => {
    var notificationEndpointModel = new NotificationEndpointSchema({ value: '' })

    notificationEndpointModel.validate((err) => {
      Expect(err.errors.value).to.exist
      done()
    })
  })

  it('Field value should succeed if value is created', (done) => {
    var notificationEndpointModel = new NotificationEndpointSchema({ value: true })

    notificationEndpointModel.validate((err) => {
      Expect(!err)
      done()
    })
  })
})