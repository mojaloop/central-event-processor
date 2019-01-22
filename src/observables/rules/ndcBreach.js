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

const RuleEngine = require('json-rules-engine')
const Rx = require('rxjs')
const LimitModel = require('../../models/limits').limitModel
const EventModel = require('../../models/events').eventModel
const ActionModel = require('../../models/action').actionModel
const Enums = require('../../lib/enum')

let engine = new RuleEngine.Engine()

const createRules = async (position) => {
  let rules = []
  try {
    let [limit, dbEvent] = await Promise.all([
      LimitModel.findOne({ name: position.name, currency: position.currency, type: Enums.limitNotificationMap.NET_DEBIT_CAP.enum }),
      EventModel.findOne({
        name: position.name,
        currency: position.currency,
        limitType: Enums.limitNotificationMap.NET_DEBIT_CAP.enum,
        notificationEndpointType: Enums.limitNotificationMap.NET_DEBIT_CAP.NET_DEBIT_CAP_THRESHOLD_BREACH_EMAIL.enum,
        isActive: true
      })
    ])

    let conditions = {
      any: [{
        fact: 'percentage',
        operator: 'lessThanInclusive',
        value: limit.threshold,
        params: limit.type
      }]
    }

    let event = {
      type: limit.type,
      params: {
        dfsp: position.name,
        limitType: limit.type,
        value: position.percentage,
        position: position.positionValue,
        triggeredBy: position.id,
        repetitionsAllowed: limit.repetitions,
        fromEvent: dbEvent.id,
        action: dbEvent.action,
        notificationEndpointType: dbEvent.notificationEndpointType,
        templateType: dbEvent.templateType,
        language: dbEvent.language,
        messageSubject: `${limit.type} BREACH CONDITION REACHED`
      }
    }

    let breachRule = new RuleEngine.Rule({ conditions, event })
    rules.push(breachRule)
    return { rules, dbEvent }
  } catch (err) {
    throw err
  }
}

const ndcBreachObservable = ({ positions, message }) => {
  return Rx.Observable.create(async observer => {
    try {
      for (let position of positions) {
        let { rules, dbEvent } = await createRules(position)
        rules.forEach(rule => engine.addRule(rule))
        let fact = Object.assign({}, position.toObject())
        let actions = await engine.run(fact)
        if (actions.length) {
          actions.forEach(action => {
            observer.next({
              action: 'produceToKafkaTopic',
              params: action.params,
              message
            })
          })
        } else {
          observer.next({ action: 'finish' })
          let activeActions = await ActionModel.find({ fromEvent: dbEvent.id, isActive: true })
          if (activeActions) {
            for (let activeAction of activeActions) {
              await ActionModel.findByIdAndUpdate(activeAction.id, { isActive: false })
            }
          }
        }
        rules.forEach(rule => engine.removeRule(rule))
      }
    } catch (err) {
      observer.error(err)
    }
  })
}

module.exports = {
  ndcBreachObservable
}
