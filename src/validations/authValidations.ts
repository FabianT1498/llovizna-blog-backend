import * as Joi from 'joi';

import { User } from '@fabiant1498/llovizna-blog';

import { validator } from './validator';

const signUpSchema = Joi.object<User>({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(3).max(15).required(),
  username: Joi.string().min(10).max(30).required(),
});

const loginSchema = Joi.object<User>({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const validateSignUp = validator<User>(signUpSchema);
const validateLogin = validator<User>(loginSchema);

export { validateSignUp, validateLogin };
