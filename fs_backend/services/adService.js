const sequelize = require("../config/sequelize.js");
const { initModels } = require("../src/models/init-models.js");
const models = initModels(sequelize);
const { Op } = require("sequelize");

class AdService {
  // Define que incluir: el dueño (con su foto) y los intereses
  static includeData = [
    {
      model: models.user,
      as: "user",
      attributes: ["name", "url_image", "role"],
    },
    {
      model: models.interest,
      as: "interests",
      attributes: ["id", "name"],
      through: { attributes: [] },
    },
  ];

  // Obtiene todos los anuncios ordenados por id descendente
  async getAllAds() {
    return await models.ad.findAll({
      include: AdService.includeData,
      order: [["id", "DESC"]],
    });
  }

  // Busca un anuncio por su id
  async getAdById(id) {
    return await models.ad.findByPk(id, { include: AdService.includeData });
  }

  // Crea un anuncio y sus intereses asociados
  async createAd(data, interestIds) {
    const transaction = await sequelize.transaction();
    try {
      const newAd = await models.ad.create(data, { transaction });

      if (interestIds && interestIds.length > 0) {
        const relations = interestIds.map((id) => ({
          ad_id: newAd.id,
          interest_id: id,
        }));
        await models.ad_interest.bulkCreate(relations, { transaction });
      }

      await transaction.commit();
      return await this.getAdById(newAd.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Actualiza datos del anuncio y refresca sus intereses
  async updateAd(id, data, interestIds) {
    const transaction = await sequelize.transaction();
    try {
      await models.ad.update(data, { where: { id }, transaction });

      if (interestIds) {
        await models.ad_interest.destroy({ where: { ad_id: id }, transaction });
        const relations = interestIds.map((intId) => ({
          ad_id: id,
          interest_id: intId,
        }));
        await models.ad_interest.bulkCreate(relations, { transaction });
      }

      await transaction.commit();
      return await this.getAdById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Elimina un anuncio por su id
  async deleteAd(id) {
    return await models.ad.destroy({ where: { id } });
  }

  // Busca anuncios por palabra clave en titulo o cuerpo
  async getAdsByWord(word) {
    return await models.ad.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.substring]: word } },
          { body: { [Op.substring]: word } },
        ],
      },
      include: AdService.includeData,
    });
  }
  // Busca anuncios por id
  async getAdById(id) {
    return await models.ad.findByPk(id, { include: AdService.includeData });
  }
}

module.exports = new AdService();
