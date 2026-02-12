'use strict'

const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const mongoose = require('mongoose')

const { statusEnum, serviceName } = require('@mojaloop/central-services-shared').HealthCheck.HealthCheckEnums

const Consumer = require('../../../../src/lib/kafka/consumer')
const Logger = require('@mojaloop/central-services-logger')
const {
  getSubServiceHealthBroker,
  getSubServiceHealthDatastore
} = require('../../../../src/lib/healthCheck/subServiceHealth')

Test('SubServiceHealth test', function (subServiceHealthTest) {
  let sandbox

  subServiceHealthTest.beforeEach(t => {
    sandbox = Sinon.createSandbox()
    sandbox.stub(Consumer, 'getListOfTopics')
    sandbox.stub(Consumer, 'getConsumer')
    sandbox.stub(Logger, 'isWarnEnabled').value(true)
    sandbox.stub(Logger, 'warn')

    t.end()
  })

  subServiceHealthTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  subServiceHealthTest.test('getSubServiceHealthDatastore', datastoreTest => {
    datastoreTest.test('datastore test passes when the mongoose state is 1', async test => {
      // Arrange
      sandbox.stub(mongoose, 'connection').value({ readyState: 1 })
      const expected = { name: serviceName.datastore, status: statusEnum.OK }

      // Act
      const result = await getSubServiceHealthDatastore()

      // Assert
      test.deepEqual(result, expected, 'getSubServiceHealthDatastore should match expected result')
      test.end()
    })

    datastoreTest.test('datastore test fails when the mongoose state is not 1', async test => {
      // Arrange
      sandbox.stub(mongoose, 'connection').value({ readyState: 0 })
      const expected = { name: serviceName.datastore, status: statusEnum.DOWN }

      // Act
      const result = await getSubServiceHealthDatastore()

      // Assert
      test.deepEqual(result, expected, 'getSubServiceHealthDatastore should match expected result')
      test.end()
    })

    datastoreTest.test('datastore test fails when the mongoose state is undefined', async test => {
      // Arrange
      sandbox.stub(mongoose, 'connection').value({ readyState: undefined })
      const expected = { name: serviceName.datastore, status: statusEnum.DOWN }

      // Act
      const result = await getSubServiceHealthDatastore()

      // Assert
      test.deepEqual(result, expected, 'getSubServiceHealthDatastore should match expected result')
      test.end()
    })

    datastoreTest.end()
  })

  subServiceHealthTest.test('getSubServiceHealthBroker', brokerTest => {
    brokerTest.test('broker test passes when there are no topics', async test => {
      // Arrange
      Consumer.getListOfTopics.returns([])
      const expected = { name: serviceName.broker, status: statusEnum.OK }

      // Act
      const result = await getSubServiceHealthBroker()

      // Assert
      test.deepEqual(result, expected, 'getSubServiceHealthBroker should match expected result')
      test.end()
    })

    brokerTest.test('broker test fails when consumer isHealthy returns false', async test => {
      // Arrange
      Consumer.getListOfTopics.returns(['admin1', 'admin2'])
      const mockConsumer = { isHealthy: sandbox.stub().resolves(false) }
      Consumer.getConsumer.returns(mockConsumer)
      const expected = { name: serviceName.broker, status: statusEnum.DOWN }

      // Act
      const result = await getSubServiceHealthBroker()

      // Assert
      test.deepEqual(result, expected, 'getSubServiceHealthBroker should match expected result')
      test.end()
    })

    brokerTest.test('Passes when all consumers are healthy', async test => {
      // Arrange
      Consumer.getListOfTopics.returns(['admin1', 'admin2'])
      const mockConsumer = { isHealthy: sandbox.stub().resolves(true) }
      Consumer.getConsumer.returns(mockConsumer)
      const expected = { name: serviceName.broker, status: statusEnum.OK }

      // Act
      const result = await getSubServiceHealthBroker()

      // Assert
      test.deepEqual(result, expected, 'getSubServiceHealthBroker should match expected result')
      test.end()
    })

    brokerTest.test('broker test fails when isHealthy returns false for one topic', async test => {
      // Arrange
      Consumer.getListOfTopics.returns(['admin1', 'admin2'])
      const mockConsumer1 = { isHealthy: sandbox.stub().resolves(true) }
      const mockConsumer2 = { isHealthy: sandbox.stub().resolves(false) }
      Consumer.getConsumer.withArgs('admin1').returns(mockConsumer1)
      Consumer.getConsumer.withArgs('admin2').returns(mockConsumer2)
      const expected = { name: serviceName.broker, status: statusEnum.DOWN }

      // Act
      const result = await getSubServiceHealthBroker()

      // Assert
      test.deepEqual(result, expected, 'getSubServiceHealthBroker should be DOWN when a topic is not healthy')
      test.end()
    })

    brokerTest.test('broker test handles isHealthy throwing for one topic', async test => {
      // Arrange
      Consumer.getListOfTopics.returns(['topic1', 'topic2'])
      const mockConsumer1 = { isHealthy: sandbox.stub().resolves(true) }
      const mockConsumer2 = { isHealthy: sandbox.stub().rejects(new Error('Health check error')) }
      Consumer.getConsumer.withArgs('topic1').returns(mockConsumer1)
      Consumer.getConsumer.withArgs('topic2').returns(mockConsumer2)
      const expected = { name: serviceName.broker, status: statusEnum.DOWN }

      // Act
      const result = await getSubServiceHealthBroker()

      // Assert
      test.deepEqual(result, expected, 'getSubServiceHealthBroker should be DOWN if isHealthy throws')
      test.end()
    })

    brokerTest.test('broker test handles getConsumer throwing for one topic', async test => {
      // Arrange
      Consumer.getListOfTopics.returns(['topic1', 'topic2'])
      Consumer.getConsumer.throws(new Error('Consumer not found'))
      const expected = { name: serviceName.broker, status: statusEnum.DOWN }

      // Act
      const result = await getSubServiceHealthBroker()

      // Assert
      test.deepEqual(result, expected, 'getSubServiceHealthBroker should be DOWN if getConsumer throws')
      test.end()
    })

    brokerTest.test('broker test handles getListOfTopics throwing error', async test => {
      // Arrange
      Consumer.getListOfTopics.throws(new Error('Failed to get topics'))
      const expected = { name: serviceName.broker, status: statusEnum.DOWN }

      // Act
      const result = await getSubServiceHealthBroker()

      // Assert
      test.deepEqual(result, expected, 'getSubServiceHealthBroker should be DOWN if getListOfTopics throws')
      test.end()
    })

    brokerTest.end()
  })

  subServiceHealthTest.end()
})
