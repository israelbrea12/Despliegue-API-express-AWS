const { app } = require("./src/app");
const { config } = require("./src/config");
const db = require("./src/db");

// Punto de entrada de la aplicación. Inicia la base de datos y arranca el servidor.
async function start() {
  await db.initialize();

  app.listen(config.PORT, () => {
    console.log(`Example app listening on port ${config.PORT}`);
  });
}

start();

