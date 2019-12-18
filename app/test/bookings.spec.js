/* eslint-disable camelcase */
import chai from 'chai';
import chaiJsonAjv from 'chai-json-schema-ajv';
import assert from 'assert';
import request from 'supertest';
import moment from 'moment';

import app from '..';
/* eslint-disable-next-line import/named */
import { adminPassword, admin, user, user2, user3, userPassword } from '../src/config';

chai.use(chaiJsonAjv.create({ allErrors: true, $data: true, verbose: true }));

const should = chai.should();
const current_time = moment();

let adminToken;
let userToken;
let user2Token;
let user3Token;
let errorSchema;
let errorPatternSchema;
let resBodySchema;
let resBodyGetAllSchema;
let bus1;
let bus2;
let bus3;
let trip1;
let trip2;
let trip3;
let user_id;
let booking1_id;
let booking2_id;

before('Define the error and response schemas, and create two trips', async () => {
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
  errorPatternSchema = {
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
        pattern:
          '^This seat_number is unavailable for this trip. Available seat\\(s\\): \\(([1-9]?\\d,\\s)*[1-9]?\\d\\)$',
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
        required: [
          'booking_id',
          'user_id',
          'trip_id',
          'bus_id',
          'trip_date',
          'seat_number',
          'first_name',
          'last_name',
          'email',
        ],
        properties: {
          booking_id: {
            type: 'integer',
            minimum: 1,
          },
          user_id: {
            type: 'integer',
            minimum: 1,
          },
          trip_id: {
            type: 'integer',
            minimum: 1,
          },
          bus_id: {
            type: 'integer',
            minimum: 1,
          },
          trip_date: {
            type: 'string',
            format: 'date',
            formatMinimum: current_time.format('YYYY-MM-DD'),
          },
          seat_number: {
            type: 'integer',
            minimum: 1,
          },
          first_name: alphanum_string,
          last_name: alphanum_string,
          email: {
            type: 'string',
            format: 'email',
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
          required: [
            'booking_id',
            'user_id',
            'trip_id',
            'bus_id',
            'trip_date',
            'seat_number',
            'first_name',
            'last_name',
            'email',
          ],
          properties: {
            booking_id: {
              type: 'integer',
              minimum: 1,
            },
            user_id: {
              type: 'integer',
              minimum: 1,
            },
            trip_id: {
              type: 'integer',
              minimum: 1,
            },
            bus_id: {
              type: 'integer',
              minimum: 1,
            },
            trip_date: {
              type: 'string',
              format: 'date',
              formatMinimum: current_time.format('YYYY-MM-DD'),
            },
            seat_number: {
              type: 'integer',
              minimum: 1,
            },
            first_name: alphanum_string,
            last_name: alphanum_string,
            email: {
              type: 'string',
              format: 'email',
            },
          },
        },
      },
    },
  };

  const Bus = {
    number_plate: 'lag-765nx',
    manufacturer: 'mazda',
    year: 2017,
    model: 'wrecker589',
    capacity: 1,
  };
  const Bus2 = {
    number_plate: 'abj-746rd',
    manufacturer: 'nissan',
    year: 2019,
    model: 'nbj',
    capacity: 50,
  };
  const Bus3 = {
    number_plate: 'lag-746uy',
    manufacturer: 'kawaki',
    year: 2019,
    model: 'ice',
    capacity: 50,
  };
  const resLogin = await request(app)
    .post('/api/v1/auth/signin')
    .send({ email: admin, password: adminPassword });
  adminToken = resLogin.body.data.token;
  const resLogin2 = await request(app)
    .post('/api/v1/auth/signin')
    .send({ email: user, password: userPassword });
  userToken = resLogin2.body.data.token;
  user_id = resLogin2.body.data.user_id;
  const resLogin3 = await request(app)
    .post('/api/v1/auth/signin')
    .send({ email: user2, password: userPassword });
  user2Token = resLogin3.body.data.token;
  const resLogin4 = await request(app)
    .post('/api/v1/auth/signin')
    .send({ email: user3, password: userPassword });
  user3Token = resLogin4.body.data.token;
  // create buses for tests
  const resBus = await request(app)
    .post('/api/v1/buses')
    .send(Bus)
    .set('Authorization', `Bearer ${adminToken}`);
  bus1 = resBus.body.data;
  const resBus2 = await request(app)
    .post('/api/v1/buses')
    .send(Bus2)
    .set('Authorization', `Bearer ${adminToken}`);
  bus2 = resBus2.body.data;
  const resBus3 = await request(app)
    .post('/api/v1/buses')
    .send(Bus3)
    .set('Authorization', `Bearer ${adminToken}`);
  bus3 = resBus3.body.data;
  const Trip = {
    bus_id: bus1.bus_id,
    origin: 'alakija',
    destination: 'ibadan',
    trip_date: '2100-12-16',
    fare: 2000,
  };
  const Trip2 = {
    bus_id: bus2.bus_id,
    origin: 'abuleado',
    destination: 'island',
    trip_date: '2100-12-16',
    fare: 500,
  };
  const Trip3 = {
    bus_id: bus3.bus_id,
    origin: 'kano',
    destination: 'jos',
    trip_date: '2100-12-16',
    fare: 10000,
  };
  const resTrip = await request(app)
    .post('/api/v1/trips')
    .send(Trip)
    .set('Authorization', `Bearer ${adminToken}`);
  trip1 = resTrip.body.data;
  const resTrip2 = await request(app)
    .post('/api/v1/trips')
    .send(Trip2)
    .set('Authorization', `Bearer ${adminToken}`);
  trip2 = resTrip2.body.data;
  const resTrip3 = await request(app)
    .post('/api/v1/trips')
    .send(Trip3)
    .set('Authorization', `Bearer ${adminToken}`);
  trip3 = resTrip3.body.data;
  await request(app)
    .patch(`/api/v1/trips/${trip3.trip_id}`)
    .set('Authorization', `Bearer ${adminToken}`);
});

