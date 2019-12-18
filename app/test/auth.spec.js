import chai from 'chai';
import chaiJsonAjv from 'chai-json-schema-ajv';
import assert from 'assert';
import request from 'supertest';

import app from '..';
/* eslint-disable-next-line import/named */
import { userPassword, user } from '../src/config';

chai.use(chaiJsonAjv.create({ allErrors: true, $data: true, verbose: true }));

const should = chai.should();

{
  let errorSchema;
  let resBodySchema;

  before('Define the "error" and the "success" response schemas', done => {
    const name = {
      type: 'string',
      minLength: 3,
      maxLength: 16,
    };
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
          required: ['user_id', 'is_admin', 'token', 'email', 'first_name', 'last_name'],
          properties: {
            user_id: {
              type: 'number',
              minimum: 1,
            },
            is_admin: {
              type: 'boolean',
              const: false,
            },
            token: {
              type: 'string',
              pattern: '^[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\.?[A-Za-z0-9-_.+/=]*$',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            first_name: name,
            last_name: name,
          },
        },
      },
    };

    done();
  });
  describe('POST auth/signup', () => {
    it('should successfully register a user', done => {
      const newUser = {
        first_name: 'Mack',
        last_name: 'Ten',
        email: 'mack10@bullets.com',
        password: 'Mackeleven33',
      };
      request(app)
        .post('/api/v1/auth/signup')
        .send(newUser)
        .end((err, res) => {
          res.body.should.be.jsonSchema(resBodySchema);
          should.not.exist(err);
          res.status.should.equal(201);

          done();
        });
    });

    it('should fail to register a user that already exists on the database', done => {
      const newUser = {
        first_name: 'John',
        last_name: 'Dog',
        email: 'john@yahoo.com',
        password: 'Whykillmydog12',
      };
      errorSchema.properties.error.const = 'A user with this email already exists';
      request(app)
        .post('/api/v1/auth/signup')
        .send(newUser)
        .end((err, res) => {
          res.body.should.be.jsonSchema(errorSchema);
          should.not.exist(err);
          res.status.should.equal(409);

          done();
        });
    });

    it('should fail to register a user if first name is missing', done => {
      const newUser = {
        last_name: 'Cube',
        email: 'ice@cube.com',
        password: 'dieniggaZ34',
      };
      errorSchema.properties.error.const = '"first_name" is a required field';
      request(app)
        .post('/api/v1/auth/signup')
        .send(newUser)
        .end((err, res) => {
          res.body.should.be.jsonSchema(errorSchema);
          should.not.exist(err);
          res.status.should.equal(400);

          done();
        });
    });

    it('should fail to register a user if last name is a number', done => {
      const newUser = {
        first_name: 'Cube',
        last_name: 345,
        email: 'ice@cube.com',
        password: 'Dieniggaz34',
      };
      errorSchema.properties.error.const = '"last_name" should be a string';
      request(app)
        .post('/api/v1/auth/signup')
        .send(newUser)
        .end((err, res) => {
          res.body.should.be.jsonSchema(errorSchema);
          should.not.exist(err);
          res.status.should.equal(400);

          done();
        });
    });

    it('should fail to register a user if email is missing', done => {
      const newUser = {
        first_name: 'Ice',
        last_name: 'Cube',
        password: 'Dieniggaz34',
      };
      errorSchema.properties.error.const = '"email" is a required field';
      request(app)
        .post('/api/v1/auth/signup')
        .send(newUser)
        .end((err, res) => {
          res.body.should.be.jsonSchema(errorSchema);
          should.not.exist(err);
          res.status.should.equal(400);

          done();
        });
    });

    it('should fail to register a user if email is not valid', done => {
      const newUser = {
        first_name: 'Ice',
        last_name: 'Cube',
        email: 'o@y.k',
        password: 'Dieniggaz34',
      };
      errorSchema.properties.error.const = '"email" should be a valid email';
      request(app)
        .post('/api/v1/auth/signup')
        .send(newUser)
        .end((err, res) => {
          res.body.should.be.jsonSchema(errorSchema);
          should.not.exist(err);
          res.status.should.equal(400);

          done();
        });
    });

    it('should fail to register a user if password is missing', done => {
      const newUser = {
        first_name: 'Ice',
        last_name: 'Cube',
        email: 'ice@cube.com',
      };
      errorSchema.properties.error.const = '"password" is a required field';
      request(app)
        .post('/api/v1/auth/signup')
        .send(newUser)
        .end((err, res) => {
          res.body.should.be.jsonSchema(errorSchema);
          should.not.exist(err);
          res.status.should.equal(400);

          done();
        });
    });

    it('should fail to register a user if password does not match the regex pattern', done => {
      const newUser = {
        first_name: 'Ice',
        last_name: 'Cube',
        password: 'toocoolTodie',
        email: 'ice@cube.com',
      };
      errorSchema.properties.error.const =
        '"password" should include at least 1 upper and 1 lower alphabet, and 1 digit';
      request(app)
        .post('/api/v1/auth/signup')
        .send(newUser)
        .end((err, res) => {
          res.body.should.be.jsonSchema(errorSchema);
          should.not.exist(err);
          res.status.should.equal(400);

          done();
        });
    });
  });

  describe('POST auth/signin', () => {
    it('should signin successfully', done => {
      const logUser = {
        email: user,
        password: userPassword,
      };
      request(app)
        .post('/api/v1/auth/signin')
        .send(logUser)
        .end((err, res) => {
          res.body.should.be.jsonSchema(resBodySchema);
          should.not.exist(err);
          res.status.should.equal(200);

          done();
        });
    });

    it('should fail to signin a user that does not exist on the database', done => {
      const logUser = {
        email: 'kratos@olympus.com',
        password: 'spearOfDestiny1000',
      };
      errorSchema.properties.error.const = 'Incorrect Email or Password';
      request(app)
        .post('/api/v1/auth/signin')
        .send(logUser)
        .end((err, res) => {
          res.body.should.be.jsonSchema(errorSchema);
          should.not.exist(err);
          res.status.should.equal(401);

          done();
        });
    });

    it('should fail to signin if email is missing', done => {
      const logUser = {
        password: userPassword,
      };
      errorSchema.properties.error.const = '"email" is a required field';
      request(app)
        .post('/api/v1/auth/signin')
        .send(logUser)
        .end((err, res) => {
          res.body.should.be.jsonSchema(errorSchema);
          should.not.exist(err);
          res.status.should.equal(400);

          done();
        });
    });

    it('should fail to signin if email is not valid', done => {
      const logUser = {
        email: 'd@j.c',
        password: userPassword,
      };
      errorSchema.properties.error.const = '"email" should be a valid email';
      request(app)
        .post('/api/v1/auth/signin')
        .send(logUser)
        .end((err, res) => {
          res.body.should.be.jsonSchema(errorSchema);
          should.not.exist(err);
          res.status.should.equal(400);

          done();
        });
    });

    it('should fail to signin if password is missing', done => {
      const logUser = {
        email: user,
      };
      errorSchema.properties.error.const = '"password" is a required field';
      request(app)
        .post('/api/v1/auth/signin')
        .send(logUser)
        .end((err, res) => {
          res.body.should.be.jsonSchema(errorSchema);
          should.not.exist(err);
          res.status.should.equal(400);

          done();
        });
    });
  });
}
