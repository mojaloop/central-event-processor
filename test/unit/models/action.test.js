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
const ActionSchema = require('../../../src/models/action').actionModel

describe('Mongo actionModel', () => {

  // Db field isActive
  it('Field isActive should throw error if invalid object is created', (done) => {
    var actionModel = new ActionSchema({isActive: 'test' })

    actionModel.validate((err) => {
      Expect(err.errors.isActive).to.exist;
      done();
    });
  });

  it('Field isActive should succeed if an object is created', (done) => {
    var actionModel = new ActionSchema({isActive: true })

    actionModel.validate((err) => {
      Expect(!err);
      done();
    });
  });

  // Db field timesTriggered
  it('Field timesTriggered should throw error if invalid object is created', (done) => {
    var actionModel = new ActionSchema({timesTriggered: 'A' })

    actionModel.validate((err) => {
      Expect(err.errors.timesTriggered).to.exist;
      done();
    });
  });

  it('Field timesTriggered should succeed if an object is created', (done) => {
    var actionModel = new ActionSchema({timesTriggered: 1 })

    actionModel.validate((err) => {
      Expect(!err);
      done();
    });
  });

  // Db field fromEvent
  it('Field fromEvent should throw error if invalid object is created', (done) => {
    var actionModel = new ActionSchema({fromEvent: 'A' })

    actionModel.validate((err) => {
      Expect(err.errors.fromEvent).to.exist;
      done();
    });
  });

  it('Field fromEvent should succeed if an object is created', (done) => {
    var actionModel = new ActionSchema({fromEvent: Object })

    actionModel.validate((err) => {
      Expect(!err);
      done();
    });
  });

  // Db field triggeredBy
  it('Field triggeredBy should throw error if invalid object is created', (done) => {
    var actionModel = new ActionSchema({triggeredBy: 1 })

    actionModel.validate((err) => {
      Expect(err.errors.triggeredBy).to.exist;
      done();
    });
  });

  it('Field triggeredBy should succeed if an object is created', (done) => {
    var actionModel = new ActionSchema({triggeredBy: '435c6890-376f-4947-9d70-7063dd3745d4' })

    actionModel.validate((err) => {
      Expect(!err);
      done();
    });
  });
});