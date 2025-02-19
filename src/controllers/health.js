const healthController = {
    // Obtiene todas las películas con paginación.
    async check(req, res) {
        try {
            res.json({ status: "UP" });
        } catch (error) {
            res.status(500).json({ error: "Error al obtener las películas." });
        }
    },
};

module.exports = {
    healthController,
};