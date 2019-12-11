'use strict'

const Sinon = require('sinon')
const Test = require('tapes')(require('tape'))
const Uuid = require('uuid4')
const Utility = require('../../../src/lib/utility')

const TRANSFER = 'transfer'
const PREPARE = 'prepare'
const NOTIFICATION = 'notification'
const EVENT = 'event'
const CONSUMER = 'CONSUMER'

const transfer = {
  transferId: 'b51ec534-ee48-4575-b6a9-ead2955b8999',
  payerFsp: 'dfsp1',
  payeeFsp: 'dfsp2',
  amount: {
    currency: 'USD',
    amount: '433.88'
  },
  ilpPacket: 'AYIBgQAAAAAAAASwNGxldmVsb25lLmRmc3AxLm1lci45T2RTOF81MDdqUUZERmZlakgyOVc4bXFmNEpLMHlGTFGCAUBQU0svMS4wCk5vbmNlOiB1SXlweUYzY3pYSXBFdzVVc05TYWh3CkVuY3J5cHRpb246IG5vbmUKUGF5bWVudC1JZDogMTMyMzZhM2ItOGZhOC00MTYzLTg0NDctNGMzZWQzZGE5OGE3CgpDb250ZW50LUxlbmd0aDogMTM1CkNvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvbgpTZW5kZXItSWRlbnRpZmllcjogOTI4MDYzOTEKCiJ7XCJmZWVcIjowLFwidHJhbnNmZXJDb2RlXCI6XCJpbnZvaWNlXCIsXCJkZWJpdE5hbWVcIjpcImFsaWNlIGNvb3BlclwiLFwiY3JlZGl0TmFtZVwiOlwibWVyIGNoYW50XCIsXCJkZWJpdElkZW50aWZpZXJcIjpcIjkyODA2MzkxXCJ9IgA',
  condition: 'YlK5TZyhflbXaDRPtR5zhCu8FrbgvrQwwmzuH0iQ0AI',
  expiration: '2016-05-24T08:38:08.699-04:00',
  extensionList: {
    extension: [
      {
        key: 'key1',
        value: 'value1'
      },
      {
        key: 'key2',
        value: 'value2'
      }
    ]
  }
}

const messageProtocol = {
  id: transfer.transferId,
  from: transfer.payerFsp,
  to: transfer.payeeFsp,
  type: 'application/json',
  content: {
    header: {},
    payload: transfer
  },
  metadata: {
    event: {
      id: Uuid(),
      type: 'prepare',
      action: 'commit',
      createdAt: new Date(),
      state: {
        status: 'success',
        code: 0,
        description: 'action successful'
      }
    }
  },
  pp: ''
}

Test('Utility Test', utilityTest => {
  let sandbox

  utilityTest.beforeEach(test => {
    sandbox = Sinon.createSandbox()
    test.end()
  })

  utilityTest.afterEach(test => {
    sandbox.restore()
    test.end()
  })

  utilityTest.test('updateMessageProtocolMetadata should', updateMessageProtocolMetadataTest => {
    updateMessageProtocolMetadataTest.test('return an updated metadata object in the message protocol', test => {
      const previousEventId = messageProtocol.metadata.event.id
      const newMessageProtocol = Utility.updateMessageProtocolMetadata(messageProtocol, TRANSFER, PREPARE, Utility.ENUMS.STATE.SUCCESS)
      test.equal(newMessageProtocol.metadata.event.state, Utility.ENUMS.STATE.SUCCESS)
      test.equal(newMessageProtocol.metadata.event.type, TRANSFER)
      test.equal(newMessageProtocol.metadata.event.action, PREPARE)
      test.equal(newMessageProtocol.metadata.event.responseTo, previousEventId)
      test.end()
    })

    updateMessageProtocolMetadataTest.test('return an updated metadata object in the message protocol if metadata is not present', test => {
      const newMessageProtocol = Utility.updateMessageProtocolMetadata({}, TRANSFER, PREPARE, Utility.ENUMS.STATE.SUCCESS)
      test.equal(newMessageProtocol.metadata.event.state, Utility.ENUMS.STATE.SUCCESS)
      test.equal(newMessageProtocol.metadata.event.type, TRANSFER)
      test.equal(newMessageProtocol.metadata.event.action, PREPARE)
      test.end()
    })

    updateMessageProtocolMetadataTest.end()
  })

  utilityTest.test('getKafkaConfig should', getKafkaConfigTest => {
    getKafkaConfigTest.test('return the Kafka config from the default.json', test => {
      const config = Utility.getKafkaConfig(CONSUMER, NOTIFICATION.toUpperCase(), EVENT.toUpperCase())
      test.ok(config.rdkafkaConf !== undefined)
      test.ok(config.options !== undefined)
      test.end()
    })

    getKafkaConfigTest.test('throw and error if Kafka config not in default.json', test => {
      try {
        Utility.getKafkaConfig(CONSUMER, NOTIFICATION, EVENT)
        test.fail('Error not thrown')
        test.end()
      } catch (e) {
        test.pass('Error thrown')
        test.end()
      }
    })

    getKafkaConfigTest.end()
  })

  utilityTest.test('createState should', createStateTest => {
    createStateTest.test('create a state', async (test) => {
      const state = {
        status: 'status',
        code: 1,
        description: 'description'
      }
      const result = await Utility.createState(state.status, state.code, state.description)
      test.deepEqual(result, state)
      test.end()
    })

    createStateTest.end()
  })

  utilityTest.end()
})
