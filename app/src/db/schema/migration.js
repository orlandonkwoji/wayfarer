import 'core-js/stable';
import 'regenerator-runtime/runtime';
import db from '../config';
import query from '../queries';
import { log } from '../../utils';

const migration = async () => {
  try {
    log('Dropping tables...');
    await db.query(query.dropTables);
    log('Tables dropped successfully!');

    log('Creating tables...');
    await db.query(query.createTables);
    log('Tables created successfully!');
  } catch (error) {
    log(error.message);
  }
};

export default migration;

migration();
