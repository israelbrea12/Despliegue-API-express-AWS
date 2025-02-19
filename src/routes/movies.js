const express = require("express");

const { moviesController } = require("../controllers/movies");

const router = express.Router();

// Defino las rutas para /movies
router.get("/", moviesController.getAllMovies);

module.exports = {
    movieRoutes: router,
}