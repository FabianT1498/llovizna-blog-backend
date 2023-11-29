import * as request from 'supertest';
import * as bcrypt from 'bcryptjs';

import * as db from './../../db';

import { app } from '@app/app';

import { User, UserRole } from '@fabiant1498/llovizna-blog';
import UserModel from '@models/user';


jest.setTimeout(60000)

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

    const data = {
      firstName: "Fabian Alejandro",
      lastName: "Trillo",
      email: "fabiantrillo1498@gmail.com",
      password: "ftrillo781",
      username: "fabiant98",
      role: "admin" as UserRole
    }
    
    const encryptedPassword = await bcrypt.hash(data.password, 10);

    const user: User = {
      ...data,
      picturePath: '',
      password: encryptedPassword,
      status: 'active'
    };

    const newUser = new UserModel(user);

    await newUser.save();

    const res = await request(app).post('/auth/forgot-password').send({
      email: 'fabiantrillo1498@gmail.com',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body?.code).toEqual(200);
    expect(res.body.error).toBeNull();
  });
});

describe('POST auth/reset-password/', () => {
  it("POST auth/reset-password => User doesn't exists ", async () => {
    const res = await request(app).post('/auth/forgot-password').send({
      email: 'fabiantrillo@hotmail.com',
    });
    expect(res.statusCode).toBe(400);
  });
});

describe('GET auth/reset-password/:token', () => {
  it("GET auth/reset-password/:token => Token is invalid because user was dropped from database ", async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTY3OTVkZGJhMDM2YTIwMzAyYzdlZjUiLCJlbWFpbCI6ImZhYmlhbnRyaWxsbzE0OThAZ21haWwuY29tIiwiaWF0IjoxNzAxMjg3Mzg5LCJleHAiOjE3MDEyODgyODl9.hx2t6mdLepo67uqTfGaixjhwpeigICLTBI4X00T4Ygs'
    const res = await request(app).get('/auth/reset-password/' + token);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).not.toBeNull();
    expect(res.body.error.message).toMatch("Token is expired or invalid, please request a password reset again")
  });
});

