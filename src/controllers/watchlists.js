const { WatchlistModel } = require('../models/watchlist');

const watchlistsController = {
    // Función para obtener la watchlist de un usuario
    async getUserWatchlist(req, res) {
        const { params } = req;
        const userId = parseInt(params?.userId, 10);

        // Valido que userId tenga un valor válido. Solucionado gracias a los tests.
        if (isNaN(userId) || parseInt(userId) <= 0) {
            return res.status(400).json({ error: "Invalid movieId" });
        };

        // Obtiene la watchlist del usuario
        const watchlist = await WatchlistModel.getUserWatchList({
            userId: userId,
        });

        res.json(watchlist);
    },

    // Función para añadir un item a la watchlist.
    async addToWatchlist(req, res) {
        const { params, body } = req;
        const userId = parseInt(params?.userId, 10);

        // Verifica que el usuario autenticado es el mismo que intenta modificar la watchlist
        if (req.userId !== userId) {
            return res.status(403).json({ error: "Forbidden: You cannot delete another user's watchlist item" });
        }

        // Comprueba si la película ya está en la watchlist
        const existingMovie = await WatchlistModel.isMovieInWatchlist(userId, body?.movieId);
        if (existingMovie) {
            return res.status(409).json({ error: "La película ya existe en el watchlist" });
        }

        // Verifica que la película exista en la base de datos
        const movie = await WatchlistModel.findMoviebyMovieId(body?.movieId)

        if (!movie) {
            return res.status(404).json({ error: "Película no encontrada" });
        }

        try {
            // Agrega la película a la watchlist del usuario
            const movieWatchlist = await WatchlistModel.addToWatchList({
                userId: userId,
                movieId: body?.movieId,
                title: movie.title,
                watched: body?.watched,
            });

            // Establece la ubicación del recurso creado
            res.location(`/watchlist/${req.userId}/items`);
            res.status(201).json(movieWatchlist);

        } catch {
            res.status(400).json({ error: "Bad Request" });
        }
    },

    // Función para eliminar un item de la watchlist
    async removeFromWatchlist(req, res) {
        const { userId, itemId } = req.params;
        const userIdInt = parseInt(userId, 10);

        try {

            // Verifica que el usuario autenticado tiene permiso para eliminar el ítem
            if (req.userId !== userIdInt) {
                return res.status(403).json({ error: "Forbidden: You cannot delete another user's watchlist item" });
            }

            // Elimina el ítem de la watchlist
            const affectedRows = await WatchlistModel.removeFromWatchlist({
                id: itemId,
                userId,
            });

            // Si no se encontró el ítem, devuelve un error 404
            if (affectedRows === 0) {
                return res.status(404).json({ error: "Item not found" });
            }

            return res.status(204).end();
        } catch (error) {
            console.error("Error deleting item:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Función para gestionar el estado de watched
    async changeWatchedStatus(req, res) {
        const { userId, itemId } = req.params;
        const userIdInt = parseInt(userId, 10);

        try {
            // Verifica que el usuario autenticado tiene permiso para modificar el estado del ítem
            if (req.userId !== userIdInt) {
                return res.status(403).json({ error: "Forbidden: You cannot update another user's watchlist item" });
            }

            // Buscar el item en la watchlist
            const watchlistItem = await WatchlistModel.findById(itemId);
            if (!watchlistItem || watchlistItem.userId !== userIdInt) {
                return res.status(404).json({ error: "Item not found" });
            }

            // Alterna el estado de watched (true -> false, false -> true)
            watchlistItem.watched = !watchlistItem.watched;
            await watchlistItem.save();

            return res.json({ message: "Watchlist item updated", watched: watchlistItem.watched });
        } catch (error) {
            console.error("Error updating watchlist item:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },

};


module.exports = {
    watchlistsController,
}