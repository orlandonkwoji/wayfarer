import bcrypt from 'bcrypt';

class Hash {
  static async hash(password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }

  static async match(password1, password2) {
    const match = await bcrypt.compare(password1, password2);
    return match;
  }
}

export default Hash;
