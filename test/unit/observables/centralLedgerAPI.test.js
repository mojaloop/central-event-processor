/*****
 License
 --------------
 Copyright © 2020-2025 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Mojaloop Foundation for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.

 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>
 --------------
 ******/

'use strict'

const test = require('tapes')(require('tape'))
const rewire = require('rewire')

test('centralLedgerAPI Tests (prepareCurrentPosition) : ', async prepareCurrentPositionTest => {
  prepareCurrentPositionTest.test('build current position views for limits with matching positions', test => {
    const centralLedgerAPI = rewire('../../../src/observables/centralLedgerAPI')
    const prepareCurrentPosition = centralLedgerAPI.__get__('prepareCurrentPosition')

    const positions = { USD: 1000, EUR: 500 }
    const limits = [
      { currency: 'USD', value: 10000 },
      { currency: 'EUR', value: 2000 }
    ]

    const result = prepareCurrentPosition('dfsp1', positions, limits, 'transfer-id-1', '{}')

    test.equal(result.length, 2, 'one view per limit')
    test.equal(result[0].currency, 'USD')
    test.equal(result[0].positionValue, '1000.0000')
    test.equal(result[0].percentage, 90)
    test.equal(result[1].currency, 'EUR')
    test.equal(result[1].positionValue, '500.0000')
    test.equal(result[1].percentage, 75)
    test.end()
  })

  prepareCurrentPositionTest.test('skip limits for currencies with no position instead of throwing', test => {
    const centralLedgerAPI = rewire('../../../src/observables/centralLedgerAPI')
    const prepareCurrentPosition = centralLedgerAPI.__get__('prepareCurrentPosition')

    const positions = { USD: 1000 }
    const limits = [
      { currency: 'USD', value: 10000 },
      { currency: 'XOF', value: 5000 } // limit exists but participant has no XOF position
    ]

    const result = prepareCurrentPosition('dfsp1', positions, limits, 'transfer-id-1', '{}')

    test.equal(result.length, 1, 'limit without a matching position is skipped')
    test.equal(result[0].currency, 'USD')
    test.equal(result[0].positionValue, '1000.0000')
    test.end()
  })

  prepareCurrentPositionTest.end()
})
