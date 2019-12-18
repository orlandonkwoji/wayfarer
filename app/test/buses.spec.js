/* eslint-disable camelcase */
import chai from 'chai';
import chaiJsonAjv from 'chai-json-schema-ajv';
import assert from 'assert';
import request from 'supertest';
import moment from 'moment';

import app from '..';
/* eslint-disable-next-line import/named */
import { adminPassword, admin } from '../src/config';

chai.use(chaiJsonAjv.create({ allErrors: true, $data: true, verbose: true }));

const should = chai.should();
const current_year = moment().get('year');

let adminToken;
let errorSchema;
let resBodySchema;
before('Define the error and the response schemas', done => {
  errorSchema = {
    title: 'error schema',
    type: 'object',
    required: ['status', 'error'],
    properties: {
      status: {
        type: 'string',
        const: 'error',
      },
      error: {
        type: 'string',
      },
    },
  };
  const alphanum_string = {
    type: 'string',
    minLength: 3,
    maxLength: 16,
    pattern: '^[A-Z0-9]{3,16}$',
  };
  resBodySchema = {
    title: 'Schema of the body of a successful response to a post request',
    type: 'object',
    required: ['status', 'data'],
    properties: {
      status: {
        type: 'string',
        const: 'success',
      },
      data: {
        type: 'object',
        required: ['bus_id', 'number_plate', 'manufacturer', 'model', 'year', 'capacity'],
        properties: {
          bus_id: {
            type: 'integer',
            minimum: 1,
          },
          number_plate: {
            type: 'string',
            pattern: '^[A-Z]{3}-[0-9]{3}[A-Z]{2}$',
            minLength: 9,
            maxLength: 9,
          },
          manufacturer: alphanum_string,
          model: alphanum_string,
          year: {
            type: 'integer',
            minimum: 2011,
            maximum: current_year,
          },
          capacity: {
            type: 'integer',
            minimum: 1,
            maximum: 200,
          },
        },
      },
    },
  };

  request(app)
    .post('/api/v1/auth/signin')
    .send({ email: admin, password: adminPassword })
    .end((err, res) => {
      adminToken = res.body.data.token;

      done();
    });
});

describe('POST /buses', () => {
  it('should add a bus', done => {
    const Bus = {
      number_plate: 'DAM-458YU',
      manufacturer: 'VoLVO',
      year: 2012,
      model: 'ARIAL150',
      capacity: 100,
    };
    request(app)
      .post('/api/v1/buses')
      .send(Bus)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(resBodySchema);
        should.not.exist(err);
        res.status.should.equal(201);

        done();
      });
  });

  it('should fail to add a bus that already exists on the database', done => {
    const Bus = {
      number_plate: 'DAM-458YU',
      manufacturer: 'VOLVO',
      year: 2016,
      model: 'ARIAL150',
      capacity: 100,
    };
    errorSchema.properties.error.const = 'A bus with this plate number already exists';
    request(app)
      .post('/api/v1/buses')
      .send(Bus)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(409);

        done();
      });
  });

  it('should fail to add a bus if number_plate is missing', done => {
    const Bus = {
      manufacturer: 'MAZDA',
      year: 2018,
      model: 'GX150',
      capacity: 50,
    };
    errorSchema.properties.error.const = '"number_plate" is a required field';
    request(app)
      .post('/api/v1/buses')
      .send(Bus)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(400);

        done();
      });
  });

  it('should fail to add a bus if number_plate is of the wrong format', done => {
    const Bus = {
      number_plate: 'DAM458YU9',
      manufacturer: 'MAZDA',
      year: 2018,
      model: 'GX150',
      capacity: 50,
    };
    errorSchema.properties.error.const =
      '"number_plate" should begin with 3 letters, followed by a hyphen and end with 2 letters';
    request(app)
      .post('/api/v1/buses')
      .send(Bus)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(400);

        done();
      });
  });

  it('should fail to add a bus if manufacturer is too short', done => {
    const Bus = {
      number_plate: 'AMC-458YU',
      manufacturer: 'MA',
      year: 2018,
      model: 'GX150',
      capacity: 50,
    };
    errorSchema.properties.error.const = '"manufacturer" should be at least 3 characters';
    request(app)
      .post('/api/v1/buses')
      .send(Bus)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(400);

        done();
      });
  });
});

describe('GET /buses/:bus_id', () => {
  let bus_id;
  before('add a bus to test get trips', async () => {
    const Bus = {
      number_plate: 'RAX-860HU',
      manufacturer: 'TOYOTA',
      year: 2017,
      model: 'CAMRY',
      capacity: 3,
    };
    const response = await request(app)
      .post('/api/v1/buses')
      .send(Bus)
      .set('Authorization', `Bearer ${adminToken}`);
    bus_id = response.body.data.bus_id;
  });
  it('should get a bus', done => {
    request(app)
      .get(`/api/v1/buses/${bus_id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(resBodySchema);
        should.not.exist(err);
        res.status.should.equal(200);

        done();
      });
  });
  it('should fail to get a bus that is not on the database', done => {
    errorSchema.properties.error.const = 'A bus with this ID is not found';
    request(app)
      .get('/api/v1/buses/5000340')
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(404);

        done();
      });
  });
  it('should fail to get a bus if the bus_id is not convertible to a number', done => {
    errorSchema.properties.error.const = '"bus_id" should be a number';
    request(app)
      .get('/api/v1/buses/"hell0"')
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(400);

        done();
      });
  });
});
