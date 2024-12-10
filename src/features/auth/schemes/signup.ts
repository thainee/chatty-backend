import Joi, { ObjectSchema } from 'joi';

const signupSchema: ObjectSchema = Joi.object().keys({
  username: Joi.string().trim().required().min(4).max(30).messages({
    'string.base': 'Username must be of type string',
    'string.min': 'Username cannot be less than 4 characters',
    'string.max': 'Username cannot be more than 30 characters',
    'string.empty': 'Username is a required field'
  }),
  fullname: Joi.string().trim().required().min(4).max(30).messages({
    'string.base': 'Fullname must be of type string',
    'string.min': 'Fullname cannot be less than 4 characters',
    'string.max': 'Fullname cannot be more than 30 characters',
    'string.empty': 'Fullname is a required field'
  }),
  password: Joi.string().trim().required().min(6).max(30).messages({
    'string.base': 'Password must be of type string',
    'string.min': 'Password cannot be less than 6 characters',
    'string.max': 'Password cannot be more than 30 characters',
    'string.empty': 'Password is a required field'
  }),
  email: Joi.string()
    .trim()
    .required()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net', 'edu', 'org'] }
    })
    .messages({
      'string.base': 'Email must be of type string',
      'string.email': 'Email must be valid',
      'string.empty': 'Email is a required field'
    }),
  avatarColor: Joi.string().required().messages({
    'any.required': 'Avatar color is required'
  }),
  avatarImage: Joi.string().required().messages({
    'any.required': 'Avatar image is required'
  })
});

export { signupSchema };
