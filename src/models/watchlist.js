const db = require('../db');

const WatchlistModel = {
    get model() {
        return db.instance.models.Watchlist;
    },

    // Obtiene la watchlist del usuario
    async getUserWatchList(query) {
        return this.model.findAll({
            where: query,
        });
    },

    // Agrega una película a la watchlist
    async addToWatchList(addMovie) {
        return this.model.create(addMovie);
    },

    // Busca una película por su ID en la base de datos
    async findMoviebyMovieId(movieId) {
        return db.instance.models.Movie.findByPk(movieId);
    },

    // Verifica si una película ya está en la watchlist del usuario
    async isMovieInWatchlist(userId, movieId) {
        return this.model.findOne({
            where: { userId, movieId },
        });
    },

    // Elimina un ítem de la watchlist
    async removeFromWatchlist(query) {
        return this.model.destroy({
            where:query,
        });
    },

    // Busca un ítem de la watchlist por su ID
    async findById(itemId) {
        return this.model.findOne({
            where: { id: itemId },
        });
    },
    
};

module.exports = {
    WatchlistModel,
}