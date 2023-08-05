import * as Joi from 'joi';

import { validator } from './validator';

import { User, UserRole, UserStatus } from '@fabiant1498/llovizna-blog';

import { escapeSpecialCharacters } from '@utils/stringUtils';

const getUserSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const updateCreateUserProps = {
  firstName: Joi.string().max(50).required(),
  lastName: Joi.string().max(50).required(),
  email: Joi.string().email().required(),
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
  picturePath: Joi.string().length(250).optional(),
  username: Joi.string().max(50).required(),
};

const createUserSchema = Joi.object({
  ...updateCreateUserProps,
  role: Joi.string()
    .valid(...(['admin', 'superadmin', 'editor', 'eventManager'] as UserRole[]))
    .required(),
});

const updateUserSchema = Joi.object({
  ...updateCreateUserProps,
  role: Joi.forbidden(),
});

const updateUserRoleSchema = Joi.object({
  role: Joi.string()
    .valid(...(['admin', 'superadmin', 'editor', 'eventManager'] as UserRole[]))
    .required(),
  id: Joi.string().hex().length(24).required(),
});

const validateGetUser = validator(getUserSchema);
const validateCreateUser = validator<User>(createUserSchema);
const validateUpdateUser = validator<User>(updateUserSchema);
const validateUpdateUserRole = validator(updateUserRoleSchema);

export { validateGetUser, validateCreateUser, validateUpdateUser, validateUpdateUserRole };
