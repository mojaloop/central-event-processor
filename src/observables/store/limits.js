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

const Rx = require('rxjs')
const Logger = require('@mojaloop/central-services-logger')
const MLNumber = require('@mojaloop/ml-number')
const LimitModel = require('../../models/limits').limitModel
const EventModel = require('../../models/events').eventModel
const Config = require('../../lib/config')
const Enums = require('../../lib/enum')
const ErrorHandler = require('@mojaloop/central-services-error-handling')

const getLimitPerNameObservable = ({ message }) => {
  return Rx.Observable.create(async observer => {
    try {
      const { limit, currency } = message.value.content.payload
      const name = message.value.from
      const limitResult = await updateLimitsFromMessage(name, currency, limit)
      await createEventsForParticipant(name, limitResult)
      observer.next(limitResult)
      observer.complete()
    } catch (err) {
      Logger.info(`getLimitPerNameObservable exit with error: ${err}`)
      observer.error(err)
    }
  })
}

const createEventsForParticipant = async (name, limit) => {
  try {
    const notificationActions = Enums.limitNotificationMap[limit.type]
    for (const key in notificationActions) {
      if (key !== 'enum') {
        const eventRecord = await EventModel.findOne({ name, currency: limit.currency, limitType: limit.type, notificationEndpointType: key })
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
  } catch (err) {
    Logger.info(`createEventsForParticipant exit with error: ${err}`)
    throw ErrorHandler.Factory.reformatFSPIOPError(err)
  }
}

const updateLimitsFromMessage = async (name, currency, limit) => {
  try {
    const doc = await LimitModel.findOne({ name, currency, type: limit.type })
    const limitObject = {
      name,
      currency: currency,
      type: limit.type,
      value: new MLNumber(limit.value).toFixed(Config.get('AMOUNT.SCALE')),
      threshold: limit.alarmPercentage
    }
    if (doc) {
      doc.oldValue = doc.value
      doc.value = limit.value
      await doc.save()
      return doc.toObject()
    } else {
      const document = await LimitModel.create(limitObject)
      return document.toObject()
    }
  } catch (err) {
    Logger.info(`updateLimitsFromMessage exit with error: ${err}`)
    throw ErrorHandler.Factory.reformatFSPIOPError(err)
  }
}

module.exports = { getLimitPerNameObservable }
