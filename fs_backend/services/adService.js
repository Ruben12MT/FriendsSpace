const sequelize = require("../config/sequelize.js");
const { initModels } = require("../src/models/init-models.js");
const models = initModels(sequelize);
const { Op } = require("sequelize");

const LIMIT = 20;

class AdService {
  static includeData = [
    { model: models.user, as: "user", attributes: ["name", "url_image", "role"] },
    { model: models.interest, as: "interests", attributes: ["id", "name"], through: { attributes: [] } },
  ];

  async getAllAds({ page = 1, search = "" } = {}) {
    const offset = (page - 1) * LIMIT;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.substring]: search } },
        { body: { [Op.substring]: search } },
      ];
    }

    const { count, rows } = await models.ad.findAndCountAll({
      where: whereClause,
      include: AdService.includeData,
      order: [["id", "DESC"]],
      limit: LIMIT,
      offset,
      distinct: true,
    });

    return {
      datos: rows,
      total: count,
      hasMore: offset + rows.length < count,
    };
  }

  async getAdById(id) {
    return await models.ad.findByPk(id, { include: AdService.includeData });
  }

  async createAd(data, interests) {
    const transaction = await sequelize.transaction();
    try {
      const newAd = await models.ad.create(data, { transaction });

      if (interests && interests.length > 0) {
        const relations = interests.map((id) => ({ ad_id: newAd.id, interest_id: id }));
        await models.ad_interest.bulkCreate(relations, { transaction });
      }

      await transaction.commit();
      return await this.getAdById(newAd.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateAd(id, data, interestIds) {
    const transaction = await sequelize.transaction();
    try {
      await models.ad.update(data, { where: { id }, transaction });

      if (interestIds !== undefined) {
        await models.ad_interest.destroy({ where: { ad_id: id }, transaction });
        if (interestIds.length > 0) {
          const relations = interestIds.map((intId) => ({ ad_id: id, interest_id: intId }));
          await models.ad_interest.bulkCreate(relations, { transaction });
        }
      }

      await transaction.commit();
      return await this.getAdById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteAd(id) {
    return await models.ad.destroy({ where: { id } });
  }

  async getAdsByWord(word) {
    return await models.ad.findAll({
      where: { [Op.or]: [{ title: { [Op.substring]: word } }, { body: { [Op.substring]: word } }] },
      include: AdService.includeData,
    });
  }
}

module.exports = new AdService();