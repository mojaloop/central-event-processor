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
 - Shashikant Hirugade <shashikant.hirugade@modusbox.com>
 --------------
 ******/

'use strict'

const Rx = require('rxjs')
const { filter, switchMap, share } = require('rxjs/operators')
const Consumer = require('../../src/lib/kafka/consumer')
const Proxyquire = require('proxyquire')
const Observables = require('../../src/observables')
const Logger = require('@mojaloop/central-services-logger')
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
// const Setup = require('../../src/setup')
const P = require('bluebird')
const Config = require('../../src/lib/config')
const Utility = require('../../src/lib/utility')

Test('RxJs Observable Tests ( setup.js ) : ', async setupTest => {
  Sinon.config = {
    useFakeTimers: false
  }

  let sandbox
  let ConsumerStub
  let UtilityStub
  let RxjsStub
  let RxjsOperators
  let EnumStub
  let ObservableStub
  let ConfigStub
  let SetupProxy

  setupTest.beforeEach(test => {
    try {
      sandbox = Sinon.createSandbox()

      ConfigStub = Config
      EnumStub = [sandbox.stub()]
      ConsumerStub = Consumer
      UtilityStub = Utility
      RxjsStub = Rx
      RxjsOperators = { filter, switchMap, share }
      ObservableStub = Observables

      SetupProxy = Proxyquire('../../src/setup', {
        './lib/kafka/consumer': ConsumerStub,
        './lib/utility': UtilityStub,
        'rxjs': RxjsStub,
        'rxjs/operators': RxjsOperators,
        './lib/enum': EnumStub,
        './observables': ObservableStub,
        './lib/config': ConfigStub
      })
    } catch (err) {
      Logger.error(`setupTest failed with error - ${err}`)
      console.error(err.message)
    }
    test.end()
  })

  setupTest.afterEach(test => {
    sandbox.restore()
    test.end()
  })

  await setupTest.test('topicObservable should ?????', async test => {
    try {
      await SetupProxyRx.Observable.create()
      let consoleErrorStub = sandbox.stub(console, 'error')
      test.ok(consoleErrorStub.withArgs(e).calledOnce)
      // consoleErrorStub.restore()
      test.end()
    } catch (err) {
      Logger.error(`init failed with error - ${err}`)
      test.fail()
      test.end()
    }
  })

  await setupTest.end()
})
