const express = require("express");

const { healthController } = require("../controllers/health");

const router = express.Router();

// Defino las rutas para /movies
router.get("/", healthController.check);

module.exports = {
    healthRoutes: router,
}