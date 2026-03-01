const { Op } = require("sequelize");
const initModels = require("../src/models/init-models.js").initModels;
const sequelize = require("../config/sequelize.js");
const models = initModels(sequelize);
const interest = models.interest;

class InterestService {

  async createInterest(data) {
    return await interest.create(data);
  }

  async getAllInterests() {
    return await interest.findAll();
  }

  async getInterestById(id) {
    return await interest.findByPk(id);
  }

  async getInterestByName(name) {
    return await interest.findOne({
      where: {
        name: { [Op.like]: name }
      }
    });
  }

  async updateInterest(id, data) {
    await interest.update(data, { where: { id } });
    return await interest.findByPk(id);
  }

  async deleteInterest(id) {
    return await interest.destroy({ where: { id } });
  }
}

module.exports = new InterestService();