/* eslint-disable camelcase */
import moment from 'moment';
import { badRequestResponse, forbiddenResponse } from '../utils/response';

const joi = require('@hapi/joi').extend(require('@hapi/joi-date'));

const current_year = moment().get('year');

const messages = {
  'string.base': '"{{#label}}" should be a string',
  'string.empty': '"{{#label}}" should not be an empty field',
  'string.alphanum': '"{{#label}}" should be alphanumerical',
  'string.min': '"{{#label}}" should be at least {{#limit}} characters',
  'string.max': '"{{#label}}" should be at most {{#limit}} characters',
  'string.length': '"{{#label}}" should be {{#limit}} characters long',
  'any.required': '"{{#label}}" is a required field',
  'string.email': '"{{#label}}" should be a valid email',
  'string.uppercase': '"{{#label}}" should be upper-cased',
  'number.base': '"{{#label}}" should be a number',
  'number.integer': '"{{#label}}" should be an integer',
  'number.positive': '"{{#label}}" should be positive',
  'number.precision':
    '"{{#label}}" should not be a have more than {{#limit}} decimal places of precision',
  'number.min': '"{{#label}}" should be at least {{#limit}}',
  'number.max': '"{{#label}}" should be at most {{#limit}}',
  'number.unsafe': '"{{#label}}" should not be a computationally unsafe number',
  'number.infinity': '"{{#label}}" should not be a computationally unsafe number',
  'date.base': '"{{#label}}" should be of type "date"',
  'date.format': '"{{#label}}" should match the format DD-MM-YYYY or YYYY-MM-DD',
  'date.greater': '"{{#label}}" should not be in the past',
  'boolean.base': '"{{#label}}" should be a boolean',
};
const login_password_messages = {
  'string.base': 'Invalid Credentials',
  'string.empty': '"{{#label}}" cannot be an empty field',
  'string.alphanum': 'Invalid Credentials',
  'string.min': 'Invalid Credentials',
  'any.required': '"{{#label}}" is a required field',
};
const name = joi
  .string()
  .trim()
  .alphanum()
  .min(3)
  .max(16)
  .uppercase();
const password = joi
  .string()
  .trim()
  .min(8)
  .max(20)
  .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d]{8,20}$/, 'password')
  .required()
  .messages({
    'string.pattern.name':
      '"{{#label}}" should include at least 1 upper and 1 lower alphabet, and 1 digit',
  });
const email = joi
  .string()
  .trim()
  .email({ minDomainSegments: 2 })
  .required()
  .messages(messages);
const number_plate = joi
  .string()
  .trim()
  .length(9, 'utf8')
  .regex(/^[A-Z]{3}-[0-9]{3}[A-Z]{2}$/, 'number_plate')
  .required()
  .uppercase()
  .example('UMZ-824ZS')
  .messages({
    'string.pattern.name':
      '"{{#label}}" should begin with 3 letters, followed by a hyphen and end with 2 letters',
  });
const location = name.example('LAGOS').required();
const locationAlltrip = name.example('LAGOS');
const positive_integer = joi
  .number()
  .integer()
  .positive();
const fare = joi
  .number()
  .positive()
  .precision(2)
  .required();
const trip_date = joi
  .date()
  .greater('now')
  .format(['DD-MM-YYYY', 'YYYY-MM-DD'])
  .required();

class Validate {
  /**
   * @function validateSignup
   * @description Validates user signup
   * @param {object} req Request Object
   * @param {object} res Response Object
   * @param {function} next Next middleware function
   * @returns {function} Next function
   */
  static async validateSignup(req, res, next) {
    const schema = joi
      .object()
      .keys({
        first_name: name.example('ORLANDO').required(),
        last_name: name.example('NKWOJI').required(),
        email,
        password,
      })
      .messages(messages);
    try {
      const value = await schema.validateAsync(req.body, {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
        errors: { stack: true, label: 'key', wrapArrays: true },
      });
      req.body = value;
    } catch (error) {
      return badRequestResponse(res, error.message);
    }
    return next();
  }

  /**
   * @function validateSignin
   * @description Validates user signin
   * @param {object} req Request Object
   * @param {object} res Response Object
   * @param {function} next Next middleware function
   * @returns {function} Next function
   */
  static async validateSignin(req, res, next) {
    const schema = joi.object().keys({
      email,
      password: joi
        .string()
        .trim()
        .alphanum()
        .min(1)
        .required()
        .messages(login_password_messages),
    });
    try {
      const value = await schema.validateAsync(req.body, {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
        errors: { stack: true, label: 'key', wrapArrays: true },
      });
      req.body = value;
    } catch (error) {
      return badRequestResponse(res, error.message);
    }
    return next();
  }

