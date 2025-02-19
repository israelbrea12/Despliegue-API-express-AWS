// Middleware para validar datos
module.exports = {
  validatePayload: (schema) => (req, res, next) => {
    const data = req.body;
    const result = schema.validate(data);

    if (result.error) {
      res.status(422).json({ error: result.error.details });
      return;
    }

    next();
  },
};

