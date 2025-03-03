const test = require('tape')
const sinon = require('sinon')
const axios = require('axios')
// const Rx = require('rxjs')
// const Logger = require('@mojaloop/central-services-logger')
const Config = require('../../../src/lib/config')
const EventModel = require('../../../src/models/events').eventModel
const CurrentPositionModel = require('../../../src/models/currentPosition').currentPositionModel
const NotificationEndpointModel = require('../../../src/models/notificationEndpoint').notificationEndpointModel
// const Enums = require('../../../src/lib/enum')
const centralLedgerAPI = require('../../../src/observables/centralLedgerAPI')

test('getParticipantEndpointsFromResponseObservable', async (t) => {
  const message = {
    value: {
      from: 'payerFsp',
      to: 'payeeFsp',
      content: {
        payload: {
          currency: 'USD',
          value: '100'
        }
      },
      id: '12345'
    }
  }

  const payeeNotificationResponse = [{ type: 'EMAIL', value: 'payee@example.com' }]
  const hubNotificationResponse = [{ type: 'EMAIL', value: 'hub@example.com' }]
  const dbEvent = { id: 'event123', action: 'action', notificationEndpointType: 'EMAIL', templateType: 'template', language: 'en' }
  const currentPositionForSettlementChange = { id: 'position123' }

  sinon.stub(axios, 'get')
    .withArgs(`http://${Config.get('centralLedgerAPI').adminHost}:${Config.get('centralLedgerAPI').adminPort}/participants/payeeFsp/endpoints`)
    .resolves({ data: payeeNotificationResponse })
    .withArgs(`http://${Config.get('centralLedgerAPI').adminHost}:${Config.get('centralLedgerAPI').adminPort}/participants/HUB/endpoints`)
    .resolves({ data: hubNotificationResponse })

  sinon.stub(EventModel, 'findOne').resolves(null)
  sinon.stub(EventModel, 'create').resolves(dbEvent)
  sinon.stub(CurrentPositionModel, 'findOne').resolves(null)
  sinon.stub(CurrentPositionModel, 'create').resolves(currentPositionForSettlementChange)
  sinon.stub(NotificationEndpointModel, 'findOneAndUpdate').resolves({ toObject: () => ({}) })

  const observer = {
    next: sinon.spy(),
    error: sinon.spy()
  }

  const observable = centralLedgerAPI.getParticipantEndpointsFromResponseObservable(message)
  observable.subscribe(observer)

  setTimeout(() => {
    t.ok(observer.next.calledOnce, 'observer.next should be called once')
    t.deepEqual(observer.next.firstCall.args[0], {
      action: 'produceToKafkaTopic',
      params: {
        dfsp: 'payeeFsp',
        value: '100',
        triggeredBy: 'position123',
        repetitionsAllowed: 1,
        fromEvent: 'event123',
        action: 'action',
        notificationEndpointType: 'EMAIL',
        templateType: 'template',
        language: 'en',
        messageSubject: 'Settlement Position Change'
      },
      message
    }, 'observer.next should be called with correct arguments')
    t.end()
  }, 100)

  sinon.restore()
})
