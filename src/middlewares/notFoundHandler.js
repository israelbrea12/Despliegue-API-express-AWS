// Middleware para manejar rutas no encontradas
module.exports = {
  notFoundHandler: (req, res) => {
    res.status(404).json({ error: "Not found" });
  }
};
