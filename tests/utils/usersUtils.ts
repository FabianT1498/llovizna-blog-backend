import * as bcrypt from 'bcryptjs';
import * as request from 'supertest';
import { Express } from 'express';

import { User, UserRole } from '@fabiant1498/llovizna-blog';
import UserModel from '@models/user';

const usersData = [
  {
    firstName: 'Fabian Alejandro',
    lastName: 'Trillo',
    email: 'fabiantrillo1498@gmail.com',
    password: 'Test1#',
    username: 'fabiant98',
    role: 'superadmin' as UserRole,
    status: 'active',
  } as User,
  {
    firstName: 'Manuel Alejandro',
    lastName: 'Malave',
    email: 'manuelmalave@gmail.com',
    password: 'Test1#',
    username: 'manuelm98',
    role: 'admin' as UserRole,
    status: 'active',
  } as User,
];

const createAdminUsers = async () => {
  for (let userData of usersData) {
    const encryptedPassword = await bcrypt.hash(userData.password, 10);

    const user: User = {
      ...userData,
      picturePath: '',
      password: encryptedPassword,
      status: 'active',
    };

    const newUser = new UserModel(user);

    await newUser.save();
  }
};

const login = async (app: Express, data : {email: string, password: string}) => {
  const res = await request(app).post('/auth/login').send({
    email: data.email,
    password: data.password,
  });

  return res;
};

export { createAdminUsers, login };
