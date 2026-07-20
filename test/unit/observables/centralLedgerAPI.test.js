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
 --------------
 ******/

'use strict'

const test = require('tapes')(require('tape'))
const rewire = require('rewire')
const Sinon = require('sinon')

const buildMessage = () => ({
  value: {
    from: 'payerfsp',
    to: 'payeefsp',
    id: 'transfer-id-1',
    content: {
      payload: { currency: 'USD', value: 100 }
    }
  }
})

const endpointsResponse = [
  { type: 'NET_DEBIT_CAP_ADJUSTMENT_EMAIL', value: 'ops@dfsp.com' },
  { type: 'SOME_UNMAPPED_TYPE', value: 'other@dfsp.com' }
]

const notificationEndpointRecord = (name, endpoint) => ({
  toObject: () => ({ name, type: endpoint.type, value: endpoint.value })
})

const subscribeOnce = observable => new Promise((resolve, reject) => {
  observable.subscribe({ next: resolve, error: reject })
})

const rewireModule = () => rewire('../../../src/observables/centralLedgerAPI')

test('centralLedgerAPI Tests : ', async centralLedgerAPITest => {
  centralLedgerAPITest.test('getPositionsFromResponse should map positions by currency', test => {
    const mod = rewireModule()
    const getPositionsFromResponse = mod.__get__('getPositionsFromResponse')

    const result = getPositionsFromResponse([
      { currency: 'USD', value: 100 },
      { currency: 'EUR', value: 200 }
    ])

    test.deepEqual(result, { USD: 100, EUR: 200 })
    test.end()
  })

  centralLedgerAPITest.test('getParticipantEndpointsFromMessageResponse should return endpoint data', async test => {
    const mod = rewireModule()
    mod.__set__('axios', { get: Sinon.stub().resolves({ data: endpointsResponse }) })
    const getParticipantEndpointsFromMessageResponse = mod.__get__('getParticipantEndpointsFromMessageResponse')

    const result = await getParticipantEndpointsFromMessageResponse('payerfsp')

    test.deepEqual(result, endpointsResponse)
    test.end()
  })

  centralLedgerAPITest.test('getParticipantEndpointsFromMessageResponse should return unknown participant on error', async test => {
    const mod = rewireModule()
    mod.__set__('axios', { get: Sinon.stub().rejects(new Error('connection refused')) })
    const getParticipantEndpointsFromMessageResponse = mod.__get__('getParticipantEndpointsFromMessageResponse')

    const result = await getParticipantEndpointsFromMessageResponse('payerfsp')

    test.deepEqual(result, [{ type: 'UNKNOWN_PARTICIPANT', value: 'DO_NOT_NOTIFY' }])
    test.end()
  })

  centralLedgerAPITest.test('createEventsForParticipantSettlementPositionChange should return existing event', async test => {
    const mod = rewireModule()
    const existingEvent = { id: 'event-1', action: 'sendEmail' }
    const findOne = Sinon.stub().resolves(existingEvent)
    mod.__set__('EventModel', { findOne })
    const createEvents = mod.__get__('createEventsForParticipantSettlementPositionChange')

    const result = await createEvents(buildMessage())

    test.deepEqual(result, existingEvent)
    test.ok(findOne.calledOnce)
    test.end()
  })

  centralLedgerAPITest.test('createEventsForParticipantSettlementPositionChange should create event when none exists', async test => {
    const mod = rewireModule()
    const create = Sinon.stub().resolves()
    mod.__set__('EventModel', { findOne: Sinon.stub().resolves(null), create })
    const createEvents = mod.__get__('createEventsForParticipantSettlementPositionChange')

    const result = await createEvents(buildMessage())

    test.equal(result.name, 'payeefsp')
    test.equal(result.currency, 'USD')
    test.equal(result.notificationEndpointType, 'SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL')
    test.ok(create.calledOnceWith(result))
    test.end()
  })

  centralLedgerAPITest.test('createEventsForParticipantSettlementPositionChange should throw on db error', async test => {
    const mod = rewireModule()
    mod.__set__('EventModel', { findOne: Sinon.stub().rejects(new Error('db down')) })
    const createEvents = mod.__get__('createEventsForParticipantSettlementPositionChange')

    try {
      await createEvents(buildMessage())
      test.fail('should have thrown')
    } catch (err) {
      test.ok(err, 'error thrown')
    }
    test.end()
  })

  centralLedgerAPITest.test('storeCurrentPositionForSettlementChange should return existing record', async test => {
    const mod = rewireModule()
    const existingRecord = { id: 'position-1' }
    mod.__set__('CurrentPositionModel', { findOne: Sinon.stub().resolves(existingRecord) })
    const storeCurrentPosition = mod.__get__('storeCurrentPositionForSettlementChange')

    const result = await storeCurrentPosition(buildMessage())

    test.deepEqual(result, existingRecord)
    test.end()
  })

  centralLedgerAPITest.test('storeCurrentPositionForSettlementChange should create record when none exists', async test => {
    const mod = rewireModule()
    const create = Sinon.stub().resolves()
    mod.__set__('CurrentPositionModel', { findOne: Sinon.stub().resolves(null), create })
    const storeCurrentPosition = mod.__get__('storeCurrentPositionForSettlementChange')

    const result = await storeCurrentPosition(buildMessage())

    test.equal(result.name, 'payeefsp')
    test.equal(result.positionType, 'settlement')
    test.equal(result.positionValue, '100.0000', 'value formatted via MLNumber to configured scale')
    test.equal(result.transferId, 'transfer-id-1')
    test.ok(create.calledOnceWith(result))
    test.end()
  })

  centralLedgerAPITest.test('storeCurrentPositionForSettlementChange should throw on db error', async test => {
    const mod = rewireModule()
    mod.__set__('CurrentPositionModel', { findOne: Sinon.stub().rejects(new Error('db down')) })
    const storeCurrentPosition = mod.__get__('storeCurrentPositionForSettlementChange')

    try {
      await storeCurrentPosition(buildMessage())
      test.fail('should have thrown')
    } catch (err) {
      test.ok(err, 'error thrown')
    }
    test.end()
  })

  centralLedgerAPITest.test('getParticipantEndpointsFromResponseObservable should emit kafka action params', async test => {
    const mod = rewireModule()
    mod.__set__('axios', { get: Sinon.stub().resolves({ data: endpointsResponse }) })
    mod.__set__('EventModel', {
      findOne: Sinon.stub().resolves({
        id: 'event-1',
        action: 'sendEmail',
        notificationEndpointType: 'SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL',
        templateType: 'settlement',
        language: 'en'
      })
    })
    mod.__set__('CurrentPositionModel', { findOne: Sinon.stub().resolves({ id: 'position-1' }) })
    mod.__set__('NotificationEndpointModel', {
      findOneAndUpdate: Sinon.stub().callsFake((filter, doc) => Promise.resolve(notificationEndpointRecord(filter.name, doc)))
    })
    const getParticipantEndpointsFromResponseObservable = mod.__get__('getParticipantEndpointsFromResponseObservable')

    const result = await subscribeOnce(getParticipantEndpointsFromResponseObservable(buildMessage()))

    test.equal(result.action, 'produceToKafkaTopic')
    test.equal(result.params.dfsp, 'payeefsp')
    test.equal(result.params.value, 100)
    test.equal(result.params.triggeredBy, 'position-1')
    test.equal(result.params.fromEvent, 'event-1')
    test.equal(result.params.messageSubject, 'Settlement Position Change')
    test.end()
  })

  centralLedgerAPITest.test('getParticipantEndpointsFromResponseObservable should error when event lookup fails', async test => {
    const mod = rewireModule()
    mod.__set__('axios', { get: Sinon.stub().resolves({ data: endpointsResponse }) })
    mod.__set__('EventModel', { findOne: Sinon.stub().rejects(new Error('db down')) })
    mod.__set__('CurrentPositionModel', { findOne: Sinon.stub().resolves({ id: 'position-1' }) })
    const getParticipantEndpointsFromResponseObservable = mod.__get__('getParticipantEndpointsFromResponseObservable')

    try {
      await subscribeOnce(getParticipantEndpointsFromResponseObservable(buildMessage()))
      test.fail('should have errored')
    } catch (err) {
      test.ok(err, 'observable errored')
    }
    test.end()
  })

  centralLedgerAPITest.test('prepareCurrentPosition should build current position views for limits with matching positions', test => {
    const mod = rewireModule()
    const prepareCurrentPosition = mod.__get__('prepareCurrentPosition')

    const positions = { USD: 1000, EUR: 500 }
    const limits = [
      { currency: 'USD', value: 10000 },
      { currency: 'EUR', value: 2000 }
    ]

    const result = prepareCurrentPosition('dfsp1', positions, limits, 'transfer-id-1', '{}')

    test.equal(result.length, 2, 'one view per limit')
    test.equal(result[0].currency, 'USD')
    test.equal(result[0].positionValue, '1000.0000')
    test.equal(result[0].percentage, 90)
    test.equal(result[1].currency, 'EUR')
    test.equal(result[1].positionValue, '500.0000')
    test.equal(result[1].percentage, 75)
    test.end()
  })

  centralLedgerAPITest.test('prepareCurrentPosition should skip limits for currencies with no position instead of throwing', test => {
    const mod = rewireModule()
    const prepareCurrentPosition = mod.__get__('prepareCurrentPosition')

    const positions = { USD: 1000 }
    const limits = [
      { currency: 'USD', value: 10000 },
      { currency: 'XOF', value: 5000 } // limit exists but participant has no XOF position
    ]

    const result = prepareCurrentPosition('dfsp1', positions, limits, 'transfer-id-1', '{}')

    test.equal(result.length, 1, 'limit without a matching position is skipped')
    test.equal(result[0].currency, 'USD')
    test.equal(result[0].positionValue, '1000.0000')
    test.end()
  })

  centralLedgerAPITest.test('prepareCurrentPosition should throw a reformatted error on invalid limits', test => {
    const mod = rewireModule()
    const prepareCurrentPosition = mod.__get__('prepareCurrentPosition')

    try {
      prepareCurrentPosition('dfsp1', {}, null, 'transfer-id-1', '{}')
      test.fail('should have thrown')
    } catch (err) {
      test.ok(err, 'error thrown')
    }
    test.end()
  })

  centralLedgerAPITest.test('updateNotificationEndpointsFromResponse should upsert endpoints and default unmapped actions', async test => {
    const mod = rewireModule()
    const findOneAndUpdate = Sinon.stub().callsFake((filter, doc) => Promise.resolve(notificationEndpointRecord(filter.name, doc)))
    mod.__set__('NotificationEndpointModel', { findOneAndUpdate })
    const updateNotificationEndpointsFromResponse = mod.__get__('updateNotificationEndpointsFromResponse')

    const result = await updateNotificationEndpointsFromResponse('payerfsp', endpointsResponse)

    test.equal(result.length, 2)
    test.equal(findOneAndUpdate.callCount, 2)
    test.equal(findOneAndUpdate.firstCall.args[1].action, 'sendEmail', 'mapped endpoint type resolves its action')
    test.equal(findOneAndUpdate.secondCall.args[1].action, '', 'unmapped endpoint type defaults to empty action')
    test.end()
  })

  centralLedgerAPITest.test('updateNotificationEndpointsFromResponse should throw on db error', async test => {
    const mod = rewireModule()
    mod.__set__('NotificationEndpointModel', { findOneAndUpdate: Sinon.stub().rejects(new Error('db down')) })
    const updateNotificationEndpointsFromResponse = mod.__get__('updateNotificationEndpointsFromResponse')

    try {
      await updateNotificationEndpointsFromResponse('payerfsp', endpointsResponse)
      test.fail('should have thrown')
    } catch (err) {
      test.ok(err, 'error thrown')
    }
    test.end()
  })

  centralLedgerAPITest.test('getDfspNotificationEndpointsObservable should emit notifications for payer, payee and hub', async test => {
    const mod = rewireModule()
    mod.__set__('axios', { get: Sinon.stub().resolves({ data: endpointsResponse }) })
    mod.__set__('NotificationEndpointModel', {
      findOneAndUpdate: Sinon.stub().callsFake((filter, doc) => Promise.resolve(notificationEndpointRecord(filter.name, doc)))
    })
    const getDfspNotificationEndpointsObservable = mod.__get__('getDfspNotificationEndpointsObservable')

    const result = await subscribeOnce(getDfspNotificationEndpointsObservable(buildMessage()))

    test.equal(result.notifications.payerfsp.length, 2)
    test.equal(result.notifications.payeefsp.length, 2)
    test.equal(result.notifications.Hub.length, 2)
    test.end()
  })

  centralLedgerAPITest.test('getDfspNotificationEndpointsObservable should error when endpoint request fails', async test => {
    const mod = rewireModule()
    mod.__set__('axios', { get: Sinon.stub().rejects(new Error('connection refused')) })
    const getDfspNotificationEndpointsObservable = mod.__get__('getDfspNotificationEndpointsObservable')

    try {
      await subscribeOnce(getDfspNotificationEndpointsObservable(buildMessage()))
      test.fail('should have errored')
    } catch (err) {
      test.ok(err, 'observable errored')
    }
    test.end()
  })

  centralLedgerAPITest.test('getDfspNotificationEndpointsForLimitObservable should emit notifications for fsp and hub', async test => {
    const mod = rewireModule()
    mod.__set__('axios', { get: Sinon.stub().resolves({ data: endpointsResponse }) })
    mod.__set__('NotificationEndpointModel', {
      findOneAndUpdate: Sinon.stub().callsFake((filter, doc) => Promise.resolve(notificationEndpointRecord(filter.name, doc)))
    })
    const getDfspNotificationEndpointsForLimitObservable = mod.__get__('getDfspNotificationEndpointsForLimitObservable')

    const result = await subscribeOnce(getDfspNotificationEndpointsForLimitObservable(buildMessage()))

    test.equal(result.notifications.payerfsp.length, 2)
    test.equal(result.notifications.Hub.length, 2)
    test.end()
  })

  centralLedgerAPITest.test('getDfspNotificationEndpointsForLimitObservable should error when endpoint request fails', async test => {
    const mod = rewireModule()
    mod.__set__('axios', { get: Sinon.stub().rejects(new Error('connection refused')) })
    const getDfspNotificationEndpointsForLimitObservable = mod.__get__('getDfspNotificationEndpointsForLimitObservable')

    try {
      await subscribeOnce(getDfspNotificationEndpointsForLimitObservable(buildMessage()))
      test.fail('should have errored')
    } catch (err) {
      test.ok(err, 'observable errored')
    }
    test.end()
  })

  centralLedgerAPITest.test('requestPositionPerName should return position data', async test => {
    const mod = rewireModule()
    const positions = [{ currency: 'USD', value: 900 }]
    mod.__set__('axios', { get: Sinon.stub().resolves({ data: positions }) })
    const requestPositionPerName = mod.__get__('requestPositionPerName')

    const result = await requestPositionPerName('payerfsp')

    test.deepEqual(result, positions)
    test.end()
  })

  centralLedgerAPITest.test('requestPositionPerName should throw a reformatted error on failure', async test => {
    const mod = rewireModule()
    mod.__set__('axios', { get: Sinon.stub().rejects(new Error('connection refused')) })
    const requestPositionPerName = mod.__get__('requestPositionPerName')

    try {
      await requestPositionPerName('payerfsp')
      test.fail('should have thrown')
    } catch (err) {
      test.ok(err, 'error thrown')
    }
    test.end()
  })

  centralLedgerAPITest.test('getPositionsObservable should store and emit current positions for payer and payee', async test => {
    const mod = rewireModule()
    mod.__set__('axios', { get: Sinon.stub().resolves({ data: [{ currency: 'USD', value: 900 }] }) })
    mod.__set__('LimitModel', { find: Sinon.stub().resolves([{ currency: 'USD', value: 1000 }]) })
    const insertMany = Sinon.stub().callsFake((docs, cb) => cb(null, docs))
    mod.__set__('CurrentPositionModel', { insertMany })
    const getPositionsObservable = mod.__get__('getPositionsObservable')

    const result = await subscribeOnce(getPositionsObservable({ message: buildMessage() }))

    test.equal(result.positions.length, 2, 'one current position per participant')
    test.equal(result.positions[0].name, 'payerfsp')
    test.equal(result.positions[0].positionValue, '900.0000')
    test.equal(result.positions[0].percentage, 10)
    test.equal(result.positions[1].name, 'payeefsp')
    test.deepEqual(result.message, buildMessage())
    test.ok(insertMany.calledOnce)
    test.end()
  })

  centralLedgerAPITest.test('getPositionsObservable should error when the positions request fails', async test => {
    const mod = rewireModule()
    mod.__set__('axios', { get: Sinon.stub().rejects(new Error('connection refused')) })
    mod.__set__('LimitModel', { find: Sinon.stub().resolves([]) })
    const getPositionsObservable = mod.__get__('getPositionsObservable')

    try {
      await subscribeOnce(getPositionsObservable({ message: buildMessage() }))
      test.fail('should have errored')
    } catch (err) {
      test.ok(err, 'observable errored')
    }
    test.end()
  })

  centralLedgerAPITest.test('getPositionsObservable should error when persisting positions fails', async test => {
    const mod = rewireModule()
    mod.__set__('axios', { get: Sinon.stub().resolves({ data: [{ currency: 'USD', value: 900 }] }) })
    mod.__set__('LimitModel', { find: Sinon.stub().resolves([{ currency: 'USD', value: 1000 }]) })
    mod.__set__('CurrentPositionModel', { insertMany: Sinon.stub().callsFake((docs, cb) => cb(new Error('db down'))) })
    const getPositionsObservable = mod.__get__('getPositionsObservable')

    try {
      await subscribeOnce(getPositionsObservable({ message: buildMessage() }))
      test.fail('should have errored')
    } catch (err) {
      test.ok(err, 'observable errored')
    }
    test.end()
  })

  centralLedgerAPITest.end()
})
