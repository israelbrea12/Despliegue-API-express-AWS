// Middleware para manejar errores globales
module.exports = {
  errorHandler: (err, req, res, next) => {
    if(res.headersSent) {
      return next(err);
    }

    res.status(500).json({ error: "Internal server error" });
  },
};