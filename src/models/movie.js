const db = require("../db");

const MovieModel = {
    getModel() {
        return db.instance.models.Movie;
    },
    // Busca todas las películas con paginación.
    async findAllMovies(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        // Obtiene el total de películas y las películas correspondientes a la página solicitada
        const { count, rows } = await this.getModel().findAndCountAll({
            offset,
            limit,
        });

        return {
            results: rows, // Lista de películas obtenidas
            hasNextPage: offset + rows.length < count, // Indica si hay más páginas disponibles
            pageSize: rows.length, // Cantidad de películas en la página actual
            next: offset + rows.length < count ? `/movies?page=${page + 1}&limit=${limit}` : null, // URL de la siguiente página, si existe
        };
    },
};

module.exports = {
    MovieModel,
};