const db = require("../db");

const UserModel = {
  get model() {
    return db.instance.models.User;
  },
  createUser(user) {
    return this.model.create(user);
  },
  findUser(query) {
    return this.model.findOne({
      where: query,
    });
  },
};

module.exports = {
  UserModel,
};
