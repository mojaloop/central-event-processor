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

 * ModusBox
 - Georgi Georgiev <georgi.georgiev@modusbox.com>

 --------------
 ******/

'use strict'

/**
 * @module src/lib/enum.js
 */

// Code specific (non-DB) enumerations sorted alphabetically
const transferEventType = {
  PREPARE: 'prepare',
  POSITION: 'position',
  TRANSFER: 'transfer',
  FULFIL: 'fulfil',
  NOTIFICATION: 'notification',
  ADMIN: 'admin',
  GET: 'get'
}

const notificationActionMap = {
  NET_DEBIT_CAP_THRESHOLD_BREACH_EMAIL: {
    enum: 'NET_DEBIT_CAP_THRESHOLD_BREACH_EMAIL',
    action: 'sendEmail',
    templateType: 'breach',
    language: 'en'
  },
  NET_DEBIT_CAP_ADJUSTMENT_EMAIL: {
    enum: 'NET_DEBIT_CAP_ADJUSTMENT_EMAIL',
    action: 'sendEmail',
    templateType: 'adjustment',
    language: 'en'
  },
  SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL: {
    enum: 'SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL',
    action: 'sendEmail',
    templateType: 'position',
    language: 'en'
  }
}

const limitNotificationMap = {
  NET_DEBIT_CAP: {
    enum: 'NET_DEBIT_CAP',
    NET_DEBIT_CAP_THRESHOLD_BREACH_EMAIL: notificationActionMap.NET_DEBIT_CAP_THRESHOLD_BREACH_EMAIL,
    NET_DEBIT_CAP_ADJUSTMENT_EMAIL: notificationActionMap.NET_DEBIT_CAP_ADJUSTMENT_EMAIL
  }
}

const transferEventAction = {
  PREPARE: 'prepare',
  PREPARE_DUPLICATE: 'prepare-duplicate',
  TRANSFER: 'transfer',
  COMMIT: 'commit',
  ABORT: 'abort',
  TIMEOUT_RECEIVED: 'timeout-received',
  TIMEOUT_RESERVED: 'timeout-reserved',
  REJECT: 'reject',
  FAIL: 'fail',
  EVENT: 'event',
  FULFIL: 'fulfil'
}
const headers = {
  FSPIOP: {
    SWITCH: 'central-switch'
  }
}
const topicMap = {
  notification: {
    prepare: {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'prepare-duplicate': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    commit: {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    abort: {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'timeout-received': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    reject: {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    get: {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'email-notifier': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    },
    'settlement-transfer-position-change': {
      functionality: transferEventType.NOTIFICATION,
      action: transferEventAction.EVENT
    }
  }
}

module.exports = {
  transferEventType,
  transferEventAction,
  headers,
  topicMap,
  limitNotificationMap,
  notificationActionMap
}
