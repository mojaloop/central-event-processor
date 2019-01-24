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

const request = require('request-promise')
const Rx = require('rxjs')
const Logger = require('@mojaloop/central-services-shared').Logger
const Config = require('../lib/config')
const CurrentPositionModel = require('../models/currentPosition').currentPositionModel
const LimitModel = require('../models/limits').limitModel
const NotificationEndpointModel = require('../models/notificationEndpoint').notificationEndpointModel
const Enums = require('../lib/enum')
const centralLedgerAPIConfig = Config.get('centralLedgerAPI')
const centralLedgerAdminURI = `${centralLedgerAPIConfig.adminHost}:${centralLedgerAPIConfig.adminPort}`

const getPositionsFromResponse = positions => {
  let positionObject = {}
  for (let position of positions) {
    positionObject[position.currency] = position.value
  }
  return positionObject
}

const prepareCurrentPosition = (name, positions, limits, transferId, messagePayload) => {
  let viewsArray = []
  try {
    limits.forEach(limit => {
      const percentage = 100 - (positions[limit.currency] * 100 / limit.value)
      let currentPosition = {
        name,
        currency: limit.currency,
        positionValue: positions[limit.currency],
        percentage,
        transferId,
        messagePayload
      }
      viewsArray.push(currentPosition)
    })
    return viewsArray
  } catch (err) {
    throw err
  }
}

const updateNotificationEndpointsFromResponse = async (name, notificationEndpoints) => {
  let result = []
  try {
    for (let notificationEndpoint of notificationEndpoints) {
      let action = Enums.notificationActionMap[notificationEndpoint.type] ? Enums.notificationActionMap[notificationEndpoint.type].action : ''
      let notificationRecord = await NotificationEndpointModel
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
    throw err
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
        request({ uri: `http://${centralLedgerAdminURI}/participants/hub/endpoints`, json: true })
      ])
      const payerNotificationEndpoints = await updateNotificationEndpointsFromResponse(payerFsp, payerNotificationResponse)
      const payeeNotificationEndpoints = await updateNotificationEndpointsFromResponse(payeeFsp, payeeNotificationResponse)
      const hubNotificationEndpoints = await updateNotificationEndpointsFromResponse('Hub', hubNotificationResponse)
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

const requestPositionPerName = async (name) => {
  try {
    const position = await request({ uri: `http://${centralLedgerAdminURI}/participants/${name}/positions`, json: true })
    return position
  } catch (e) {
    throw e
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
        throw err
      })
      const payerPositions = getPositionsFromResponse(payerPositionsResponse)
      const payeePositions = getPositionsFromResponse(payeePositionsResponse)
      const payerCurrentPostion = prepareCurrentPosition(payerFsp, payerPositions, payerLimits, transferId, messagePayload)
      const payeeCurrentPostion = prepareCurrentPosition(payeeFsp, payeePositions, payeeLimits, transferId, messagePayload)
      let positions = []
      CurrentPositionModel.insertMany(payerCurrentPostion.concat(payeeCurrentPostion), function (err, docs) {
        if (err) throw err
        for (let doc of docs) {
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
  getDfspNotificationEndpointsObservable
}
