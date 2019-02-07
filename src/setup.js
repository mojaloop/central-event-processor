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

/**
 * @module src/setup
 */

const Consumer = require('./lib/kafka/consumer')
const Utility = require('./lib/utility')
const Logger = require('@mojaloop/central-services-shared').Logger
const Rx = require('rxjs')
const { filter, switchMap } = require('rxjs/operators')
const Enum = require('./lib/enum')
const TransferEventType = Enum.transferEventType
const TransferEventAction = Enum.transferEventAction
const Observables = require('./observables')
const createHealthcheck = require('healthcheck-server')
const Config = require('./lib/config')

const setup = async () => {
  let db = await require('./lib/database').db()

  await Consumer.registerNotificationHandler()

  const topicName = Utility.transformGeneralTopicName(Utility.ENUMS.NOTIFICATION, Utility.ENUMS.EVENT)
  const consumer = Consumer.getConsumer(topicName)

  createHealthcheck({
    port: Config.get('PORT'),
    path: '/health',
    status: ({ cpu, memory }) => {
      try {
        if (db.readyState && consumer._status.running) return true
        else return false
      } catch (err) {
        return false
      }
    }
  })

  const topicObservable = Rx.Observable.create((observer) => {
    consumer.on('message', async (data) => {
      Logger.info(`Central-Event-Processor :: Topic ${topicName} :: Payload: \n${JSON.stringify(data.value, null, 2)}`)
      observer.next(data)
      if (!Consumer.isConsumerAutoCommitEnabled(topicName)) {
        consumer.commitMessageSync(data)
      }
    })
  })

  const generalObservable = topicObservable
    .pipe(filter(data => data.value.metadata.event.action === 'commit'),
      switchMap(Observables.CentralLedgerAPI.getDfspNotificationEndpointsObservable),
      switchMap(Observables.CentralLedgerAPI.getPositionsObservable),
      switchMap(Observables.Rules.ndcBreachObservable),
      switchMap(Observables.actionObservable))

  generalObservable.subscribe({
    next: async ({ actionResult, message }) => {
      if (!actionResult) {
        Logger.info(`action unsuccessful. Publishing the message to topic ${topicName}`)
        // TODO consider should we change the state and produce error message instead of republish?
        await Utility.produceGeneralMessage(TransferEventType.NOTIFICATION, TransferEventAction.EVENT, message, Utility.ENUMS.STATE.SUCCESS)
      }
      Logger.info(actionResult)
    },
    error: err => Logger.info('Error occured: ', err),
    completed: (value) => Logger.info('completed with value', value)
  })

  const limitAdjustmentObservable = topicObservable
    .pipe(filter(data => data.value.metadata.event.action === 'limit-adjustment' && 'limit' in data.value.content.payload),
      switchMap(Observables.CentralLedgerAPI.getDfspNotificationEndpointsForLimitObservable),
      switchMap(Observables.Store.getLimitsPerNameObservable),
      switchMap(Observables.Rules.ndcAdjustmentObservable),
      switchMap(Observables.actionObservable)
    )

  limitAdjustmentObservable.subscribe({
    next: async ({ actionResult, message }) => {
      if (!actionResult) {
        Logger.info(`action unsuccessful. Publishing the message to topic ${topicName}`)
        await Utility.produceGeneralMessage(TransferEventType.NOTIFICATION, TransferEventAction.EVENT, message, Utility.ENUMS.STATE.SUCCESS)
      }
      Logger.info(actionResult)
    },
    error: err => Logger.info('Error occured: ', err),
    completed: (value) => Logger.info('completed with value', value)
  })

  const settlementTransferPositionChangeObservable = topicObservable
    .pipe(filter(data => data.value.metadata.event.action === 'settlement-transfer-position-change'),
      switchMap(Observables.CentralLedgerAPI.getParticipantEndpointsFromResponseObservable),
      switchMap(Observables.actionObservable))

  settlementTransferPositionChangeObservable.subscribe({
    next: async ({ actionResult, message }) => {
      if (!actionResult) {
        Logger.info(`action unsuccessful. Publishing the message to topic ${topicName}`)
        // TODO we should change the state and produce error message instead of republish?
        await Utility.produceGeneralMessage(TransferEventType.NOTIFICATION, TransferEventAction.EVENT, message, Utility.ENUMS.STATE.SUCCESS)
      }
      Logger.info(actionResult)
    },
    error: err => Logger.info('Error occured: ', err),
    completed: (value) => Logger.info('completed with value', value)
  })
}

module.exports = {
  setup
}
