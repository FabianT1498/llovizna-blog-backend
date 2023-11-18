import * as request from 'supertest';

import * as db from './../../db';

import { app } from '@app/app';

beforeAll(async () => await db.connect());

afterEach(async () => await db.clearDatabase());

afterAll(async () => await db.closeDatabase());

describe('POST auth/login/', () => {
  it("POST auth/login => User doesn't exists ", async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'fabiantrillo@hotmail.com',
      password: '12eas',
    });
    expect(res.statusCode).toBe(400);
  });

  it('POST auth/login => Email is bad formatted ', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'perro@com',
      password: '12eas',
    });

    expect(res.body?.error?.code).toBe(400);
    expect(res.body.error).not.toBeNull();
    expect(res.body.error).toHaveProperty('email');
    expect(res.body.error.email).toHaveLength(1);
  });
});
