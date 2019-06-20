'use strict'

const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const mongoose = require('mongoose')

const { statusEnum, serviceName } = require('@mojaloop/central-services-shared').HealthCheck.HealthCheckEnums

const Consumer = require('../../../../src/lib/kafka/consumer')
const {
  getSubServiceHealthBroker,
  getSubServiceHealthDatastore
} = require('../../../../src/lib/healthCheck/subServiceHealth')

Test('SubServiceHealth test', function (subServiceHealthTest) {
  let sandbox

  subServiceHealthTest.beforeEach(t => {
    sandbox = Sinon.createSandbox()
    sandbox.stub(Consumer, 'getListOfTopics')
    sandbox.stub(Consumer, 'isConsumerConnected')

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

    brokerTest.test('broker test fails when one broker cannot connect', async test => {
      // Arrange
      Consumer.getListOfTopics.returns(['admin1', 'admin2'])
      Consumer.isConsumerConnected.throws(new Error('Not connected!'))
      const expected = { name: serviceName.broker, status: statusEnum.DOWN }

      // Act
      const result = await getSubServiceHealthBroker()

      // Assert
      test.deepEqual(result, expected, 'getSubServiceHealthBroker should match expected result')
      test.end()
    })

    brokerTest.test('Passes when it connects', async test => {
      // Arrange
      Consumer.getListOfTopics.returns(['admin1', 'admin2'])
      Consumer.isConsumerConnected.returns(Promise.resolve(true))
      const expected = { name: serviceName.broker, status: statusEnum.OK }

      // Act
      const result = await getSubServiceHealthBroker()

      // Assert
      test.deepEqual(result, expected, 'getSubServiceHealthBroker should match expected result')
      test.end()
    })

    brokerTest.end()
  })

  subServiceHealthTest.end()
})
