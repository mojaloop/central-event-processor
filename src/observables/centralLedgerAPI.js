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

 * ModusBox
 - Georgi Georgiev <georgi.georgiev@modusbox.com>
 - Valentin Genev <valentin.genev@modusbox.com>
 - Deon Botha <deon.botha@modusbox.com>

 --------------
 ******/
'use strict'

const request = require('request-promise')
const Rx = require('rxjs')
const Logger = require('@mojaloop/central-services-logger')
const MLNumber = require('@mojaloop/ml-number')
const Config = require('../lib/config')
const CurrentPositionModel = require('../models/currentPosition').currentPositionModel
const LimitModel = require('../models/limits').limitModel
const NotificationEndpointModel = require('../models/notificationEndpoint').notificationEndpointModel
const EventModel = require('../models/events').eventModel
const Enums = require('../lib/enum')
const centralLedgerAPIConfig = Config.get('centralLedgerAPI')
const centralLedgerAdminURI = `${centralLedgerAPIConfig.adminHost}:${centralLedgerAPIConfig.adminPort}`
const hubName = Config.get('HUB_PARTICIPANT').NAME
const ErrorHandler = require('@mojaloop/central-services-error-handling')

const getPositionsFromResponse = positions => {
  const positionObject = {}
  for (const position of positions) {
    positionObject[position.currency] = position.value
  }
  return positionObject
}

const getParticipantEndpointsFromMessageResponse = async participantName => {
  const unKnownParticipantObjArray = [{
    type: 'UNKNOWN_PARTICIPANT',
    value: 'DO_NOT_NOTIFY'
  }]

  try {
    const participantEndpointsObjArray = await request({
      uri: `http://${centralLedgerAdminURI}/participants/${participantName}/endpoints`,
      json: true
    })
    return participantEndpointsObjArray
  } catch (err) {
    Logger.info(`getParticipantEndpointsFromResponse failed with error: ${err}`)
    return unKnownParticipantObjArray
  }
}

const createEventsForParticipantSettlementPositionChange = async (message) => {
  try {
    const notificationActions = Enums.notificationActionMap['SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL']
    const eventRecord = await EventModel.findOne({
      name: message.value.to,
      currency: message.value.content.payload.currency,
      notificationEndpointType: notificationActions.enum
    })
    if (!eventRecord) {
      const newEvent = {
        name: message.value.to,
        currency: message.value.content.payload.currency,
        notificationEndpointType: notificationActions.enum,
        limitType: notificationActions.enum,
        action: notificationActions.action,
        templateType: notificationActions.templateType,
        language: notificationActions.language
      }
      await EventModel.create(newEvent)
      return newEvent
    } else {
      return eventRecord
    }
  } catch (err) {
    Logger.info(`createEventsForParticipant exit with error: ${err}`)
    throw ErrorHandler.Factory.reformatFSPIOPError(err)
  }
}

const storeCurrentPositionForSettlementChange = async (message) => {
  try {
    const currentPositionRecord = await CurrentPositionModel.findOne({
      name: message.value.to,
      positionType: 'settlement',
      currency: message.value.content.payload.currency,
      positionValue: new MLNumber(message.value.content.payload.value).toFixed(Config.get('AMOUNT.SCALE'))
    })
    if (!currentPositionRecord) {
      const newCurrentPosition = {
        name: message.value.to,
        positionType: 'settlement',
        currency: message.value.content.payload.currency,
        positionValue: new MLNumber(message.value.content.payload.value).toFixed(Config.get('AMOUNT.SCALE')),
        transferId: message.value.id,
        messagePayload: JSON.stringify(message.value.content.payload)
      }
      await CurrentPositionModel.create(newCurrentPosition)
      return newCurrentPosition
    } else {
      return currentPositionRecord
    }
  } catch (err) {
    Logger.info(`storeCurrentPositionForSettlementChange exit with error: ${err}`)
    throw ErrorHandler.Factory.reformatFSPIOPError(err)
  }
}

