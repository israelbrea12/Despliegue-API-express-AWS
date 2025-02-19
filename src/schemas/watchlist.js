const Joi = require("joi");

// Esquema de validación para watchlist
const watchlistSchema = {
    addToWatchList: Joi.object().keys({
        movieId: Joi.number().min(1).required(),
        watched: Joi.boolean().required()
    })
};

module.exports = {
    watchlistSchema,
}