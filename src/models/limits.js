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

/**
 * @module src/models/netDebitCapView
 */
const mongoose = require('mongoose')
const config = require('../lib/config')

/**
 * @const limitSchema
 *
 * @description This is the Mongoose database schema definition for the "limit" JSON Doc.
 *
 * @link https://mongoosejs.com , https://github.com/Automattic/mongoose
 */

const limitSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  currency: { type: String, required: true, index: true },
  oldValue: { type: Number, required: true, default: 0 },
  type: { type: String, required: true },
  value: { type: Number, required: true },
  repetitions: { type: Number, default: 3 },
  threshold: { type: Number, required: true, default: 10 }
}, { timestamps: true })

// we need returned createdDate from central-ledger as well

const limitModel = mongoose.model(config.mongo.limitCollection, limitSchema)

module.exports = {
  limitModel
}
