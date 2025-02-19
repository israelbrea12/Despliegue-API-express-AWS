const { generateHashedPassword } = require("../auth");
const { UserModel } = require("../models/user");

const usersController = {
  async createUser(req, res) {
    const body = req.body;

    const hashedPassword = await generateHashedPassword(body.password);

    const userData = {
      name: body.name,
      email: body.email,
      username: body.username,
      password: hashedPassword, 
    };

    try {
      const user = await UserModel.createUser(userData);

      res.status(201).json(user);
    } catch {
      res.status(400).json({ error: "Bad Request" });
    }
  },
};

module.exports = {
  usersController,
};