  /**
   * @function addBusValidator
   * @description Validates user signin
   * @param {object} req Request Object
   * @param {object} res Response Object
   * @param {function} next Next middleware function
   * @returns {function} Next function
   */
  static async addBusValidator(req, res, next) {
    const schema = joi
      .object()
      .keys({
        number_plate,
        manufacturer: name.example('TOYOTA').required(),
        model: name.example('CAMRYXLE').required(),
        year: joi
          .number()
          .integer()
          .positive()
          .min(2011)
          .max(current_year)
          .required()
          .example(2016),
        capacity: positive_integer.min(1).required(),
      })
      .messages(messages);
    try {
      const value = await schema.validateAsync(req.body, {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
      });
      req.body = value;
    } catch (error) {
      return badRequestResponse(res, error.message);
    }
    return next();
  }

  /**
   * @function addTripValidator
   * @description Validates user signin
   * @param {object} req Request Object
   * @param {object} res Response Object
   * @param {function} next Next middleware function
   * @returns {function} Next function
   */
  static async addTripValidator(req, res, next) {
    const schema = joi
      .object()
      .keys({
        bus_id: positive_integer.min(1).required(),
        origin: location.invalid(joi.ref('destination')),
        destination: location,
        fare,
        trip_date,
      })
      .messages(messages);
    try {
      const value = await schema.validateAsync(req.body, {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
      });
      req.body = value;
    } catch (error) {
      const errMessage = error.details
        .map(err => {
          if (err.type === 'any.invalid') {
            return `"${err.context.key}" should not be same as "${err.context.invalids[0].key}"`;
          }
          return err.message;
        })
        .join('. ');
      return badRequestResponse(res, errMessage);
    }
    return next();
  }

