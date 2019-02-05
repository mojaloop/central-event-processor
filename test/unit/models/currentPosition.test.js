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

const Expect = require('chai').expect
const CurrentPositionSchema = require('../../../src/models/currentPosition').currentPositionModel

describe('Mongo currentPosition model', () => {

  // Db field name
  it('Field name should throw error if invalid name is created', (done) => {
    var currentpositionModel = new CurrentPositionSchema({name: '' })

    currentpositionModel.validate((err) => {
      Expect(err.errors.name).to.exist;
      done();
    });
  });

  it('Field name should succeed if valid name is created', (done) => {
    var currentpositionModel = new CurrentPositionSchema({name: 'dfsp1' })

    currentpositionModel.validate((err) => {
      Expect(!err);
      done();
    });
  });

  // Db field currency
  it('Field currency should throw error if invalid currency is created', (done) => {
    var currentpositionModel = new CurrentPositionSchema({currency: '' })

    currentpositionModel.validate((err) => {
      Expect(err.errors.currency).to.exist;
      done();
    });
  });

  it('Field currency should succeed if currency is created', (done) => {
    var currentpositionModel = new CurrentPositionSchema({currency: 'USD' })

    currentpositionModel.validate((err) => {
      Expect(!err);
      done();
    });
  });

  // Db field positionValue
  it('Field positionValue should throw error if invalid positionValue is created', (done) => {
    var currentpositionModel = new CurrentPositionSchema({positionValue: 'A' })

    currentpositionModel.validate((err) => {
      Expect(err.errors.positionValue).to.exist;
      done();
    });
  });

  it('Field positionValue should succeed if positionValue is created', (done) => {
    var currentpositionModel = new CurrentPositionSchema({positionValue: 1 })

    currentpositionModel.validate((err) => {
      Expect(!err);
      done();
    });
  });

  // Db field percentage
  it('Field percentage should throw error if invalid percentage is created', (done) => {
    var currentpositionModel = new CurrentPositionSchema({percentage: 'A' })

    currentpositionModel.validate((err) => {
      Expect(err.errors.percentage).to.exist;
      done();
    });
  });

  it('Field percentage should succeed if percentage is created', (done) => {
    var currentpositionModel = new CurrentPositionSchema({percentage: 90 })

    currentpositionModel.validate((err) => {
      Expect(!err);
      done();
    });
  });

  // Db field transferId
  it('Field transferId should throw error if invalid transferId is created', (done) => {
    var currentpositionModel = new CurrentPositionSchema({transferId: '' })

    currentpositionModel.validate((err) => {
      Expect(err.errors.transferId).to.exist;
      done();
    });
  });

  it('Field transferId should succeed if a transferId is created', (done) => {
    var currentpositionModel = new CurrentPositionSchema({transferId: '435c6890-376f-4947-9d70-7063dd3745d4' })

    currentpositionModel.validate((err) => {
      Expect(!err);
      done();
    });
  });

  // Db field messagePayload
  it('Field messagePayload should throw error if invalid payload is created', (done) => {
    var currentpositionModel = new CurrentPositionSchema({messagePayload: '' })

    currentpositionModel.validate((err) => {
      Expect(err.errors.messagePayload).to.exist;
      done();
    });
  });

  it('Field messagePayload should succeed if a payload is created', (done) => {
    var currentpositionModel = new CurrentPositionSchema({messagePayload: '435c6890-376f' })

    currentpositionModel.validate((err) => {
      Expect(!err);
      done();
    });
  });
});