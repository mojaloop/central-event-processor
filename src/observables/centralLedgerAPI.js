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

// TODO rework per name and loop the message over from and to

const request = require('request-promise')
const Rx = require('rxjs')
const Logger = require('@mojaloop/central-services-shared').Logger
const CurrentPositionModel = require('../models/currentPosition').currentPositionModel
const LimitModel = require('../models/limits').limitModel
const NotificationEndpointModel = require('../models/notificationEndpoint').notificationEndpointModel
const EventModel = require('../models/events').eventModel
const Enums = require('../lib/enum')

const getPositionsFromResponse = positions => {
  let positionObject = {}
  for (let position of positions) {
    positionObject[position.currency] = position.value
  }
  return positionObject
}

const prepareCurrentPosition = (name, positions, limits, transferId, messagePayload) => {
  let viewsArray = []
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
}

// TODO prepare a check for fresh limits and update them only if its necessary

const updateLimitsFromResponse = async (name, limits) => {
  let result = []
  for (let limit of limits) {
    let doc = await LimitModel.findOne({ name: name, currency: limit.currency, type: limit.limit.type })
    let limitObject = {
      name,
      currency: limit.currency,
      type: limit.limit.type,
      value: limit.limit.value,
      threshold: limit.limit.alarmPercentage
    }
    if (doc) {
      doc.oldValue = doc.value
      doc.value = limit.limit.value
      await doc.save()
      result.push(doc.toObject())
    } else {
      let document = await LimitModel.create(limitObject)
      result.push(document.toObject())
    }
  }
  return result
}

const createEventsForParticipant = async (name, limits) => {
  for (let limit of limits) {
    let notificationActions = Enums.limitNotificationMap[limit.type]
    for (let key in notificationActions) {
      if (key !== 'enum') {
        let eventRecord = await EventModel.findOne({ name, currency: limit.currency, limitType: limit.type, notificationEndpointType: key })
        if (!eventRecord) {
          const newEvent = {
            name,
            currency: limit.currency,
            notificationEndpointType: key,
            limitType: limit.type,
            action: notificationActions[key].action,
            templateType: notificationActions[key].templateType,
            language: notificationActions[key].language
          }
          await EventModel.create(newEvent)
        }
      }
    }
  }
}

const updateNotificationEndpointsFromResponse = async (name, notificationEndpoints) => {
  let result = []
  let notificationEndPointObject = {}
  for (let notificationEndpoint of notificationEndpoints) {
    let notificationRecord = await NotificationEndpointModel.findOneAndUpdate({ name: name, type: notificationEndpoint.type }, notificationEndpoint)
    if (!notificationRecord) {
      let action = Enums.notificationActionMap[notificationEndpoint.type] ? Enums.notificationActionMap[notificationEndpoint.type].action : ''
      notificationEndPointObject = {
        name,
        type: notificationEndpoint.type,
        value: notificationEndpoint.value,
        action
      }
      let document = await NotificationEndpointModel.create(notificationEndPointObject)
      result.push(document.toObject())
    } else {
      result.push(notificationRecord.toObject())
    }
  }
  console.log('getNotificationEndpointsFromResponse' + JSON.stringify(result))
  return result
}

const getDfspNotificationEndpointsObservable = message => {
  return Rx.Observable.create(async observer => {
    const payerFsp = message.value.from
    const payeeFsp = message.value.to
    try {
      const [payerNotificationResponse, payeeNotificationResponse, hubNotificationResponse] = await Promise.all([
        request({ uri: `http://localhost:3001/participants/${payerFsp}/endpoints`, json: true }),
        request({ uri: `http://localhost:3001/participants/${payeeFsp}/endpoints`, json: true }),
        request({ uri: `http://localhost:3001/participants/hub/endpoints`, json: true })
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

const requestLimitPerName = async (name) => {
  try {
    const limit = await request({ uri: `http://localhost:3001/participants/${name}/limits`, json: true })
    return limit
  } catch (e) {
    throw e
  }
}

const getLimitPerNameObservable = (name) => {
  return Rx.Observable.create(async observer => {
    const limitResponse = await requestLimitPerName(name)
    const limits = await updateLimitsFromResponse(name, limitResponse)
    await createEventsForParticipant(name, limits)
    observer.next(limits)
    observer.complete()
  })
}

// const getLimitObservable = ({ message }) => {
//   const payerFsp = message.value.from
//   const payeeFsp = message.value.to
//   return Rx.Observable.create(observer => {
//     let observables = [payerFsp, payeeFsp].map(name => getLimitPerNameObservable(name))
//     let allFspsObservable = Rx.forkJoin(observables)
//     allFspsObservable.subscribe(limitsArray => {
//       let limits = {}
//       for (let limit of limitsArray) {
//         limits = Object.assign(limits, limit)
//       }
//       observer.next({ message, limits })
//     })
//   })
// }

const requestPositionPerName = async (name) => {
  try {
    const position = await request({ uri: `http://localhost:3001/participants/${name}/positions`, json: true })
    return position
  } catch (e) {
    throw e
  }
}

const getPositionsObservable = ({ message, limits }) => {
  const payerFsp = message.value.from
  const payeeFsp = message.value.to
  const transferId = message.value.id
  const payerLimits = limits[payerFsp]
  const payeeLimits = limits[payeeFsp]
  const messagePayload = JSON.stringify(message.value.content.payload)
  return Rx.Observable.create(async observer => {
    try {
      const [payerPositionsResponse, payeePositionsResponse] = await Promise.all([
        requestPositionPerName(payerFsp),
        requestPositionPerName(payeeFsp)
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
  // getLimitObservable,
  getPositionsObservable,
  getLimitPerNameObservable,
  getDfspNotificationEndpointsObservable
}
