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
const LimitSchema = require('../../../src/models/limits').limitModel

describe('Mongo limits model', () => {

  // Db field name
  it('Field name should throw error if invalid name is created', (done) => {
    var limitModel = new LimitSchema({name: '' })

    limitModel.validate((err) => {
      Expect(err.errors.name).to.exist;
      done();
    });
  });

  it('Field name should succeed if valid name is created', (done) => {
    var limitModel = new LimitSchema({name: 'dfsp1' })

    limitModel.validate((err) => {
      Expect(!err);
      done();
    });
  });

  // Db field currency
  it('Field currency should throw error if invalid currency is created', (done) => {
    var limitModel = new LimitSchema({currency: '' })

    limitModel.validate((err) => {
      Expect(err.errors.currency).to.exist;
      done();
    });
  });

  it('Field currency should succeed if currency is created', (done) => {
    var limitModel = new LimitSchema({currency: 'USD' })

    limitModel.validate((err) => {
      Expect(!err);
      done();
    });
  });

  // Db field oldValue
  it('Field oldValue should throw error if invalid oldValue is created', (done) => {
    var limitModel = new LimitSchema({oldValue: 'A' })

    limitModel.validate((err) => {
      Expect(err.errors.oldValue).to.exist;
      done();
    });
  });

  it('Field oldValue should succeed if oldValue is created', (done) => {
    var limitModel = new LimitSchema({oldValue: 1 })

    limitModel.validate((err) => {
      Expect(!err);
      done();
    });
  });

  // Db field type
  it('Field type should throw error if invalid type is created', (done) => {
    var limitModel = new LimitSchema({type: '' })

    limitModel.validate((err) => {
      Expect(err.errors.type).to.exist;
      done();
    });
  });

  it('Field type should succeed if type is created', (done) => {
    var limitModel = new LimitSchema({type: 'Test Type' })

    limitModel.validate((err) => {
      Expect(!err);
      done();
    });
  });

  // Db field value
  it('Field value should throw error if invalid value is created', (done) => {
    var limitModel = new LimitSchema({value: 'A' })

    limitModel.validate((err) => {
      Expect(err.errors.value).to.exist;
      done();
    });
  });

  it('Field value should succeed if a value is created', (done) => {
    var limitModel = new LimitSchema({value: 5 })

    limitModel.validate((err) => {
      Expect(!err);
      done();
    });
  });

  // Db field repetitions
  it('Field repetitions should throw error if invalid repetitions is created', (done) => {
    var limitModel = new LimitSchema({repetitions: 'a' })

    limitModel.validate((err) => {
      Expect(err.errors.repetitions).to.exist;
      done();
    });
  });

  it('Field repetitions should succeed if a repetitions is created', (done) => {
    var limitModel = new LimitSchema({repetitions: 3 })

    limitModel.validate((err) => {
      Expect(!err);
      done();
    });
  });

  // Db field threshold
  it('Field threshold should throw error if invalid threshold is created', (done) => {
    var limitModel = new LimitSchema({threshold: 'a' })

    limitModel.validate((err) => {
      Expect(err.errors.threshold).to.exist;
      done();
    });
  });

  it('Field threshold should succeed if a threshold is created', (done) => {
    var limitModel = new LimitSchema({threshold: 3 })

    limitModel.validate((err) => {
      Expect(!err);
      done();
    });
  });
});