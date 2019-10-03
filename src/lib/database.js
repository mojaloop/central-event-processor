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
 * @module src/lib/database
 */
const Mongoose = require('mongoose')
const Logger = require('@mojaloop/central-services-logger')

const config = require('../lib/config')

const defaultConnectionString = config.mongo.user
  ? `mongodb://${config.mongo.user}:${config.mongo.password}@${config.mongo.uri}/${config.mongo.database}`
  : `mongodb://${config.mongo.uri}/${config.mongo.database}`

const setupDb = (connectionString = defaultConnectionString) => {
  const db = Mongoose.connection

  Mongoose.Promise = global.Promise
  Mongoose.set('useFindAndModify', false)
  Mongoose.set('useNewUrlParser', true)
  Mongoose.set('useCreateIndex', true)

  return new Promise((resolve, reject) => {
    /* const connectionString = config.mongo.user ? `mongodb://${config.mongo.user}:${config.mongo.password}@${config.mongo.uri}/${config.mongo.database}` :
        `mongodb://${config.mongo.uri}/${config.mongo.database}` */
    Mongoose.connect(`${connectionString}`, { useFindAndModify: false, useNewUrlParser: true, useCreateIndex: true })
    db.on('error', err => {
      Logger.info('Connection with database failed with error', err)
      db.close()

      return reject(err)
    })

    db.once('open', () => {
      Logger.info('Connection with database succeeded.')
      return resolve(db)
    })
  })
}

exports.db = setupDb