// settlement position change
const getParticipantEndpointsFromResponseObservable = message => {
  return Rx.Observable.create(async observer => {
    /*
    payerFsp = message.value.from
    payeeFsp = message.value.to
    */
    try {
      const [payeeNotificationResponse, hubNotificationResponse, dbEvent, currentPositionForSettlementChange] = await Promise.all([
        getParticipantEndpointsFromMessageResponse(message.value.to),
        getParticipantEndpointsFromMessageResponse(hubName),
        createEventsForParticipantSettlementPositionChange(message),
        storeCurrentPositionForSettlementChange(message)
      ])

      // Persist endpoints in CEP storage
      const payeeNotificationEndpoints = await updateNotificationEndpointsFromResponse(message.value.to, payeeNotificationResponse)
      const hubNotificationEndpoints = await updateNotificationEndpointsFromResponse(hubName, hubNotificationResponse)

      const notifications = {}
      notifications[message.value.to] = payeeNotificationEndpoints
      notifications.Hub = hubNotificationEndpoints

      const params = {
        dfsp: message.value.to,
        value: message.value.content.payload.value,
        triggeredBy: currentPositionForSettlementChange.id,
        repetitionsAllowed: 1,
        fromEvent: dbEvent.id,
        action: dbEvent.action,
        notificationEndpointType: dbEvent.notificationEndpointType,
        templateType: dbEvent.templateType,
        language: dbEvent.language,
        messageSubject: `Settlement Position Change`
      }

      observer.next({
        action: 'produceToKafkaTopic',
        params: params,
        message
      })
    } catch (err) {
      Logger.info(`getParticipantEndpointsFromResponseObservable failed with error: ${err}`)
      observer.error(err)
    }
  })
}

const prepareCurrentPosition = (name, positions, limits, transferId, messagePayload) => {
  const viewsArray = []
  try {
    limits.forEach(limit => {
      const percentage = 100 - (positions[limit.currency] * 100 / limit.value)
      const currentPosition = {
        name,
        currency: limit.currency,
        positionValue: new MLNumber(positions[limit.currency]).toFixed(Config.get('AMOUNT.SCALE')),
        percentage,
        transferId,
        positionType: 'transfer',
        messagePayload
      }
      viewsArray.push(currentPosition)
    })
    return viewsArray
  } catch (err) {
    throw ErrorHandler.Factory.reformatFSPIOPError(err)
  }
}

const updateNotificationEndpointsFromResponse = async (name, notificationEndpoints) => {
  const result = []
  try {
    for (const notificationEndpoint of notificationEndpoints) {
      const action = Enums.notificationActionMap[notificationEndpoint.type] ? Enums.notificationActionMap[notificationEndpoint.type].action : ''
      const notificationRecord = await NotificationEndpointModel
        .findOneAndUpdate({
          name,
          type: notificationEndpoint.type
        },
        {
          name,
          type: notificationEndpoint.type,
          value: notificationEndpoint.value,
          action
        }, {
          upsert: true,
          new: true
        })
      result.push(notificationRecord.toObject())
    }
  } catch (err) {
    throw ErrorHandler.Factory.reformatFSPIOPError(err)
  }
  return result
}

