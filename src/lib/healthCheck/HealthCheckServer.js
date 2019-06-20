
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

 * Lewis Daly <lewis@vesselstech.com>
 --------------
 ******/

const Hapi = require('@hapi/hapi')
const Boom = require('@hapi/boom')
const ErrorHandling = require('@mojaloop/central-services-error-handling')
const Logger = require('@mojaloop/central-services-shared').Logger
const { statusEnum } = require('@mojaloop/central-services-shared').HealthCheck.HealthCheckEnums

/**
 * @function defaultHealthHandler
 *
 * @description Given a health check object, return the default
 *   handler for responding to health checks
 *
 * @param {BaseHealthCheck} healthCheck - the BaseHealthCheck subclass
 *
 * @returns {async (response, h) => any} handler - the HapiJS compatible handler for the health check
 */
const defaultHealthHandler = (healthCheck) => {
  return async (response, h) => {
    let responseBody
    let responseCode = 200
    try {
      responseBody = await healthCheck.getHealth()
    } catch (err) {
      Logger.error(err.message)
    }

    if (!responseBody || responseBody.status !== statusEnum.OK) {
      // Gateway Error
      responseCode = 502
    }

    return h.response(responseBody).code(responseCode)
  }
}

/**
 * @function failAction
 *
 * @description the failure handler for Hapi. We put this here to make it more testable
 *
 */
const failAction = async (request, h, err) => {
  throw Boom.boomify(err)
}

/**
 * @function createHealthCheckServer
 *
 * @description Creates the Hapi HTTP Health check server
 *
 * @param {number} port Port to register the Server against
 * @param {async (response, h) => any} healthCheckHandler A handler that handles HapiJS requests for health
 *
 * @returns {*} server - a HapiJS Server object
 */

const createHealthCheckServer = async (port, healthCheckHandler) => {
  const server = Hapi.server({
    port,
    routes: {
      validate: {
        options: ErrorHandling.validateRoutes(),
        failAction: failAction
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/health',
    handler: healthCheckHandler
  })

  await server.start()
  Logger.info(`Health Check Server running on ${server.info.uri}`)
  return server
}

module.exports = {
  createHealthCheckServer,
  defaultHealthHandler,
  failAction
}