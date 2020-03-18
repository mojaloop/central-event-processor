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

const RuleEngine = require('json-rules-engine')
const Rx = require('rxjs')
const EventModel = require('../../models/events').eventModel
const ActionModel = require('../../models/action').actionModel
const ErrorHandler = require('@mojaloop/central-services-error-handling')

const engine = new RuleEngine.Engine()

const createRules = async (limit) => {
  const rules = []
  const { name, currency, type } = limit
  try {
    const dbEvent = await EventModel.findOne({
      name,
      currency,
      limitType: type,
      notificationEndpointType: `${type}_ADJUSTMENT_EMAIL`,
      isActive: true
    })

    const conditions = {
      all: [{
        fact: 'name',
        operator: 'equal',
        value: name
      }, {
        fact: 'type',
        operator: 'equal',
        value: limit.type
      }, {
        fact: 'value',
        operator: 'notEqual',
        value: limit.oldValue
      }]
    }

    const event = {
      type: `${type}_ADJUSTMENT_EMAIL`,
      params: {
        dfsp: name,
        limitType: type,
        value: limit.value,
        currency: limit.currency,
        triggeredBy: limit._id,
        repetitionsAllowed: limit.repetitions,
        fromEvent: dbEvent.id,
        action: dbEvent.action,
        notificationEndpointType: dbEvent.notificationEndpointType,
        templateType: dbEvent.templateType,
        language: dbEvent.language,
        messageSubject: `${type} LIMIT ADJUSTMENT`
      }
    }
    const adjustmentRule = new RuleEngine.Rule({ conditions, event })
    rules.push(adjustmentRule)
    return { rules, event }
  } catch (err) {
    throw ErrorHandler.Factory.reformatFSPIOPError(err)
  }
}

const ndcAdjustmentObservable = (limit) => {
  return Rx.Observable.create(async observer => {
    try {
      const { rules, event } = await createRules(limit)
      rules.forEach(rule => engine.addRule(rule)) // TODO check if it is a loop atm and if not remove the forEach and push
      const actions = await engine.run(limit)
      if (actions.events && actions.events.length) {
        actions.events.forEach(action => {
          observer.next({
            action: 'produceToKafkaTopic',
            params: action.params
          })
        })
      } else {
        observer.next({ action: 'finish' })
        const activeActions = await ActionModel.find({ fromEvent: event.params.fromEvent, isActive: true }) // TODO move this into the action observerbale
        if (activeActions.length) {
          for (const activeAction of activeActions) {
            await ActionModel.findByIdAndUpdate(activeAction.id, { isActive: false })
          }
        }
      }
      rules.forEach(rule => engine.removeRule(rule))
      observer.complete()
    } catch (err) {
      observer.error(err)
    }
  })
}

module.exports = {
  ndcAdjustmentObservable
}
