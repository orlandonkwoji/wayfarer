import jwt from 'jsonwebtoken';
/* eslint-disable-next-line import/named */
import { jwtKey } from '../config';

class Token {
  /**
   * @description Generates access token
   * @param {object} payload User credential(s)
   * @param {string} secret encryption key
   * @param {string} duration token expiry time
   * @returns {string} Access token
   */
  static generateToken(payload, secret = jwtKey, duration = '7d') {
    return jwt.sign(payload, secret, { expiresIn: duration });
  }

  /**
   * @description  Verifies and decodes the access token
   * @param {string} token  Access token
   * @param {string} secret decryption key
   * @returns {object} Decoded Access token
   */
  static verifyToken(token, secret = jwtKey) {
    return jwt.verify(token, secret);
  }
}

export default Token;
