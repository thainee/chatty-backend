import Joi, { ObjectSchema } from 'joi';

const loginSchema: ObjectSchema = Joi.object().keys({
  usernameOrEmail: Joi.string().required().min(4).max(254).messages({
    'string.base': 'Username or Email must be of type string',
    'string.min': 'Invalid credentials',
    'string.max': 'Invalid credentials',
    'string.empty': 'Username or email is a required field'
  }),
  password: Joi.string().required().min(6).max(30).messages({
    'string.base': 'Password must be of type string',
    'string.min': 'Invalid credentials',
    'string.max': 'Invalid credentials',
    'string.empty': 'Password is a required field'
  })
});

export { loginSchema };
