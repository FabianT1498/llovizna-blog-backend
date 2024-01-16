import * as request from 'supertest';

import * as db from './../../db';
import { createAdminUsers, login } from '../../utils/usersUtils';

import { UserRole } from '@fabiant1498/llovizna-blog';

import { app } from '@app/app';

jest.setTimeout(60000);

let authToken: string = '';

let userCredentials = {
  email: 'manuelmalave@gmail.com',
  password: 'Test1#',
};

beforeAll(async () => {
  await db.connect();
  await createAdminUsers();
});

// afterEach(async () => await db.clearDatabase());

afterAll(async () => await db.closeDatabase());

describe('POST /api/v1/users/', () => {
  
  it('POST /api/v1/users/ => Create many users as as authenticated admin user', async () => {

    const loginRes = await login(app, userCredentials);
    authToken = loginRes.body.data.token;

    const usersData = [
      {
        firstName: 'Rafael',
        lastName: 'Tirado',
        email: 'rafaeltirado@gmail.com',
        password: 'Test19814#',
        username: 'rafaelt781',
        role: 'editor' as UserRole,
      },
      {
        firstName: 'Carlos',
        lastName: 'Maldonado',
        email: 'carlosmal@gmail.com',
        password: 'Test19814#',
        username: 'carlos781',
        role: 'editor' as UserRole,
      },
      {
        firstName: 'Maria',
        lastName: 'Malave',
        email: 'mariapajui@gmail.com',
        password: 'Test19814#',
        username: 'maria781',
        role: 'eventManager' as UserRole,
      },
    ];

    for (let userData of usersData) {
      const res = await request(app)
        .post('/api/v1/users/')
        .send(userData)
        .set('x-access-token', authToken);

      expect(res.statusCode).toBe(201);
    }
  });

  it('POST /api/v1/users/ => Create user fails because password length should be min 8 characters ', async () => {
    const data = {
      firstName: 'Pablo',
      lastName: 'Malodonado',
      email: 'pablomaldonado@gmail.com',
      password: 'Test1#',
      username: 'pablo382',
      role: 'editor' as UserRole,
    };

    const res = await request(app)
      .post('/api/v1/users/')
      .send(data)
      .set('x-access-token', authToken);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).not.toBeNull();
    expect(res.body.error.fields.password).not.toBeNull();
  });

  it("POST /api/v1/users/ => Create user fails because authenticated user doesn't have authorization to create an admin user", async () => {
    const data = {
      firstName: 'Raul',
      lastName: 'Maldonado',
      email: 'raulmaldonado@gmail.com',
      password: 'Test9814#',
      username: 'raul382',
      role: 'admin' as UserRole,
    };

    const res = await request(app)
      .post('/api/v1/users/')
      .send(data)
      .set('x-access-token', authToken);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).not.toBeNull();
  });
});

describe('GET /api/v1/users/', () => {
  it('GET /api/v1/users/ => Get all users as authenticated admin user', async () => {
    const res = await request(app).get('/api/v1/users').set('x-access-token', authToken);

    expect(res.statusCode).toBe(201);
    expect(res.body.data.results).toHaveLength(3);
  });

  it('GET /api/v1/users/ => Get users by fullname and status, as authenticated admin user', async () => {
    const res = await request(app).get('/api/v1/users?fullName=rafael tira&status=active').set('x-access-token', authToken);

    console.log(res.body.data.results[0])
    expect(res.statusCode).toBe(201);
    expect(res.body.data.results).toHaveLength(1);
  });

  it(
    'GET /api/v1/users/ => Get users by role superadmin returns anothers users, because authenticated' +
      "user doesn't have authorization",
    async () => {
      const res = await request(app)
        .get('/api/v1/users?role=superadmin')
        .set('x-access-token', authToken);

      expect(res.body.data.results).toHaveLength(3);
      expect(res.statusCode).toBe(201);
    }
  );

  it('GET /api/v1/users/ => Get users as authenticated editor user fails', async () => {
    userCredentials.email = 'carlosmal@gmail.com'
    userCredentials.password = 'Test19814#'

    const loginRes = await login(app, userCredentials);
    authToken = loginRes.body.data.token;
    
    const res = await request(app)
      .get('/api/v1/users')
      .set('x-access-token', authToken);

    expect(res.statusCode).toBe(403);
    expect(res.body.error.message).toMatch("Access not allowed");
  });
});
