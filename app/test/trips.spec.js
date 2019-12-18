/* eslint-disable camelcase */
import chai from 'chai';
import chaiJsonAjv from 'chai-json-schema-ajv';
import assert from 'assert';
import request from 'supertest';
import moment from 'moment';

import app from '..';
/* eslint-disable-next-line import/named */
import { adminPassword, admin, user, userPassword } from '../src/config';

chai.use(chaiJsonAjv.create({ allErrors: true, $data: true, verbose: true }));

const should = chai.should();
const current_time = moment();

let adminToken;
let userToken;
let errorSchema;
let resBodySchema;
let resBodyGetAllSchema;
let bus1;
let bus2;
let bus3;
let bus4;
let trip1;
let trip2;

before('Define the error and response schemas, and add a bus', async () => {
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
        required: ['trip_id', 'bus_id', 'origin', 'destination', 'trip_date', 'fare', 'status'],
        properties: {
          trip_id: {
            type: 'number',
            minimum: 1,
          },
          bus_id: {
            type: 'number',
            minimum: 1,
          },
          origin: alphanum_string,
          destination: { ...alphanum_string, not: { const: { $data: '1/origin' } } },
          trip_date: {
            type: 'string',
            format: 'date',
            formatMinimum: current_time.format('YYYY-MM-DD'),
          },
          fare: {
            type: 'number',
            exclusiveMinimum: 0,
          },
          status: {
            type: 'string',
            const: 'active',
          },
        },
      },
    },
  };
  resBodyGetAllSchema = {
    title: 'Schema of the body of a successful response to a get all request',
    type: 'object',
    required: ['status', 'data'],
    properties: {
      status: {
        type: 'string',
        const: 'success',
      },
      data: {
        type: 'array',
        minItems: 0,
        uniqueItems: true,
        items: {
          type: 'object',
          required: ['trip_id', 'bus_id', 'origin', 'destination', 'trip_date', 'fare', 'status'],
          properties: {
            trip_id: {
              type: 'number',
              minimum: 1,
            },
            bus_id: {
              type: 'number',
              minimum: 1,
            },
            origin: alphanum_string,
            destination: { ...alphanum_string, not: { const: { $data: '1/origin' } } },
            trip_date: {
              type: 'string',
              format: 'date',
              formatMinimum: current_time.format('YYYY-MM-DD'),
            },
            fare: {
              type: 'number',
              exclusiveMinimum: 0,
            },
            status: {
              type: 'string',
            },
          },
        },
      },
    },
  };
  const Bus = {
    number_plate: 'MXN-765PH',
    manufacturer: 'SANTANA',
    year: 2018,
    model: 'GATUX897',
    capacity: 50,
  };
  const Bus2 = {
    number_plate: 'MJN-746ND',
    manufacturer: 'TOYORA',
    year: 2018,
    model: 'X7S',
    capacity: 50,
  };
  const Bus3 = {
    number_plate: 'mac-746sh',
    manufacturer: 'mitsubishi',
    year: 2019,
    model: 'macintosh45',
    capacity: 50,
  };
  const Bus4 = {
    number_plate: 'ace-746sg',
    manufacturer: 'acura',
    year: 2018,
    model: 'zdx',
    capacity: 2,
  };
  const resLogin = await request(app)
    .post('/api/v1/auth/signin')
    .send({ email: admin, password: adminPassword });
  adminToken = resLogin.body.data.token;
  const resLogin2 = await request(app)
    .post('/api/v1/auth/signin')
    .send({ email: user, password: userPassword });
  userToken = resLogin2.body.data.token;
  // create bus1
  const resBus = await request(app)
    .post('/api/v1/buses')
    .send(Bus)
    .set('Authorization', `Bearer ${adminToken}`);
  bus1 = resBus.body.data;
  // create bus2
  const resBus2 = await request(app)
    .post('/api/v1/buses')
    .send(Bus2)
    .set('Authorization', `Bearer ${adminToken}`);
  bus2 = resBus2.body.data;
  // create bus3
  const resBus3 = await request(app)
    .post('/api/v1/buses')
    .send(Bus3)
    .set('Authorization', `Bearer ${adminToken}`);
  bus3 = resBus3.body.data;
  // create bus4
  const resBus4 = await request(app)
    .post('/api/v1/buses')
    .send(Bus4)
    .set('Authorization', `Bearer ${adminToken}`);
  bus4 = resBus4.body.data;
  // create trip1
  const newTrip1 = {
    bus_id: bus3.bus_id,
    origin: 'oshodi',
    destination: 'surulere',
    trip_date: '2100-12-16',
    fare: 1000,
    token: adminToken,
  };
  const resTrip1 = await request(app)
    .post('/api/v1/trips')
    .send(newTrip1)
    .set('Authorization', `Bearer ${adminToken}`);
  trip1 = resTrip1.body.data;
  // create trip2
  const newTrip2 = {
    bus_id: bus4.bus_id,
    origin: 'alakija',
    destination: 'mile2',
    trip_date: '2100-12-16',
    fare: 600,
    token: adminToken,
  };
  const resTrip2 = await request(app)
    .post('/api/v1/trips')
    .send(newTrip2)
    .set('Authorization', `Bearer ${adminToken}`);
  trip2 = resTrip2.body.data;
});

