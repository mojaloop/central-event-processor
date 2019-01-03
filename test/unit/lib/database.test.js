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

/**
 * @module test/unit/lib/database.test.js
 */

const test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const P = require('bluebird')

const Mongoose = require('mongoose')
const Database = require('../../../src/lib/database').db
const config = require('../../../src/lib/config')
const Logger = require('@mojaloop/central-services-shared').Logger

test('Mongo Database tests. ', dbTest => {

  /*dbTest.beforeEach(test => {

    console.log('before test')
    test.end()
  })

  dbTest.afterEach(test => {
    console.log('after test')
    test.end()
  })*/

  dbTest.test('connection test should ', async dbConnectionTest => {
    // dbConnectionTest.test(' fail connection to the Db ', test => {
    try {
        /*let connectionString = await  Sinon.mock(config.mongo.user ? `mongodb://${config.mongo.user}:${config.mongo.password}@${config.mongo.uri}/${config.mongo.database}` :
          `mongodb://${config.mongo.uri}/${config.mongo.database}`)*/

        // let db = await Sinon.mock(Mongoose.connection)

        /*await Sinon.mock(Mongoose.connect(`${connectionString}`, {
          useFindAndModify: false,
          useNewUrlParser: true,
          useCreateIndex: true
        })).throws(new Error())*/


        await Database()

        dbConnectionTest.pass('not connect to Database')
        dbConnectionTest.end()
      } catch (Error) {
        dbConnectionTest.faill('Connected to the Database')
        dbConnectionTest.end()
      }
      // dbConnectionTest.end()
    // })
  })

  /*dbConnectionTest.test(' connect to the Db ', async (test) => {
    try {
      const connectionString = config.mongo.user ? `mongodb://${config.mongo.user}:${config.mongo.password}@${config.mongo.uri}/${config.mongo.database}` :
        `mongodb://${config.mongo.uri}/${config.mongo.database}`
      test.ok(Sinon.mock(Mongoose.connect(`${connectionString}`, { useFindAndModify: false, useNewUrlParser: true, useCreateIndex: true })))
      test.pass()
      test.end()
    } catch (err) {
      Logger.error(`CEP : connection to Mongo DB failed - ${err}`)
      test.fail()
      test.end()
    }
  })*/

dbTest.end()
})
