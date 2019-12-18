import { Hash } from '../../helper';
import { log } from '../../utils';
import Seed from '../../models/seed';
/* eslint-disable-next-line import/named */
import { userPassword, user, user2, user3, adminPassword, admin } from '../../config';

const seed = async () => {
  try {
    const password = await Hash.hash(userPassword);
    const hashedAdminPassword = await Hash.hash(adminPassword);

    log('Seeding Tables...');
    log('Creating Admin...');
    await Seed.seedUser({
      first_name: 'ADMIN',
      last_name: 'WAYFARER',
      email: admin,
      password: hashedAdminPassword,
      is_admin: true,
    });
    log('Admin Created!');

    log('Creating User One. The name is "John"...');
    await Seed.seedUser({
      first_name: 'MAX',
      last_name: 'PAYNE',
      email: user,
      password,
    });
    log('User named John is Created!');

    log('Creating User Two. The name is "James"...');
    await Seed.seedUser({
      first_name: 'JAMES',
      last_name: 'BOND',
      email: user2,
      password,
    });
    log('User named James is Created!');

    log('Creating User Three. The name is "Jor"...');
    await Seed.seedUser({
      first_name: 'JOR',
      last_name: 'EL',
      email: user3,
      password,
    });
    log('User named Jor is Created!');
    log('Tables seeded successfully!');
  } catch (error) {
    log(error.message);
  }
};

export default seed;

seed();
