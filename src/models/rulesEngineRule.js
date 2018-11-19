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
 * Rajiv Mothilal <rajiv.mothilal@modusbox.com>
 * Miguel de Barros <miguel.debarros@modusbox.com>
 --------------
 ******/

'use strict'

/**
 * @module src/models/rulesEngineRule
 */

// const dbConnection = require('../../lib/database').db
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const config = require('../../config/config')

/**
 * @const eventSchema
 *
 * @description This is the Mongoose database schema definition for the "Event" JSON Doc.
 * This event gets fired when the rules engine evaluates a truthy to the facts that this event is linked to.
 *
 * @link https://mongoosejs.com , https://github.com/Automattic/mongoose, https://www.npmjs.com/package/json-rules-engine
 */
const eventSchema = new mongoose.Schema({
  event: {
    type: { type: String, required: true },
    params: {
      message: { type: String, required: true }
    }
  }
}, { _id: false })

const Event = mongoose.model('Event', eventSchema)

/**
 * @const ruleSchema
 *
 * @description This is the Mongoose database schema definition for the "Rule" JSON Doc.
 * This is the rule for the rules engine that gets persisted to the Mongo DB database as a JSON doc
 *
 * * @link https://mongoosejs.com , https://github.com/Automattic/mongoose, https://www.npmjs.com/package/json-rules-engine
 */
const ruleSchema = new mongoose.Schema({
  conditions: {
    any: [{
      all: [{
        fact: { type: String, required: true },
        operator: { type: String, required: true },
        value: { type: Number, required: true },
        path: String
      }]
    }]
  },
  event: { type: mongoose.Schema.Types.Mixed, ref: 'Event' }
})

ruleSchema.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique.' })

const Rule = mongoose.model(config.mongo.ruleCollection, ruleSchema)

module.exports = {
  Rule,
  Event
}
