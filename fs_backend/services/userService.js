// services/userservice.js
// Servicio para interactuar con el modelo Sequelize `users`

// Recuperar función de inicialización de modelos
const initModels = require("../src/models/init-models.js").initModels;
const { where, Op } = require("sequelize");
// Crear la instancia de sequelize con la conexión a la base de datos
const sequelize = require("../config/sequelize.js");
// Cargar las definiciones del modelo en sequelize
const models = initModels(sequelize);
// Recuperar el modelo user
const user = models.user;

class UserService {
  async getAllUsers() {
    // Devuelve todos los usuarios.
    const result = await user.findAll();
    return result;
  }

  async getUserById(id) {
    // Devuelve un usuario por su ID.
    const result = await user.findByPk(id);
    return result;
  }

  async getUserByEmailOrUsername(emailOrUsername) {
    // Devuelve un usuario por su email o nombre de usuario.
    const result = await user.findOne({
      where: {
        [Op.or]: [{ email: emailOrUsername }, { name: emailOrUsername }],
      },
    });
    return result;
  }

  async createUser(userData) {
    const result = await user.create(userData);
    return result;
  }

  async updateUser(id, userData) {
    const result = await user.update(userData, { where: { id } });
    return result;
  }

  async deleteUser(id) {
    const result = await user.destroy({ where: { id } });
    return result;
  }
}

module.exports = new UserService();
