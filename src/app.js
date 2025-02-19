const express = require("express");
const { errorHandler } = require("./middlewares/errorHandler");
const { notFoundHandler } = require("./middlewares/notFoundHandler");
const { respondTo } = require("./middlewares/respondTo");
const { movieRoutes } = require("./routes/movies");
const { ratingRoutes } = require("./routes/ratings");
 // Comentado ya que en la especificación no se pide. Los users están creados de manera estática en la BD.
// const { userRoutes } = require("./routes/users");
const { sessionRoutes } = require("./routes/sessions");
const { watchlistRoutes} = require("./routes/watchlists");

const app = express();

// Uso tanto los middlewares como las rutas
app.use(express.json());
app.use(respondTo("application/json"));
app.use(errorHandler);
app.use("/movies", movieRoutes);
app.use("/movies", ratingRoutes);
app.use("/watchlist", watchlistRoutes);
app.use("/sessions", sessionRoutes);
// app.use("/users", userRoutes);
app.use(notFoundHandler);

module.exports = {
  app,
};
