const sequelize = require("../config/sequelize");
const { initModels } = require("../src/models/init-models");

const models = initModels(sequelize);
const { interest } = models;

class InterestService {
  // Obtiene todos los intereses disponibles en la base de datos
  async getAllInterests() {
    return await interest.findAll({
      order: [['name', 'ASC']]
    });
  }

  // Busca un interes por su id
  async getInterestById(id) {
    return await interest.findByPk(id);
  }

  // Crea un nuevo interes en el catalogo global
  async createInterest(interestData) {
    return await interest.create(interestData);
  }

  // Elimina un interes del catalogo
  async deleteInterest(id) {
    return await interest.destroy({ where: { id } });
  }
}

module.exports = new InterestService();