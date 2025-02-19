const Joi = require("joi");

// Esquema de validación para rating
const ratingSchema = {
    createMovieRating: Joi.object().keys({
        rating: Joi.number().min(0).max(5).required(),
        comment: Joi.string().max(500).allow(""),
    }),
    updateMovieRating: Joi.object().keys({
        rating: Joi.number().min(0).max(5).required(),
        comment: Joi.string().max(500).allow(""),
    }),
};

module.exports = {
    ratingSchema,
}