import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';

import { User, UserRole, UserStatus } from '@fabiant1498/llovizna-blog';
import UserModel from '@models/user';

const seedUsers = async function () {
  try {
    await UserModel.deleteMany({});
    console.log('dropped users collection');

    const password = 'Test1#';
    const encryptedPassword = await bcrypt.hash(password, 10);

    const users: User[] = [];
    const userRoles: UserRole[] = ['admin', 'superadmin'];
    for (let i = 0; i < 5; i++) {
      const user: User = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email().toLocaleLowerCase(),
        password: encryptedPassword,
        username: faker.internet.userName(),
        role: userRoles[Math.floor(Math.random() * userRoles.length)],
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
      };
      users.push(user);
    }
    const res = await UserModel.insertMany(users);
    console.log('Seeded users collection');
    return res;
  } catch (err) {
    throw err;
  }
};

export { seedUsers };
