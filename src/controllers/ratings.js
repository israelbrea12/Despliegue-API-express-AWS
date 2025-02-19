const { RatingModel } = require("../models/rating");

const ratingsController = {
    // Función para obtener tods las valoraciones de una película en específico
    async getMovieRatings(req, res) {

        const { movieId } = req.params;

        // Valido que movieId tenga un valor válido. Solucionado gracias a los tests.
        if (isNaN(movieId) || parseInt(movieId) <= 0) {
            return res.status(400).json({ error: "Invalid movieId" });
        }

        const ratings = await RatingModel.findAllRatingsByMovieId({
            movieId: req.params.movieId,
        });
        res.json(ratings);
    },

    // Función btiene una valoración específica de una película
    async getMovieRating(req, res) {
        const { movieId, ratingId } = req.params;

        try {

            // Valido que ratingId tenga un valor válido. Solucionado gracias a los tests.
            if (isNaN(ratingId) || parseInt(ratingId) <= 0) {
                return res.status(400).json({ error: "Invalid ratingId" });
            }

            const rating = await RatingModel.findRatingByMovieAndId(movieId, ratingId);

            if (!rating) {
                return res.status(404).json({ error: "Rating not found" });
            }

            res.status(200).json(rating);
        } catch (error) {
            console.error("Error fetching rating:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Función que crea una nueva valoración para una película
    async createMovieRating(req, res) {
        const body = req.body;
        const { params } = req;
        const movieId = parseInt(params?.movieId, 10);
        try {
            const rating = await RatingModel.createMovieRating({
                userId: req.userId,
                movieId: movieId,
                rating: body.rating,
                comment: body.comment,
            });

            res.location(`/movies/${req.params.movieId}/ratings/${rating.id}`);
            res.status(201).json(rating);
        } catch (error) {
            console.error("Error creating rating:", error); // Log del error
            res.status(400).json({ error: "Bad Request" });
        }
    },

    // Actualiza una valoración existente de una película
    async updateMovieRating(req, res) {
        const { movieId, ratingId } = req.params;
        const { body, userId } = req;

        try {

            const rating = await RatingModel.findRatingByMovieAndId(movieId, ratingId);


            if (!rating) {
                return res.status(404).json({ error: "Rating not found" });
            };

            if (rating.userId !== userId) {
                return res.status(403).json({ error: "Forbidden: You cannot modify another user's rating" });
            };


            const [affectedRows] = await RatingModel.updateRating(
                { id: ratingId, movieId, userId },
                {
                    rating: body.rating,
                    comment: body.comment,
                }
            );

            if (affectedRows === 0) {
                return res.status(404).json({ error: "Rating not found" });
            }

            const updatedRating = await RatingModel.findRatingByMovieAndId(movieId, ratingId);
            return res.status(200).json(updatedRating);
        } catch (error) {
            console.error("Error updating rating:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Elimina una valoración de una película
    async deleteMovieRating(req, res) {
        const { movieId, ratingId } = req.params;
        const { userId } = req;

        try {
            // Verificar si la valoración pertenece al usuario autenticado
            const rating = await RatingModel.findRatingByMovieAndId(movieId, ratingId);

            if (!rating) {
                return res.status(404).json({ error: "Rating not found" });
            };
            

            if (rating.userId !== userId) {
                return res.status(403).json({ error: "Forbidden: You cannot delete another user's rating" });
            };

            // Intentamos eliminar la valoración únicamente si pertenece al usuario autenticado
            const affectedRows = await RatingModel.deleteRating({
                id: ratingId,
                movieId,
                userId,
            });

            if (affectedRows === 0) {
                return res.status(404).json({ error: "Rating not found" });
            }

            return res.status(204).end(); // No content
        } catch (error) {
            console.error("Error deleting rating:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },
};

module.exports = { ratingsController };