describe('POST /trips', () => {
  it('should create a trip', done => {
    const newTrip = {
      bus_id: bus1.bus_id,
      origin: 'OrILE',
      destination: 'LEKKI',
      trip_date: '2100-12-16',
      fare: 1000,
      token: adminToken,
    };
    request(app)
      .post('/api/v1/trips')
      .send(newTrip)
      .end((err, res) => {
        res.body.should.be.jsonSchema(resBodySchema);
        should.not.exist(err);
        res.status.should.equal(201);

        done();
      });
  });

  it('should fail to create a trip if the bus is for another active trip', done => {
    const newTrip = {
      bus_id: bus1.bus_id,
      origin: 'Orile',
      destination: 'Lekki',
      trip_date: '2100-12-16',
      fare: 1000,
    };
    errorSchema.properties.error.const = 'An active trip with this bus exists';
    request(app)
      .post('/api/v1/trips')
      .send(newTrip)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(409);

        done();
      });
  });

  it('should fail to create a trip if destination is missing', done => {
    const newTrip = {
      bus_id: bus2.bus_id,
      origin: 'Coker',
      trip_date: '2100-12-16',
      fare: 2000,
    };
    errorSchema.properties.error.const = '"destination" is a required field';
    request(app)
      .post('/api/v1/trips')
      .send(newTrip)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(400);

        done();
      });
  });

  it('should fail to create a trip if the bus unavailable', done => {
    const newTrip = {
      bus_id: 2000000,
      origin: 'Orile',
      destination: 'Lekki',
      trip_date: '2100-12-16',
      fare: 1000,
    };
    errorSchema.properties.error.const = 'This bus is unavailable';
    request(app)
      .post('/api/v1/trips')
      .send(newTrip)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(404);

        done();
      });
  });

  it('should fail to create a trip if trip_date is in the past', done => {
    const newTrip = {
      bus_id: bus2.bus_id,
      origin: 'Coker',
      destination: 'Lekki',
      trip_date: '2018-12-16',
      fare: 2000,
    };
    errorSchema.properties.error.const = '"trip_date" should not be in the past';
    request(app)
      .post('/api/v1/trips')
      .send(newTrip)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(400);

        done();
      });
  });

  it('should fail to create a trip if destination and origin are the same', done => {
    const newTrip = {
      bus_id: bus2.bus_id,
      origin: 'Coker',
      destination: 'Coker',
      trip_date: '2100-12-16',
      fare: 2000,
    };
    errorSchema.properties.error.const = '"origin" should not be same as "destination"';
    request(app)
      .post('/api/v1/trips')
      .send(newTrip)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(400);

        done();
      });
  });

  it('should fail to create a trip if trip_date is of wrong format', done => {
    const newTrip = {
      bus_id: bus2.bus_id,
      origin: 'Coker',
      destination: 'Lekki',
      trip_date: '16-2019-12',
      fare: 2000.53,
    };
    errorSchema.properties.error.const =
      '"trip_date" should match the format DD-MM-YYYY or YYYY-MM-DD';
    request(app)
      .post('/api/v1/trips')
      .send(newTrip)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(400);

        done();
      });
  });
});

