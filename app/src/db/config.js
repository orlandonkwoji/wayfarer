import { Pool, types } from 'pg';
import log from '../utils/log';
/* eslint-disable-next-line import/named */
import { nodeEnv, dbUrl } from '../config';

types.setTypeParser(1700, value => parseFloat(value));

if (nodeEnv === 'dev') {
  log('development');
}
log(nodeEnv);

const isProduction = nodeEnv === 'production';
const connectString = {
  connectionString: dbUrl,
  ssl: isProduction,
};
const pool = new Pool(connectString);

pool.on('connect', () => {
  if (nodeEnv !== 'production') {
    log(`Connection successful to::::${dbUrl}`);
  } else {
    log('Connection successful to::::"production" database');
  }
});

pool.on('error', err => {
  log('Unexpected error on idle client', err);
});

module.exports = {
  query: (queryText, params) => pool.query(queryText, params),
};
