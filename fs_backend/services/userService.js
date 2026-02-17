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
}

module.exports = new UserService();
