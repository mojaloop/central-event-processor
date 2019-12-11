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

require('leaked-handles').set({
  fullStack: true, // use full stack traces
  timeout: 30000, // run every 30 seconds instead of 5.
  debugSockets: true // pretty print tcp thrown exceptions.
})

const test = require('tapes')(require('tape'))
const Mongoose = require('mongoose').Mongoose
const mongoose = new Mongoose()
const Mockgoose = require('mockgoose').Mockgoose
const mockgoose = new Mockgoose(mongoose)
const Database = require('../../../src/lib/database').db
const config = require('../../../src/lib/config')

test('Mongo Database tests', async dbTest => {
  dbTest.beforeEach(async t => {
    await mockgoose.helper.reset()
    t.end()
  })

  await dbTest.test('unsuccessful connection', async (assert) => {
    try {
      let result = await Database('mongodb://foobar:2701/test')
      assert.equals(result, undefined)
      assert.end()
    } catch (err) {
      assert.pass('Db connection failed')
      assert.end()
    }
  })

  await dbTest.test('successful connection', async (assert) => {
    try {
      let connectionString = config.mongo.user ? `mongodb://${config.mongo.user}:${config.mongo.password}@${config.mongo.uri}/${config.mongo.database}`
        : `mongodb://${config.mongo.uri}/${config.mongo.database}`

      await mockgoose.prepareStorage().then(() => {
        mongoose.connect(`${connectionString}`, {
          useFindAndModify: false,
          useNewUrlParser: true,
          useCreateIndex: true
        })
        mongoose.connection.on('connected', () => {
          console.log('db connection is now open')
        })
        mongoose.connection.on('error', function (err) {
          console.log('Mongoose default connection has occured ' + err + ' error')
        })
      })

      let expectedResult = { $initialConnection: {} }
      let result = await Database()
      assert.deepEquals(result.$initialConnection, expectedResult.$initialConnection)
      assert.pass('Db connection successful')
      await assert.end()
      process.nextTick(() => {
        mongoose.connection.close(async () => {
          console.log('closing Mock databases')
          process.exit(0)
        })
      })
    } catch (err) {
      assert.fail('Db connection failed')
      assert.end()
    }
  })

  await dbTest.end()
})
