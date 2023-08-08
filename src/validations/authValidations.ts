import * as Joi from 'joi';

import { User } from '@fabiant1498/llovizna-blog';

import { validator } from './validator';

const forgotPasswordSchema = Joi.object<User>({
  email: Joi.string().email().required(),
});

const loginSchema = Joi.object<User>({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const validateForgotPassword = validator<User>(forgotPasswordSchema);
const validateLogin = validator<User>(loginSchema);

export { validateForgotPassword, validateLogin };
