const db = require("../db");

const RatingModel = {
    get model() {
        return db.instance.models.Rating;
    },

    // Crea una nueva valoración en la base de datos
    async createMovieRating(rating) {
        return this.model.create(rating);
    },

    // Obtiene todas las valoraciones de una película
    async findAllRatingsByMovieId(query) {
        return this.model.findAll({
          where: query,
        });
    },

    // Obtiene una valoración específica por ID y película
    async findRatingByMovieAndId(movieId, ratingId) {
        return this.model.findOne({
            where: {
                id: ratingId,
                movieId: movieId,
            },
        });
    },

    // Actualiza una valoración existente
    async updateRating(query, updatedFields) {
        return this.model.update(updatedFields, {
            where: query,
        });
    },

    // Elimina una valoración de la base de datos
    async deleteRating(query) {
        return this.model.destroy({
            where: query,
        });
    },
};

module.exports = {
    RatingModel,
};