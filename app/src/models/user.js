import db from '../db/config';
import query from '../db/queries';

/**
 * @classdesc User - the User model
 */
class User {
  /**
   * @typedef {Object} UserObject - a Bus object
   * @property {Number} id - the ID of the User
   * @property {Boolean} is_admin - the status of the user
   * @property {String} email- the user's email
   * @property {String} first_name - the user's first name
   * @property {String} last_name - the user's last name
   */

  /**
   * @function create
   * @description - adds a bus to the database
   * @param {Object} obj - an object
   * @param {String} obj.first_name - the first name of the user
   * @param {String} obj.last_name - the last name of the user
   * @param {String} obj.email - the email of the user
   * @param {String} obj.password - the user's password
   * @returns {UserObject} - the Bus that has been added to the database
   */
  async create({ first_name, last_name, email, password }) {
    const { rows } = await db.query(query.createUser, [first_name, last_name, email, password]);
    return rows[0];
  }

  /**
   * @func checkEmailExists
   * @description - checks if a User with this email exists on the database
   * @param {String} email - the email of the client
   * @returns {Boolean} - returns a boolean value
   */
  async checkEmailExists(email) {
    const { rows } = await db.query(query.emailExist, [email]);
    return rows[0].exists;
  }

  /**
   * @func findByEmail
   * @description - finds a user with this email from the database and returns it
   * @param {String} email - the email of the client
   * @returns {UserObject} - returns a User that is found from the database
   */
  async findByEmail(email) {
    const { rows } = await db.query(query.findUserByEmail, [email]);
    return rows[0];
  }
}

export default new User();
