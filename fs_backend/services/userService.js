const sequelize = require("../config/sequelize");
const { initModels } = require("../src/models/init-models");

const models = initModels(sequelize);
const { user, interest, user_interest } = models;

const { Op } = require("sequelize");
const bcrypt = require('bcrypt');

class UserService {
  // Obtiene todos los usuarios de la base de datos sin mostrar la contraseña
  async getAllUsers() {
  return await user.findAll({
    attributes: { exclude: ['password'] },
    include: [{ 
      model: interest, 
      as: 'interests', 
      through: { attributes: [] } 
    }]
  });
}

  // Busca un usuario por su id e incluye sus intereses asociados
  async getUserById(id) {
    return await user.findByPk(id, {
      include: [{ 
        model: interest, 
        as: 'interests', 
        through: { attributes: [] } 
      }]
    });
  }

  // Busca un usuario comparando su email o su nombre de usuario
  async getUserByEmailOrUsername(emailOrUsername) {
    return await user.findOne({
      where: {
        [Op.or]: [ { name: emailOrUsername }, { email: emailOrUsername }],
      },
    });
  }

  // Crea un nuevo usuario encriptando la contraseña antes de guardar
  async createUser(userData) {
    const hash = await bcrypt.hash(userData.password, 10);
    userData.password = hash;
    return await user.create(userData);
  }

  // Actualiza los datos de un usuario especifico
  async updateUser(id, userData) {
    const [updated] = await user.update(userData, { where: { id } });
    return updated;
  }

  // Elimina un usuario de la base de datos por su id
  async deleteUser(id) {
    return await user.destroy({ where: { id } });
  }

  // Obtiene solo la lista de intereses de un usuario concreto
  async getUserInterests(userId) {
    const foundUser = await user.findByPk(userId, {
      include: [{ 
        model: interest, 
        as: 'interests', 
        through: { attributes: [] } 
      }]
    });
    return foundUser ? foundUser.interests : [];
  }

  // Añade intereses al usuario
  async addInterestsToUser(userId, interestIds) {
    const ids = Array.isArray(interestIds) ? interestIds : [interestIds];
    const userInstance = await user.findByPk(userId);
    if (!userInstance) throw new Error("Usuario no encontrado");
    return await userInstance.addInterests(ids);
  }

  // Elimina intereses del usuario
  async removeInterestsFromUser(userId, interestIds) {
    const ids = Array.isArray(interestIds) ? interestIds : [interestIds];
    const userInstance = await user.findByPk(userId);
    if (!userInstance) throw new Error("Usuario no encontrado");
    return await userInstance.removeInterests(ids);
  }
}

module.exports = new UserService();