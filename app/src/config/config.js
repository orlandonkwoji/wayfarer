require('custom-env').env(true);

const port = process.env.PORT;
const jwtKey = process.env.JWT_KEY;
const user = process.env.USER;
const user2 = process.env.USER2;
const user3 = process.env.USER3;
const userPassword = process.env.PASSWORD;
const admin = process.env.ADMIN;
const adminPassword = process.env.ADMIN_PASSWORD;
const nodeEnv = process.env.NODE_ENV;
const dbUrl =
  nodeEnv === 'production'
    ? process.env.DATABASE_URL
    : `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
module.exports = {
  port,
  dbUrl,
  jwtKey,
  user,
  user2,
  user3,
  userPassword,
  admin,
  adminPassword,
  nodeEnv,
};
