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

 * Georgi Georgiev <georgi.georgiev@modusbox.com>

 --------------
 ******/
'use strict'

const src = '../../../../src'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const rewire = require('rewire')
const KafkaConsumer = require('@mojaloop/central-services-stream').Kafka.Consumer
const Consumer = require(`${src}/lib/kafka/consumer`)

Test('Consumer', ConsumerTest => {
  let sandbox

  ConsumerTest.beforeEach(test => {
    sandbox = Sinon.createSandbox()
    sandbox.stub(KafkaConsumer.prototype, 'constructor').resolves()
    sandbox.stub(KafkaConsumer.prototype, 'connect').resolves()
    sandbox.stub(KafkaConsumer.prototype, 'consume').resolves()
    sandbox.stub(KafkaConsumer.prototype, 'commitMessageSync').resolves()
    sandbox.stub(KafkaConsumer.prototype, 'getMetadata').resolves()
    test.end()
  })

  ConsumerTest.afterEach(test => {
    sandbox.restore()
    test.end()
  })

  ConsumerTest.test('isConnected should', isConnectedTest => {
    isConnectedTest.test('return true if connected', async test => {
      // Arrange
      const topicName = 'admin'
      const config = { rdkafkaConf: {} }
      var getMetadataPromiseStub = sandbox.stub()
      const metadata = {
        orig_broker_id: 0,
        orig_broker_name: 'kafka:9092/0',
        topics: [
          { name: 'admin', partitions: [] }
        ],
        brokers: [{ id: 0, host: 'kafka', port: 9092 }]
      }
      getMetadataPromiseStub.returns(Promise.resolve(metadata))
      const ConsumerProxy = rewire(`${src}/lib/kafka/consumer`)
      ConsumerProxy.__set__('getMetadataPromise', getMetadataPromiseStub)

      // Act
      await ConsumerProxy.createHandler(topicName, config)
      const result = await ConsumerProxy.isConnected(topicName)

      // Assert
      test.equal(result, true, 'The consumer is connected')
      test.end()
    })

    isConnectedTest.test('throw if the topic cannot be found', async test => {
      // Arrange
      const topicName = 'random-topic'
      const ConsumerProxy = rewire(`${src}/lib/kafka/consumer`)
      // Don't register any topics

      // Act
      try {
        await ConsumerProxy.isConnected(topicName)
        test.fail('should have thrown an exception')
      } catch (err) {
        test.equal(err.message, `No consumer found for topic ${topicName}`, 'The error messages match.')
        test.pass('Threw an exception when the topic was not found')
      }

      // Assert
      test.end()
    })

    isConnectedTest.test('throw if not connected', async test => {
      // Arrange
      const topicName = 'admin'
      const config = { rdkafkaConf: {} }
      var getMetadataPromiseStub = sandbox.stub()
      const metadata = {
        orig_broker_id: 0,
        orig_broker_name: 'kafka:9092/0',
        topics: [
          { name: 'not-admin', partitions: [] }
        ],
        brokers: [{ id: 0, host: 'kafka', port: 9092 }]
      }
      getMetadataPromiseStub.returns(Promise.resolve(metadata))
      const ConsumerProxy = rewire(`${src}/lib/kafka/consumer`)
      ConsumerProxy.__set__('getMetadataPromise', getMetadataPromiseStub)

      // Act
      await ConsumerProxy.createHandler(topicName, config)

      try {
        await ConsumerProxy.isConnected(topicName)
        test.fail('should have thrown an exception')
      } catch (err) {
        test.equal(err.message, `Connected to consumer, but ${topicName} not found.`, 'The error messages match.')
        test.pass('Threw an exception when the topic was not found')
      }

      // Assert
      test.end()
    })

    isConnectedTest.end()
  })

  ConsumerTest.test('createHandler should', createHandlerTest => {
    createHandlerTest.test('not throw error if it fails to connect', async (test) => {
      const topicName = 'admin'
      const config = { rdkafkaConf: {} }
      KafkaConsumer.prototype.constructor.throws(new Error())
      KafkaConsumer.prototype.connect.throws(new Error())

      try {
        await Consumer.createHandler(topicName, config)
        test.pass('Created handler in spite of failure to connect.')
      } catch (err) {
        test.fail(`Should not have thrown err: ${err.message}`)
      }

      test.end()
    })

    createHandlerTest.test('handle arrays', async (test) => {
      const topicName = ['admin2', 'admin1']
      const config = { rdkafkaConf: {} }
      try {
        await Consumer.createHandler(topicName, config)
        test.pass('passed')
      } catch (err) {
        test.fail('Error Thrown')
      }
      test.end()
    })

    createHandlerTest.test('topic is still added if fails to connect', async (test) => {
      // Arrange
      const ConsumerProxy = rewire(`${src}/lib/kafka/consumer`)
      const topicName = 'admin'
      const config = { rdkafkaConf: {} }
      KafkaConsumer.prototype.connect.throws(new Error())

      // Act
      await ConsumerProxy.createHandler(topicName, config)
      const topics = ConsumerProxy.getListOfTopics()

      // Assert
      test.deepEqual(topics, [topicName], 'Topic should still be in list even if consumer failed to connect.')
      test.end()
    })

    createHandlerTest.test('should have a timestamp of 0 if couldn\'t connect', async test => {
      // Arrange
      const ConsumerProxy = rewire(`${src}/lib/kafka/consumer`)
      const topicName = ['admin2', 'admin1']
      const config = { rdkafkaConf: {} }
      KafkaConsumer.prototype.connect.throws(new Error())

      // Act
      await ConsumerProxy.createHandler(topicName, config)
      const result = ConsumerProxy.__get__('listOfConsumers')
      const timestamps = Object.keys(result).map(k => result[k].connectedTimeStamp)

      // Assert
      test.deepEqual(timestamps, [0, 0], 'Timestamps should be 0')
      test.end()
    })

    createHandlerTest.test('should contain a timestamp of when it connected', async test => {
      // Arrange
      const ConsumerProxy = rewire(`${src}/lib/kafka/consumer`)
      const topicName = ['admin2', 'admin1']
      const config = { rdkafkaConf: {} }

      // Act
      await ConsumerProxy.createHandler(topicName, config)
      const result = ConsumerProxy.__get__('listOfConsumers')
      const timestamps = Object.keys(result).map(k => result[k].connectedTimeStamp)

      // Assert
      timestamps.forEach(ts => test.ok(ts > 0, 'Timestamp should be greater than 0'))
      test.end()
    })

    createHandlerTest.end()
  })

  ConsumerTest.test('getListOfTopics should', getListOfTopicsTest => {
    getListOfTopicsTest.test('return an empty array when there are no topics', test => {
      // Arrange
      const ConsumerProxy = rewire(`${src}/lib/kafka/consumer`)
      ConsumerProxy.__set__('listOfConsumers', {})
      const expected = []

      // Act
      const result = ConsumerProxy.getListOfTopics()

      // Assert
      test.deepEqual(result, expected, 'Should return an empty array')
      test.end()
    })

    getListOfTopicsTest.test('return a list of topics', test => {
      // Arrange
      const ConsumerProxy = rewire(`${src}/lib/kafka/consumer`)
      ConsumerProxy.__set__('listOfConsumers', { admin1: {}, admin2: {} })
      const expected = ['admin1', 'admin2']

      // Act
      const result = ConsumerProxy.getListOfTopics()

      // Assert
      test.deepEqual(result, expected, 'Should return an empty array')
      test.end()
    })

    getListOfTopicsTest.end()
  })

  ConsumerTest.test('getConsumer should', getConsumerTest => {
    const topicName = 'admin'
    const expected = 'consumer'

    getConsumerTest.test('return list of consumers', async (test) => {
      const ConsumerProxy = rewire(`${src}/lib/kafka/consumer`)
      ConsumerProxy.__set__('listOfConsumers', {
        admin: {
          consumer: expected
        }
      })
      try {
        const result = await ConsumerProxy.getConsumer(topicName)
        test.equal(result, expected)
      } catch (err) {
        test.fail()
      }
      test.end()
    })

    getConsumerTest.test('throw error', async (test) => {
      const ConsumerProxy = rewire(`${src}/lib/kafka/consumer`)
      try {
        await ConsumerProxy.getConsumer(topicName)
        test.fail('Error not thrown!')
      } catch (err) {
        test.pass()
      }
      test.end()
    })

    getConsumerTest.end()
  })

  ConsumerTest.test('isConsumerAutoCommitEnabled should', isConsumerAutoCommitEnabledTest => {
    const topicName = 'admin'

    isConsumerAutoCommitEnabledTest.test('throw error', async (test) => {
      const ConsumerProxy = rewire(`${src}/lib/kafka/consumer`)
      try {
        await ConsumerProxy.isConsumerAutoCommitEnabled(topicName)
        test.fail('Error not thrown!')
        test.end()
      } catch (err) {
        test.pass()
      }
      test.end()
    })

    isConsumerAutoCommitEnabledTest.test('return result', async (test) => {
      // Arrange
      const topics = ['admin2', 'admin1']
      const config = { rdkafkaConf: {} }
      const ConsumerProxy = rewire(`${src}/lib/kafka/consumer`)
      await ConsumerProxy.createHandler(topics, config)

      // Act
      try {
        const result = await ConsumerProxy.isConsumerAutoCommitEnabled('admin1')

        // Assert
        test.equal(result, true, 'isConsumerAutoCommitEnabled is true')
      } catch (err) {
        test.fail(`Should not have thrown err: ${err.message}`)
      }
      test.end()
    })

    isConsumerAutoCommitEnabledTest.end()
  })

  ConsumerTest.test('registerNotificationHandler should', async registerTests => {
    registerTests.test('fail if the Consumer fails to connect', async test => {
      // Arrange
      KafkaConsumer.prototype.constructor.throws(new Error())
      KafkaConsumer.prototype.connect.throws(new Error('Failed to connect'))
      KafkaConsumer.prototype.getMetadata.throws(new Error('Failed to get metadata'))

      // Act
      try {
        await Consumer.registerNotificationHandler()
        test.fail('Should have thrown an error')
      } catch (err) {
        // Assert
        test.pass('Successfully threw error when attempting to connect to consumer')
      }

      test.end()
    })

    registerTests.test('connect to the consumer', async test => {
      // Arrange
      var isConnectedStub = sandbox.stub()
      isConnectedStub.returns(Promise.resolve(true))
      const ConsumerProxy = rewire(`${src}/lib/kafka/consumer`)
      ConsumerProxy.__set__('isConnected', isConnectedStub)

      // Act
      try {
        await ConsumerProxy.registerNotificationHandler()
        // Assert
        test.pass('Successfully connected to the consumer')
      } catch (err) {
        test.fail('Should not have thrown an error')
      }

      test.end()
    })

    registerTests.end()
  })

  ConsumerTest.end()
})
