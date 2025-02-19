const express = require("express");
const { sessionsController } = require("../controllers/sessions");
const { validatePayload } = require("../middlewares/validatePayload");
const { sessionSchema } = require("../schemas/session");

const router = express.Router();

// Defino las rutas
router.post(
  "/",
  validatePayload(sessionSchema.createSession),
  sessionsController.createSession
);

module.exports = {
  sessionRoutes: router,
};