  /**
   * @function addAllTripsValidator
   * @description Validates user signin
   * @param {object} req Request Object
   * @param {object} res Response Object
   * @param {function} next Next middleware function
   * @returns {function} Next function
   */
  static async addAllTripsValidator(req, res, next) {
    const schema = joi
      .object()
      .keys({
        origin: locationAlltrip,
        destination: locationAlltrip,
      })
      .oxor('origin', 'destination')
      .messages(messages);
    try {
      const value = await schema.validateAsync(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });
      req.query = value;
    } catch (error) {
      const errMessage = error.details
        .map(
          err =>
            err.type === 'object.oxor'
              ? `"${err.context.peers[0]}" is incompatible with "${err.context.peers[1]}"`
              : err.message,
          /* {
          if (err.type === 'object.oxor') {
            console.log(err.context);
            return `"${err.context.peers[0]}" is incompatible with "${err.context.peers[1]}"`;
          }
          return err.message;
        } */
        )
        .join('. ');
      return badRequestResponse(res, errMessage);
    }
    return next();
  }

  /**
   * @function addBookingValidator
   * @description Validates user signin
   * @param {object} req Request Object
   * @param {object} res Response Object
   * @param {function} next Next middleware function
   * @returns {function} Next function
   */
  static async addBookingValidator(req, res, next) {
    const schema = joi
      .object()
      .keys({
        user_id: positive_integer.min(1).valid(req.user.id),
        trip_id: positive_integer.min(1).required(),
        seat_number: positive_integer.min(1),
      })
      .messages(messages);
    try {
      const value = await schema.validateAsync(req.body, {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
      });
      req.body = value;
    } catch (error) {
      let anyOnly = false;
      let anyOnlyMessage = '';
      const errMessage = error.details
        .map(err => {
          if (err.type === 'any.only') {
            anyOnly = true;
            anyOnlyMessage = `This "${err.context.label}" is not yours`;
            return anyOnlyMessage;
          }
          return err.message;
        })
        .join('. ');
      return anyOnly ? forbiddenResponse(res, anyOnlyMessage) : badRequestResponse(res, errMessage);
    }
    return next();
  }

  /**
   * @function cancelTripValidator
   * @description Validates user signin
   * @param {object} req Request Object
   * @param {object} res Response Object
   * @param {function} next Next middleware function
   * @returns {function} Next function
   */
  static async cancelTripValidator(req, res, next) {
    const schema = joi
      .object()
      .keys({
        user_id: positive_integer.min(1),
        is_admin: joi.boolean().valid(true),
        trip_id: positive_integer.min(1).required(),
      })
      .messages(messages);
    try {
      const value = await schema.validateAsync(
        { ...req.body, ...req.params },
        {
          abortEarly: false,
          allowUnknown: true,
          stripUnknown: true,
        },
      );
      req.params = { trip_id: value.trip_id };
    } catch (error) {
      return badRequestResponse(res, error.message);
    }
    return next();
  }

  /**
   * @function getBookingsValidator
   * @description Validates user signin
   * @param {object} req Request Object
   * @param {object} res Response Object
   * @param {function} next Next middleware function
   * @returns {function} Next function
   */
  static async getBookingsValidator(req, res, next) {
    const schema = joi
      .object()
      .keys({
        user_id: positive_integer
          .min(1)
          .valid(req.user.id)
          .messages({ ...messages, 'any.only': 'This "{{#label}}" is not yours' }),
        is_admin: joi.boolean().valid(req.user.is_admin),
      })
      .messages(messages);
    try {
      const value = await schema.validateAsync(req.body, {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
      });
      req.body = value;
    } catch (error) {
      let errUserId = false;
      const errMessage = error.details
        .map(err => {
          if (err.type === 'any.only' && err.context.key === 'user_id') {
            errUserId = true;
          }
          if (err.type === 'any.only' && err.context.key === 'is_admin') {
            return req.user.is_admin === false
              ? `You are not "admin". "${err.context.label}" should be false`
              : `You are "admin". "${err.context.label}" should be true`;
          }
          return err.message;
        })
        .join('. ');
      return errUserId ? forbiddenResponse(res, errMessage) : badRequestResponse(res, errMessage);
    }
    return next();
  }

  /**
   * @function deleteBookingValidator
   * @description Validates user signin
   * @param {object} req Request Object
   * @param {object} res Response Object
   * @param {function} next Next middleware function
   * @returns {function} Next function
   */
  static async deleteBookingValidator(req, res, next) {
    const schema = joi
      .object()
      .keys({
        user_id: positive_integer
          .min(1)
          .valid(req.user.id)
          .messages({ ...messages, 'any.only': 'This "{{#label}}" is not yours' }),
        is_admin: joi.boolean().valid(req.user.is_admin),
        booking_id: positive_integer.min(1).required(),
      })
      .messages(messages);
    try {
      const value = await schema.validateAsync(
        { ...req.body, ...req.params },
        {
          abortEarly: false,
          allowUnknown: true,
          stripUnknown: true,
        },
      );
      req.params = { booking_id: value.booking_id };
    } catch (error) {
      let errUserId = false;
      const errMessage = error.details
        .map(err => {
          if (err.type === 'any.only' && err.context.key === 'user_id') {
            errUserId = true;
          }
          if (err.type === 'any.only' && err.context.key === 'is_admin') {
            return req.user.is_admin === false
              ? `You are not "admin". "${err.context.label}" should be false`
              : `You are "admin". "${err.context.label}" should be true`;
          }
          return err.message;
        })
        .join('. ');
      return errUserId ? forbiddenResponse(res, errMessage) : badRequestResponse(res, errMessage);
    }
    return next();
  }

  /**
   * @function getABusValidator
   * @description Validates user signin
   * @param {object} req Request Object
   * @param {object} res Response Object
   * @param {function} next Next middleware function
   * @returns {function} Next function
   */
  static async getABusValidator(req, res, next) {
    const schema = joi
      .object()
      .keys({
        bus_id: positive_integer.min(1).required(),
      })
      .messages(messages);
    try {
      const value = await schema.validateAsync(req.params, {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
      });
      req.params = { bus_id: value.bus_id };
    } catch (error) {
      return badRequestResponse(res, error.message);
    }
    return next();
  }

  /**
   * @function getTripValidator
   * @description Validates user signin
   * @param {object} req Request Object
   * @param {object} res Response Object
   * @param {function} next Next middleware function
   * @returns {function} Next function
   */
  static async getTripValidator(req, res, next) {
    const schema = joi
      .object()
      .keys({
        trip_id: positive_integer.min(1).required(),
      })
      .messages(messages);
    try {
      const value = await schema.validateAsync(req.params, {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
      });
      req.params = { trip_id: value.trip_id };
    } catch (error) {
      return badRequestResponse(res, error.message);
    }
    return next();
  }

   /**
   * @function getBookingValidator
   * @description Validates get booking endpoint
   * @param {object} req Request Object
   * @param {object} res Response Object
   * @param {function} next Next middleware function
   * @returns {function} Next function
   */
  static async getBookingValidator(req, res, next) {
    const schema = joi
      .object()
      .keys({
        booking_id: positive_integer.min(1).required(),
      })
      .messages(messages);
    try {
      const value = await schema.validateAsync(req.params, {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
      });
      req.params = { booking_id: value.booking_id };
    } catch (error) {
      return badRequestResponse(res, error.message);
    }
    return next();
  }
}

export default Validate;