describe('POST /bookings', () => {
  it('should create a booking without specifying a seat number', done => {
    const newBooking = {
      trip_id: trip1.trip_id,
    };
    request(app)
      .post('/api/v1/bookings')
      .send(newBooking)
      .set('Authorization', `Bearer ${userToken}`)
      .end((err, res) => {
        booking1_id = res.body.data.booking_id;
        res.body.should.be.jsonSchema(resBodySchema);
        should.not.exist(err);
        res.status.should.equal(201);

        done();
      });
  });

  it('should create a booking with a seat number', done => {
    const newBooking = {
      trip_id: trip2.trip_id,
      seat_number: 2,
    };
    request(app)
      .post('/api/v1/bookings')
      .send(newBooking)
      .set('Authorization', `Bearer ${user2Token}`)
      .end((err, res) => {
        booking2_id = res.body.data.booking_id;
        res.body.should.be.jsonSchema(resBodySchema);
        should.not.exist(err);
        res.status.should.equal(201);

        done();
      });
  });

  it('should fail to book a trip if the "user_id" provided is not the client\'s', done => {
    const newBooking = {
      trip_id: trip2.trip_id,
      user_id: 99,
    };
    errorSchema.properties.error.const = 'This "user_id" is not yours';
    request(app)
      .post('/api/v1/bookings')
      .send(newBooking)
      .set('Authorization', `Bearer ${user3Token}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(403);

        done();
      });
  });

  it('should fail to book a trip if trip_id is missing', done => {
    errorSchema.properties.error.const = '"trip_id" is a required field';
    request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${user3Token}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(400);

        done();
      });
  });

  it('should fail to book a trip if the trip is unavailable', done => {
    const newBooking = {
      trip_id: 500,
    };
    errorSchema.properties.error.const = 'This trip is unavailable';
    request(app)
      .post('/api/v1/bookings')
      .send(newBooking)
      .set('Authorization', `Bearer ${user3Token}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(404);

        done();
      });
  });

  it('should fail to book a trip if the trip is "cancelled"', done => {
    const newBooking = {
      trip_id: trip3.trip_id,
    };
    errorSchema.properties.error.const = 'This trip is cancelled';
    request(app)
      .post('/api/v1/bookings')
      .send(newBooking)
      .set('Authorization', `Bearer ${user3Token}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(400);

        done();
      });
  });

  it('should fail to book a trip if the client is already booked on this trip', done => {
    const newBooking = {
      trip_id: trip1.trip_id,
    };
    errorSchema.properties.error.const = 'You are already booked on this trip';
    request(app)
      .post('/api/v1/bookings')
      .send(newBooking)
      .set('Authorization', `Bearer ${userToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(409);

        done();
      });
  });

  it('should fail to book a trip if there is no free seat on this trip', done => {
    const newBooking = {
      trip_id: trip1.trip_id,
    };
    errorSchema.properties.error.const = 'All seats on this trip have been booked';
    request(app)
      .post('/api/v1/bookings')
      .send(newBooking)
      .set('Authorization', `Bearer ${user3Token}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(404);

        done();
      });
  });

  it("should fail to book a trip if the specified seat_number is is bigger than the capacity of this trip's bus ", done => {
    const newBooking = {
      trip_id: trip2.trip_id,
      seat_number: 1000,
    };
    request(app)
      .post('/api/v1/bookings')
      .send(newBooking)
      .set('Authorization', `Bearer ${user3Token}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorPatternSchema);
        should.not.exist(err);
        res.status.should.equal(404);

        done();
      });
  });

  it('should fail to book a trip if the specified seat_number is already booked', done => {
    const newBooking = {
      trip_id: trip2.trip_id,
      seat_number: 2,
    };
    errorPatternSchema.properties.error.pattern =
      '^Seat is already occupied. Available seat\\(s\\): \\(([1-9]?\\d,\\s)*[1-9]?\\d\\)$';
    request(app)
      .post('/api/v1/bookings')
      .send(newBooking)
      .set('Authorization', `Bearer ${user3Token}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorPatternSchema);
        should.not.exist(err);
        res.status.should.equal(409);

        done();
      });
  });
});

describe('GET /bookings', () => {
  it('should get all bookings with admin token', done => {
    request(app)
      .get('/api/v1/bookings')
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(resBodyGetAllSchema);
        should.not.exist(err);
        res.status.should.equal(200);

        done();
      });
  });
  it('should get all bookings with user token', done => {
    request(app)
      .get('/api/v1/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .end((err, res) => {
        console.log(res.body);
        res.body.should.be.jsonSchema(resBodyGetAllSchema);
        should.not.exist(err);
        res.status.should.equal(200);

        done();
      });
  });
  it('should fail to get all bookings with admin token if "is_admin" is false', done => {
    const reqBody = {
      token: adminToken,
      is_admin: false,
    };
    errorSchema.properties.error.const = 'You are "admin". "is_admin" should be true';
    request(app)
      .get('/api/v1/bookings')
      .send(reqBody)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(400);
        done();
      });
  });
  it('should fail to get all bookings if "user_id" is not yours', done => {
    const reqBody = {
      token: adminToken,
      is_admin: true,
      user_id: user_id + 1,
    };
    errorSchema.properties.error.const = 'This "user_id" is not yours';
    request(app)
      .get('/api/v1/bookings')
      .send(reqBody)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(403);
        done();
      });
  });
});

describe('GET /bookings/:booking_id', () => {
  it('should get a booking', done => {
    request(app)
      .get(`/api/v1/bookings/${booking2_id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(resBodySchema);
        should.not.exist(err);
        res.status.should.equal(200);

        done();
      });
  });
  it('should fail to get a booking that is not on the database', done => {
    errorSchema.properties.error.const = 'A booking with this ID does not exist';
    request(app)
      .get('/api/v1/bookings/5000340')
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(404);

        done();
      });
  });
  it('should fail to get a booking if the booking_id is not convertible to a number', done => {
    errorSchema.properties.error.const = '"booking_id" should be a number';
    request(app)
      .get('/api/v1/bookings/"hell0"')
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(400);

        done();
      });
  });
});

