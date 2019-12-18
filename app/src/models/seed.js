import db from '../db/config';
import query from '../db/queries';

class Seed {
  async seedUser({ first_name, last_name, email, password, is_admin = false }) {
    const seededUser = await db.query(query.seedUser, [
      first_name,
      last_name,
      email,
      password,
      is_admin,
    ]);
    return seededUser;
  }
}

export default new Seed();
