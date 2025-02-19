const { UserModel } = require("../models/user");
const { generateAccessToken, compareHashedPassword } = require("../auth");

const sessionsController = {
  async createSession(req, res) {
    const { username, password } = req.body;

    // Busca al usuario por nombre de usuario
    const user = await UserModel.findUser({ 
      username, 
    });

    // Si el usuario no existe, devuelve un error 401 (Unauthorized)
    if (user === null) { 
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Compara la contraseña ingresada con la almacenada en la base de datos
    const isPasswordValid = await compareHashedPassword( 
      password, 
      user.password 
    );

    // Si la contraseña es incorrecta, devuelve un error 401
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Genera un token de acceso si las credenciales son correctas
    const accessToken = generateAccessToken({
      id: user.id,
    });

    // Responde con el token generado
    res.status(201).json({
      accessToken, 
    });
  },
};

module.exports = {
  sessionsController,
};
