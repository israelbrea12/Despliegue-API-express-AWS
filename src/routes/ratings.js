const express = require("express");

const { validatePayload } = require("../middlewares/validatePayload");
const { ratingsController } = require("../controllers/ratings");
const { ratingSchema } = require("../schemas/rating");
const { verifyToken } = require("../middlewares/verifyToken");

const router = express.Router();

// Defino las rutas
router.get("/:movieId/ratings", ratingsController.getMovieRatings);
router.post("/:movieId/ratings",verifyToken ,validatePayload(ratingSchema.createMovieRating), ratingsController.createMovieRating);
router.get("/:movieId/ratings/:ratingId", ratingsController.getMovieRating);
router.patch("/:movieId/ratings/:ratingId", verifyToken, validatePayload(ratingSchema.updateMovieRating) , ratingsController.updateMovieRating);
router.delete("/:movieId/ratings/:ratingId", verifyToken, ratingsController.deleteMovieRating);

module.exports = {
    ratingRoutes: router,
}