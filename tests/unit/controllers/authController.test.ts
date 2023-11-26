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

    expect(res.body?.code).toBe(400);
    expect(res.body.error).not.toBeNull();
    expect(res.body.error).not.toHaveProperty('code');
    expect(res.body.error.fields).toHaveProperty('email');
    expect(typeof res.body.error.fields.email).toEqual('string');
  });
});

describe('POST auth/forgot-password/', () => {
  it("POST auth/forgot-password => User doesn't exists ", async () => {
    const res = await request(app).post('/auth/forgot-password').send({
      email: 'fabiantrillo@hotmail.com',
    });
    expect(res.statusCode).toBe(400);
  });

  it('POST auth/forgot-password => Email is sended successfully ', async () => {
    const res = await request(app).post('/auth/forgot-password').send({
      email: 'fabiantrillo1498@gmail.com',
    });

    expect(res.body?.code).toEqual(200);
    expect(res.body.error).toBeNull();
  });
});
