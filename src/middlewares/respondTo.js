// Middleware para manejar formatos de respuesta aceptados
module.exports = {
  respondTo:
    (...acceptedFormats) =>
    (req, res, next) => {
      const formatHandlers = Object.fromEntries(
        acceptedFormats.map((format) => [
          format,
          () => {
            next();
          },
        ])
      );

      res.format({
        ...formatHandlers,
        default: () => {
          res.status(406).json({ error: "Not Acceptable" });
        },
      });
    },
};
