const Joi = require("joi");

// Esquema de validación para user
const userSchema = {
  createUser: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    username: Joi.string().required(),
    password: Joi.string().required().min(12),
  }),
};

module.exports = {
  userSchema,
};