// TODO rework per name and loop the message over from and to
const getDfspNotificationEndpointsObservable = message => {
  return Rx.Observable.create(async observer => {
    const payerFsp = message.value.from
    const payeeFsp = message.value.to
    try {
      const [payerNotificationResponse, payeeNotificationResponse, hubNotificationResponse] = await Promise.all([
        request({ uri: `http://${centralLedgerAdminURI}/participants/${payerFsp}/endpoints`, json: true }),
        request({ uri: `http://${centralLedgerAdminURI}/participants/${payeeFsp}/endpoints`, json: true }),
        request({ uri: `http://${centralLedgerAdminURI}/participants/${Config.get('HUB_PARTICIPANT').NAME}/endpoints`, json: true })
      ])
      const payerNotificationEndpoints = await updateNotificationEndpointsFromResponse(payerFsp, payerNotificationResponse)
      const payeeNotificationEndpoints = await updateNotificationEndpointsFromResponse(payeeFsp, payeeNotificationResponse)
      const hubNotificationEndpoints = await updateNotificationEndpointsFromResponse(hubName, hubNotificationResponse)
      const notifications = {}
      notifications[payerFsp] = payerNotificationEndpoints
      notifications[payeeFsp] = payeeNotificationEndpoints
      notifications.Hub = hubNotificationEndpoints
      observer.next({
        message,
        notifications
      })
    } catch (err) {
      Logger.info(`DfspNotificationEndpoints failed with error: ${err}`)
      observer.error(err)
    }
  })
}

const getDfspNotificationEndpointsForLimitObservable = message => {
  return Rx.Observable.create(async observer => {
    const fsp = message.value.from
    try {
      const [fspNotificationResponse, hubNotificationResponse] = await Promise.all([
        request({ uri: `http://${centralLedgerAdminURI}/participants/${fsp}/endpoints`, json: true }),
        request({ uri: `http://${centralLedgerAdminURI}/participants/${Config.get('HUB_PARTICIPANT').NAME}/endpoints`, json: true })
      ])
      const fspNotificationEndpoints = await updateNotificationEndpointsFromResponse(fsp, fspNotificationResponse)
      const hubNotificationEndpoints = await updateNotificationEndpointsFromResponse(hubName, hubNotificationResponse)
      const notifications = {}
      notifications[fsp] = fspNotificationEndpoints
      notifications.Hub = hubNotificationEndpoints
      observer.next({
        message,
        notifications
      })
    } catch (err) {
      Logger.info(`DfspNotificationEndpoints failed with error: ${err}`)
      observer.error(err)
    }
  })
}

const requestPositionPerName = async (name) => {
  try {
    const position = await request({ uri: `http://${centralLedgerAdminURI}/participants/${name}/positions`, json: true })
    return position
  } catch (err) {
    throw ErrorHandler.Factory.reformatFSPIOPError(err)
  }
}

const getPositionsObservable = ({ message }) => {
  const payerFsp = message.value.from
  const payeeFsp = message.value.to
  const transferId = message.value.id
  const messagePayload = JSON.stringify(message.value.content.payload)
  return Rx.Observable.create(async observer => {
    try {
      const [payerPositionsResponse, payeePositionsResponse, payerLimits, payeeLimits] = await Promise.all([
        requestPositionPerName(payerFsp),
        requestPositionPerName(payeeFsp),
        LimitModel.find({ name: payerFsp }),
        LimitModel.find({ name: payeeFsp })
      ]).catch(err => {
        throw ErrorHandler.Factory.reformatFSPIOPError(err)
      })
      const payerPositions = getPositionsFromResponse(payerPositionsResponse)
      const payeePositions = getPositionsFromResponse(payeePositionsResponse)
      const payerCurrentPostion = prepareCurrentPosition(payerFsp, payerPositions, payerLimits, transferId, messagePayload)
      const payeeCurrentPostion = prepareCurrentPosition(payeeFsp, payeePositions, payeeLimits, transferId, messagePayload)
      const positions = []
      CurrentPositionModel.insertMany(payerCurrentPostion.concat(payeeCurrentPostion), function (err, docs) {
        if (err) throw ErrorHandler.Factory.reformatFSPIOPError(err)
        for (const doc of docs) {
          positions.push(doc)
        }
        observer.next({ positions, message })
      })
    } catch (err) {
      Logger.info(`PositionsObservable failed with error: ${err}`)
      observer.error(err)
    }
  })
}

module.exports = {
  getPositionsObservable,
  getDfspNotificationEndpointsObservable,
  getParticipantEndpointsFromResponseObservable,
  getDfspNotificationEndpointsForLimitObservable
}
