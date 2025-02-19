const express = require("express");
const { validatePayload } = require("../middlewares/validatePayload");
const { usersController } = require("../controllers/users");
const { userSchema } = require("../schemas/user");

const router = express.Router();

// Defino las rutas
router.post(
  "/",
  validatePayload(userSchema.createUser),
  usersController.createUser
);

module.exports = {
  userRoutes: router,
};