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

const Rx = require('rxjs')
const Utility = require('../lib/utility')
const Uuid = require('uuid4')
const moment = require('moment')
const Config = require('../lib/config')
const Enum = require('../lib/enum')
const TransferEventType = Enum.transferEventType
// const TransferEventAction = Enum.transferEventAction
const Logger = require('@mojaloop/central-services-shared').Logger
const ActionModel = require('../models/action').actionModel
const NotificationModel = require('../models/notificationEndpoint').notificationEndpointModel
const LimitModel = require('../models/limits').limitModel

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
      throw err
    }
  },

  sendRequest: ({ method = 'GET', url, payload }) => {
    return 'not implemented'
  },

  sendEmail: ({ emailAddress, subject, body }) => {
    return 'not implemented'
  }
}

const actionBuilder = (action) => {
  return dictionary[action]
}

const actionObservable = ({ action, params, message }) => {
  return Rx.Observable.create(async observer => {
    try {
      if (action === 'finish') {
        return observer.complete({ actionResult: true })
      }
      let hubName = Config.get('HUB_PARTICIPANT').NAME
      let actionResult
      let previousAction = await ActionModel.findOne({ fromEvent: params.fromEvent, isActive: true })
      let recepientDetails = await NotificationModel.findOne({ name: params.dfsp, action: params.action, type: params.notificationEndpointType })
      let hubDetails = await NotificationModel.findOne({ name: hubName, action: params.action, type: params.notificationEndpointType })
      let messageDetails = Object.assign({}, params, { notificationInterval, resetPeriod })
      const payload = {
        from: hubName,
        to: params.dfsp,
        recepientDetails,
        hubDetails,
        messageDetails
      }
      if (previousAction) {
        if ((previousAction.timesTriggered < params.repetitionsAllowed) &&
          (moment(previousAction.updatedAt).add(notificationInterval, 'minutes') < moment.now())) {
          actionResult = await actionBuilder(action)({ payload })
          previousAction.timesTriggered++
          previousAction.save()
        } else {
          actionResult = previousAction
        }
      } else {
        actionResult = await actionBuilder(action)({ payload }) // create new action
        let actionCreated = await ActionModel.create({ triggeredBy: params.triggeredBy, fromEvent: params.fromEvent })
        Rx.asyncScheduler.schedule(clearRepetitionTask, resetPeriod * 60 * 1000, actionCreated.id) // loading the scheduler
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
    let action = await ActionModel.findById(actionId).populate('eventType')
    let limit = await LimitModel.findOne({ type: action.eventType.limitType, name: action.eventType.name, currency: action.eventType.currency })
    if (action.isActive && limit) {
      action.timesTriggered = 1
      action.save()
      this.schedule(actionId, resetPeriod * 60 * 1000)
    }
  } catch (err) {
    throw err
  }
}

const getActions = () => {
  let actions = []
  for (let action in dictionary) {
    actions.push(action)
  }
  return actions
}

module.exports = { actionObservable, getActions }
