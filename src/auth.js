const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { config } = require("./config");

module.exports = {
  decodeAccessToken: (accessToken) => {
    try {
      return jwt.verify(accessToken, config.JWT_SECRET);
    } catch {
      return null;
    }
  },

  generateAccessToken: (data) => {
    return jwt.sign(data, config.JWT_SECRET, { expiresIn: "1h" });
  },

  generateHashedPassword: (password) => {
    return bcrypt.hash(password, 10);
  },

  compareHashedPassword: (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
  },
};