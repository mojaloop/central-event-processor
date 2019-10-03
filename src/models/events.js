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
 - Valentin Genev <valentin.genev@modusbox.com>
 - Deon Botha <deon.botha@modusbox.com>

 --------------
 ******/
'use strict'

/**
 * @module src/models/netDebitCapView
 */
const mongoose = require('mongoose')
const config = require('../lib/config')
// const getActions = require('../observables/actions').getActions
/**
 * @const limitSchema
 *
 * @description This is the Mongoose database schema definition for the "limit" JSON Doc.
 *
 * @link https://mongoosejs.com , https://github.com/Automattic/mongoose
 */

// let actions = getActions()

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  currency: { type: String, required: true, index: true },
  limitType: { type: String, required: true },
  notificationEndpointType: { type: String, required: true },
  action: { type: String, required: true, enum: ['produceToKafkaTopic', 'sendEmail'] }, // always sendToKafkaTopic
  templateType: { type: String, required: true },
  language: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

const eventModel = mongoose.model(config.mongo.eventCollection, eventSchema)

module.exports = {
  eventModel
}
