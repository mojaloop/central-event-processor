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

const mongoose = require('mongoose')
const config = require('../lib/config')

// as soon as threshold is breached we creat action
// as soon as the position is fixed isActive becomes false

// as soon as new action is created, we get the id and pass it to the scheduler.
// scheduler will check after an hour if this action is still active and if its active will clear timerTriggered field.

const actionSchema = new mongoose.Schema({
  triggeredBy: { type: mongoose.Schema.Types.ObjectId }, // this will show artefact (ndc breach, limit change, etc) in the past
  timesTriggered: { type: Number, default: 1 },
  fromEvent: { type: mongoose.Schema.Types.ObjectId, ref: config.mongo.eventCollection },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

const actionModel = mongoose.model(config.mongo.actionCollection, actionSchema)

module.exports = {
  actionModel
}