describe('DELETE /bookings/:booking_id', () => {
  let resDelBookingSchema;
  before('modify resbodyschema to test patch trips', done => {
    resDelBookingSchema = JSON.parse(JSON.stringify(resBodySchema));
    resDelBookingSchema.properties.data.properties.message = {
      type: 'string',
      const: 'Booking deleted successfully',
    };

    done();
  });
  it('should delete a booking', done => {
    request(app)
      .delete(`/api/v1/bookings/${booking1_id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(resDelBookingSchema);
        should.not.exist(err);
        res.status.should.equal(200);

        done();
      });
  });
  it('should fail to delete booking if it does not belong to the client', done => {
    errorSchema.properties.error.const = 'This booking is not yours';
    request(app)
      .delete(`/api/v1/bookings/${booking2_id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(403);

        done();
      });
  });
  it('should fail to delete booking if "user_id" does not belong to the client', done => {
    errorSchema.properties.error.const = 'This "user_id" is not yours';
    const reqBody = {
      user_id: 80000,
      is_admin: false,
    };
    request(app)
      .delete(`/api/v1/bookings/${booking1_id}`)
      .send(reqBody)
      .set('Authorization', `Bearer ${user2Token}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(403);

        done();
      });
  });
  it('should fail to delete booking if it does not exist', done => {
    errorSchema.properties.error.const = 'Booking not found';
    request(app)
      .delete('/api/v1/bookings/49999900')
      .set('Authorization', `Bearer ${user2Token}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(404);

        done();
      });
  });
  it('should fail to delete booking if booking_id is not a number', done => {
    errorSchema.properties.error.const = '"booking_id" should be a number';
    request(app)
      .delete('/api/v1/bookings/adjkod')
      .set('Authorization', `Bearer ${user2Token}`)
      .end((err, res) => {
        res.body.should.be.jsonSchema(errorSchema);
        should.not.exist(err);
        res.status.should.equal(400);

        done();
      });
  });
});
