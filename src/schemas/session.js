const Joi = require("joi");

// Esquema de validación para session
const sessionSchema = {
  createSession: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

module.exports = {
  sessionSchema,
};
