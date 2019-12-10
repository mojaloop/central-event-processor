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
const Utility = require('../lib/utility')
const Uuid = require('uuid4')
const moment = require('moment')
const Config = require('../lib/config')
const Enum = require('../lib/enum')
const TransferEventType = Enum.transferEventType
const Logger = require('@mojaloop/central-services-logger')
const ActionModel = require('../models/action').actionModel
const NotificationModel = require('../models/notificationEndpoint').notificationEndpointModel
const LimitModel = require('../models/limits').limitModel
const ErrorHandler = require('@mojaloop/central-services-error-handling')

const { resetPeriod, notificationInterval } = Config.notificationMinutes

const createMessageProtocol = (payload, action, state = '', pp = '') => {
  return {
    id: Uuid(),
    from: payload.from,
    to: payload.to,
    type: 'application/json',
    content: {
      header: {},
      payload
    },
    metadata: {
      event: {
        id: Uuid(),
        responseTo: '',
        type: 'notification',
        action,
        createdAt: new Date(),
        state
      }
    },
    pp
  }
}

const dictionary = {
  produceToKafkaTopic: async ({ payload, action, eventType = TransferEventType.NOTIFICATION, eventAction = 'email-notifier' }) => {
    try {
      await Utility.produceGeneralMessage(eventType, eventAction, createMessageProtocol(payload, action), Utility.ENUMS.STATE.SUCCESS)
    } catch (err) {
      throw ErrorHandler.Factory.reformatFSPIOPError(err)
    }
  },

  sendEmail: ({ emailAddress, subject, body }) => {
    return 'not implemented'
  }
}

const actionBuilder = (action) => {
  if (action in dictionary) {
    return dictionary[action]
  } else {
    throw ErrorHandler.Factory.createInternalServerFSPIOPError('Action ' + action + ' are not supported')
  }
}

const actionObservable = ({ action, params, message }) => {
  return Rx.Observable.create(async observer => {
    try {
      if (action === 'finish') {
        return observer.complete({ actionResult: true })
      }
      const hubName = Config.get('HUB_PARTICIPANT.NAME')
      let actionResult
      const previousAction = await ActionModel.findOne({ fromEvent: params.fromEvent, isActive: true })
      const recepientDetails = await NotificationModel.findOne({ name: params.dfsp, action: params.action, type: params.notificationEndpointType })
      const hubDetails = await NotificationModel.findOne({ name: hubName, action: params.action, type: params.notificationEndpointType })
      const messageDetails = Object.assign({}, params, { notificationInterval, resetPeriod })
      const payload = {
        from: hubName,
        to: params.dfsp,
        recepientDetails,
        hubDetails,
        messageDetails
      }
      if (previousAction) {
        if ((previousAction.timesTriggered < params.repetitionsAllowed) &&
          (moment(previousAction.updatedAt).add(notificationInterval, 'minutes') < moment.now()) &&
          (Config.get('notificationMinutes').oscilateEvents.includes(params.notificationEndpointType))) {
          actionResult = await actionBuilder(action)({ payload })
          previousAction.timesTriggered++
          previousAction.save()
        } else {
          actionResult = previousAction
        }
      } else {
        actionResult = await actionBuilder(action)({ payload }) // create new action
        if (Config.get('notificationMinutes').oscilateEvents.includes(params.notificationEndpointType)) {
          const actionCreated = await ActionModel.create({ triggeredBy: params.triggeredBy, fromEvent: params.fromEvent })
          !params.isTest && Rx.asyncScheduler.schedule(clearRepetitionTask, resetPeriod * 60 * 1000, actionCreated.id) // loading the scheduler, clearRepetitionTask is executed after the period and actionCreated.id is sent as a parameter
        } else {
          await ActionModel.create({ triggeredBy: params.triggeredBy, fromEvent: params.fromEvent, isActive: false })
        }
      }
      return observer.complete({ actionResult, message })
    } catch (err) {
      Logger.info(`action observer failed with error - ${err}`)
      observer.error(err)
    }
  })
}

const clearRepetitionTask = async function (actionId) { // clears the timesTriggered after delay is reached if action is still active
  try {
    const action = await ActionModel.findById(actionId).populate('fromEvent')
    const limit = await LimitModel.findOne({
      type: action.fromEvent.limitType,
      name: action.fromEvent.name,
      currency: action.fromEvent.currency
    })
    if (action.isActive && limit) {
      action.timesTriggered = 1
      action.save()

      // `this` references currently executing Action,
      // which we reschedule with new state and delay
      // ref : https://github.com/ReactiveX/rxjs/blob/master/src/internal/scheduler/async.ts
      this.schedule(actionId, resetPeriod * 60 * 1000)
    }
  } catch (err) {
    throw ErrorHandler.Factory.createInternalServerFSPIOPError('Clear repetition for task id : ' + actionId + ' failed.', err)
  }
}

module.exports = { actionObservable, clearRepetitionTask }
