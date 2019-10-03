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
 - Shashikant Hirugade <shashikant.hirugade@modusbox.com>
 --------------
 ******/

'use strict'

const Rx = require('rxjs')
const Logger = require('@mojaloop/central-services-logger')
const test = require('tapes')(require('tape'))
const Utility = require('../../../src/lib/utility')
const Sinon = require('sinon')
const ndcBreachObservable = require('../../../src/observables/actions').ndcBreachObservable
const LimitModel = require('../../../src/models/limits').limitModel
const EventModel = require('../../../../src/models/events').eventModel
const ActionModel = require('../../../src/models/action').actionModel
const Enums = require('../../../../src/lib/enum')

test('RxJs Observable Tests (Action Observable) : ', async actionTest => {
  Sinon.config = {
    useFakeTimers: false
  }
  let sandbox
  let positionInput = {
    name: 'dfsp1',
    currency: 'USD',
    percentage: 10.00,
    positionValue: 100,
    triggeredBy: '51bb793aca2ab77a3200000d'
    // save: () => {return P.resolve()}
  }
  let limitResult = {
    name: 'dfsp1',
    currency: 'USD',
    type: 'NET_DEBIT_CAP',
    threshold: 20,
    repetitions: 3
  }
  let eventResult = {
    name: 'dfsp1',
    currency: 'USD',
    limitType: 'NET_DEBIT_CAP',
    action: 'produceToKafkaTopic',
    notificationEndpointType: 'NET_DEBIT_CAP_THRESHOLD_BREACH_EMAIL',
    isActive: true,
    id: '51bb793aca2ab77a3200000d',
    templateType: 'templateType',
    language: 'EN'
  }

  actionTest.beforeEach(test => {
    sandbox = Sinon.createSandbox()
    sandbox.stub(LimitModel, 'findOne')
    sandbox.stub(EventModel, 'findOne')
    sandbox.stub(ActionModel, 'find')
    sandbox.stub(findByIdAndUpdate, 'find')

   /* sandbox.stub(Rx, 'asyncScheduler')
    Rx.asyncScheduler.returns({schedule: () => {return P.resolve()}})*/
    /*sandbox
      .stub(ClearRepetitiontask,'Rx.Scheduler.async.schedule')
      .returns(P.resolve());*/

    // sandbox.stub(Rx.prototype, 'asyncScheduler')

    sandbox.stub(Utility)

    Utility.produceGeneralMessage.returns(P.resolve())
    test.end()
  })

  actionTest.afterEach(test => {
    sandbox.restore()
    test.end()
  })

  await actionTest.test('Should return completed when the action is "finish"', async assert => {
