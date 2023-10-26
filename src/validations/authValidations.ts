import * as Joi from 'joi';

import { User } from '@fabiant1498/llovizna-blog';

import { validator } from './validator';

import { escapeSpecialCharacters } from '@utils/stringUtils';

const forgotPasswordSchema = Joi.object<User>({
  email: Joi.string().email().required(),
});

const loginSchema = Joi.object<User>({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const resetPasswordSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  password: Joi.string()
    .min(8)
    .max(25)
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .messages({
      'string.pattern.base': escapeSpecialCharacters(
        'The password should cointain at least one uppercase, lowercase, numeric and special character (!@#$%^&*(),.?":{}|<>)'
      ),
    })
    .required(),
  token: Joi.string().required(),
  passwordConfirmation: Joi.any()
    .valid(Joi.ref('password'))
    .required()
    .label('Confirm password')
    .messages({ 'any.only': 'Confirm password does not match' }),
});

const validateForgotPassword = validator<User>(forgotPasswordSchema);
const validateLogin = validator<User>(loginSchema);
const validateResetPassword = validator(resetPasswordSchema);

export { validateForgotPassword, validateLogin, validateResetPassword };
