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

 * ModusBox
 - Rajiv Mothilal <rajiv.mothilal@modusbox.com>
 - Miguel de Barros <miguel.debarros@modusbox.com>

 --------------
 ******/
'use strict'

/**
 * @module src/lib/kafka/consumer
 */

const Consumer = require('@mojaloop/central-services-stream').Kafka.Consumer
const Logger = require('@mojaloop/central-services-logger')
const Utility = require('../utility')
const ErrorHandler = require('@mojaloop/central-services-error-handling')
const listOfConsumers = {}

/**
 * @function isConsumerAutoCommitEnabled
 *
 * @param {string} topicName - the topic name to locate a specific consumer
 *
 * @description This is used to get a consumer with the topic name to commit the messages that have been received
 *
 * @returns {Consumer} - Returns consumer
 * @throws {Error} - if consumer not found for topic name
 */
const isConsumerAutoCommitEnabled = (topicName) => {
  if (listOfConsumers[topicName]) {
    return listOfConsumers[topicName].autoCommitEnabled
  } else {
    throw ErrorHandler.Factory.createInternalServerFSPIOPError(`No consumer found for topic ${topicName}`)
  }
}

/**
 * @function CreateHandler
 *
 * @param {string | Array<string>} topicName - the topic name or names to be registered for the required handler. Example: 'topic-dfsp1-transfer-prepare'
 * @param {object} config - the config for the consumer for the specific functionality and action, retrieved from the default.json. Example: found in default.json 'KAFKA.CONSUMER.TRANSFER.PREPARE'
 * @param {function} command - the callback handler for the topic. Will be called when the topic is produced against. Example: Command.prepareHandler()
 *
 * @description Creates handlers for the given topic name(s), and adds to listOfConsumers
 */
const createHandler = async (topicName, config, command) => {
  let topicNameArray
  if (Array.isArray(topicName)) {
    topicNameArray = topicName
  } else {
    topicNameArray = [topicName]
  }

  Logger.info(`CreateHandle::connect - creating Consumer for topics: [${topicNameArray}]`)

  const consumer = new Consumer(topicNameArray, config)

  let autoCommitEnabled = true
  if (config.rdkafkaConf !== undefined && config.rdkafkaConf['enable.auto.commit'] !== undefined) {
    autoCommitEnabled = config.rdkafkaConf['enable.auto.commit']
  }

  let connectedTimeStamp = 0
  try {
    await consumer.connect()
    Logger.info(`CreateHandle::connect - successfully connected to topics: [${topicName}]`)
    connectedTimeStamp = (new Date()).valueOf()
    await consumer.consume(command)
  } catch (e) {
    // Don't throw the error, still keep track of the topic we tried to connect to
    Logger.warn(`CreateHandle::connect - error: ${e.message}`)
  }

  topicNameArray.forEach(topicName => {
    listOfConsumers[topicName] = {
      consumer,
      autoCommitEnabled,
      connectedTimeStamp
    }
  })
}

/**
 * @function GetConsumer
 *
 * @param {string} topicName - the topic name to locate a specific consumer
 *
 * @description This is used to get a consumer with the topic name to commit the messages that have been received
 *
 * @returns {Consumer} - Returns consumer
 * @throws {Error} - if consumer not found for topic name
 */
const getConsumer = (topicName) => {
  if (listOfConsumers[topicName]) {
    return listOfConsumers[topicName].consumer
  } else {
    throw ErrorHandler.Factory.createInternalServerFSPIOPError(`No consumer found for topic ${topicName}`)
  }
}

/**
 * @function registerNotificationHandler
 *
 * @description This is used to register the handler for the Notification topic according to a specified Kafka congfiguration
 *
 * @returns true
 * @throws {Error} - if handler failed to create
 */
const registerNotificationHandler = async () => {
  try {
    const NotificationHandler = {
      topicName: Utility.transformGeneralTopicName(Utility.ENUMS.NOTIFICATION, Utility.ENUMS.EVENT),
      config: Utility.getKafkaConfig(Utility.ENUMS.CONSUMER, Utility.ENUMS.NOTIFICATION.toUpperCase(), Utility.ENUMS.EVENT.toUpperCase())
    }
    NotificationHandler.config.rdkafkaConf['client.id'] = NotificationHandler.topicName
    await createHandler(NotificationHandler.topicName, NotificationHandler.config)
    await isConnected(NotificationHandler.topicName)

    return true
  } catch (err) {
    Logger.error(err)
    throw ErrorHandler.Factory.reformatFSPIOPError(err)
  }
}
/**
 * @function getListOfTopics
 *
 * @description Get a list of topics that the consumer has subscribed to
 *
 * @returns {Array<string>} - list of topics
 */
const getListOfTopics = () => {
  return Object.keys(listOfConsumers)
}

const getMetadataPromise = (consumer, topic) => {
  return new Promise((resolve, reject) => {
    const cb = (err, metadata) => {
      if (err) {
        return reject(new Error('Error connecting to consumer'))
      }

      return resolve(metadata)
    }

    consumer.getMetadata({ topic, timeout: 3000 }, cb)
  })
}

/**
 * @function isConnected
 *
 * @param {string} topicName - the topic name of the consumer to check
 *
 * @description Use this to determine whether or not we are connected to the broker. Internally, it calls `getMetadata` to determine
 * if the broker client is connected.
 *
 * @returns {true} - if connected
 * @throws {Error} - if consumer can't be found or the consumer is not connected
 */
const isConnected = async topicName => {
  const consumer = getConsumer(topicName)

  const metadata = await getMetadataPromise(consumer, topicName)
  const foundTopics = metadata.topics.map(topic => topic.name)
  if (foundTopics.indexOf(topicName) === -1) {
    Logger.debug(`Connected to consumer, but ${topicName} not found.`)
    throw ErrorHandler.Factory.createInternalServerFSPIOPError(`Connected to consumer, but ${topicName} not found.`)
  }

  return true
}

module.exports = {
  createHandler,
  getConsumer,
  getListOfTopics,
  isConsumerAutoCommitEnabled,
  registerNotificationHandler,
  isConnected
}
