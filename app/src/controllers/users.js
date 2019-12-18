/* eslint-disable-next-line import/named */
import { Hash, Token } from '../helper';
import User from '../models/user';
import {
  conflictResponse,
  internalErrREesponse,
  successResponse,
  unauthorizedResponse,
} from '../utils/response';

class Users {
  /**
   * @description Creates new user account
   * @param {object} req request object
   * @param {object} res response object
   * @returns {object}  JSON response
   */
  static async signUp(req, res) {
    const { first_name, last_name, email, password } = req.body;
    const hashedPassword = await Hash.hash(password);
    try {
      const createdUser = await User.create({
        first_name,
        last_name,
        email,
        password: hashedPassword,
      });
      const { id, is_admin } = createdUser;
      const token = Token.generateToken({
        id,
        email,
        is_admin,
        first_name,
        last_name,
      });
      return successResponse(res, 201, {
        user_id: id,
        is_admin,
        token,
        email,
        first_name,
        last_name,
      });
    } catch (err) {
      if (err.routine === '_bt_check_unique') {
        return conflictResponse(res, 'A user with this email already exists');
      }
      return internalErrREesponse(res, err.stack);
    }
  }

  static async signIn(req, res) {
    const { email, password } = req.body;
    try {
      const user = await User.findByEmail(req.body.email);
      if (!user) return unauthorizedResponse(res, 'Incorrect Email or Password');
      const match = await Hash.match(password, user.password);
      if (!match) {
        return unauthorizedResponse(res, 'Incorrect Email or Password');
      }
      const { id, is_admin, first_name, last_name } = user;
      const token = Token.generateToken({
        id,
        email,
        is_admin,
        first_name,
        last_name,
      });
      const output = {
        user_id: id,
        is_admin,
        token,
        email,
        first_name,
        last_name,
      };
      return successResponse(res, 200, output);
    } catch (errr) {
      return internalErrREesponse(res, errr.stack);
    }
  }
}

export default Users;
