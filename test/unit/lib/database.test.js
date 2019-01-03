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

const Mongoose = require('mongoose').Mongoose;
const mongoose = new Mongoose();

const Mockgoose = require('mockgoose').Mockgoose;
const mockgoose = new Mockgoose(mongoose);

const Database = require('../../../src/lib/database').db

const config = require('../../../src/lib/config')
const Logger = require('@mojaloop/central-services-shared').Logger

test('Mongo Database tests. ', dbTest => {

  /*dbTest.test('connection test should ', async dbConnectionTest => {
    try {
        await Database()

        dbConnectionTest.pass('not connect to Database')
        dbConnectionTest.end()
      } catch (Error) {
        dbConnectionTest.faill('Connected to the Database')
        dbConnectionTest.end()
      }
  })*/

  dbTest.test('connection test should ', async dbConnectionTest => {
    try {
      await mockgoose.prepareStorage().then(() => {
        mongoose.connect('mongodb://foobar/baz');
        mongoose.connection.on('connected', () => {
          console.log('db connection is now open');
        });
      });
        await Database()

      /*dbConnectionTest.pass('not connect to Database')
      dbConnectionTest.end()*/
      } catch (Error) {
      console.log('!!! error : ' + Error)
        /*dbConnectionTest.faill('Connected to the Database')
        dbConnectionTest.end()*/
      }

  })

dbTest.end()
})
