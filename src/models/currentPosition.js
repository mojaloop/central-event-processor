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

/**
 * @const currentPossitionSchema
 *
 * @description This is the Mongoose database schema definition for the "Position Limit" JSON Doc.
 *
 * * @link https://mongoosejs.com , https://github.com/Automattic/mongoose
 */

const currentPositionSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  positionType: { type: String, required: true, enum: ['transfer', 'settlement'] }, // transfer or settlement
  currency: { type: String, required: true, index: true },
  positionValue: { type: Number, required: true },
  percentage: { type: Number },
  transferId: { type: String, required: true, index: true },
  messagePayload: { type: String, required: true } // create schema later
}, { timestamps: true })

const currentPositionModel = mongoose.model(config.mongo.netDebitCapPositionCollection, currentPositionSchema)

module.exports = {
  currentPositionModel
}

// TODO add transferId here and add this document Id into the notification history
// we get transfer -> we create view per DFSP - currency pair with transferId and current position values
// (whole payload as a string for the MVP later we might create a model for that)
// we get latest limit and store it in rules config and prepare a rule for the engine from our db record
// if there is a need for action we check for older views with same dfsp/currency pair and update or create an action document
// with repetition counter
// action observable (a) Might be a Subject to split the pipe at some point to be able to take an array of actions not necessary for the MVP
// use rxjs Scheduler to clear the repetition count or when thershold is below again
// add central-ledger address in config