describe('GET /trips', () => {
  it('should get all trips with user token', done => {
    request(app)
      .get('/api/v1/trips')
      .set('Authorization', `Bearer ${userToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(resBodyGetAllSchema);
        should.not.exist(err);
        res.status.should.equal(200);

        done();
      });
  });
  it('should get all trips from a given origin', done => {
    request(app)
      .get('/api/v1/trips?origin=orile')
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(resBodyGetAllSchema);
        should.not.exist(err);
        res.status.should.equal(200);

        done();
      });
  });
  it('should get all trips to a given destination', done => {
    request(app)
      .get('/api/v1/trips?destination=lekki')
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(resBodyGetAllSchema);
        should.not.exist(err);
        res.status.should.equal(200);

        done();
      });
  });
  it('should fail to get trips if both origin and destination fields in the query are defined', done => {
    errorSchema.properties.error.const = '"origin" is incompatible with "destination"';
    request(app)
      .get('/api/v1/trips?origin=orile&destination=lekki')
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(400);

        done();
      });
  });
  it('should fail to get trips if origin is not alphanumeric', done => {
    errorSchema.properties.error.const = '"origin" should not be an empty field';
    request(app)
      .get('/api/v1/trips?origin=')
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(400);

        done();
      });
  });
});

describe('GET /trips/:trip_id', () => {
  it('should get a trip', done => {
    request(app)
      .get(`/api/v1/trips/${trip1.trip_id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(resBodySchema);
        should.not.exist(err);
        res.status.should.equal(200);

        done();
      });
  });
  it('should fail to get a trip that is not on the database', done => {
    errorSchema.properties.error.const = 'A trip with this ID does not exist';
    request(app)
      .get('/api/v1/trips/5000340')
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(404);

        done();
      });
  });
  it('should fail to get a trip if the trip_id is not convertible to a number', done => {
    errorSchema.properties.error.const = '"trip_id" should be a number';
    request(app)
      .get('/api/v1/trips/"hell0"')
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(400);

        done();
      });
  });
});

describe('PATCH /trips', () => {
  let resPatchSchema;
  before('modify resbodyschema to test patch trips', done => {
    resPatchSchema = JSON.parse(JSON.stringify(resBodySchema));
    resPatchSchema.properties.data.properties.status.const = 'cancelled';
    resPatchSchema.properties.data.properties.message = {
      type: 'string',
      const: 'Trip cancelled successfully',
    };

    done();
  });
  it('should cancel a trip', done => {
    request(app)
      .patch(`/api/v1/trips/${trip1.trip_id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(resPatchSchema);
        should.not.exist(err);
        res.status.should.equal(200);

        done();
      });
  });
  it('should fail to cancel trip if trip_id is not a number', done => {
    errorSchema.properties.error.const = '"trip_id" should be a number';
    request(app)
      .patch('/api/v1/trips/trip_id')
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(400);

        done();
      });
  });
  it('should fail to cancel trip if it is already cancelled', done => {
    errorSchema.properties.error.const = 'This trip is already cancelled';
    request(app)
      .patch(`/api/v1/trips/${trip1.trip_id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(409);

        done();
      });
  });
  it('should fail to cancel trip if it does not exist', done => {
    errorSchema.properties.error.const = 'This trip does not exist';
    request(app)
      .patch('/api/v1/trips/5000')
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(404);

        done();
      });
  });
});
