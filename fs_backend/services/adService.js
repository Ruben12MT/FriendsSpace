const { Op } = require("sequelize");
const initModels = require("../src/models/init-models.js").initModels;
const sequelize = require("../config/sequelize.js");
const models = initModels(sequelize);

class AdService {
  static includeData = [
    {
      model: models.user,
      as: "user",
      attributes: ["name", "url_image"],
    },
    {
      model: models.interest,
      as: "interest_id_interests",
      attributes: ["id", "name", "color"],
      through: { attributes: [] },
    }
  ];

  async createAd(data) {
    const { interestIds, ...adData } = data;
    const transaccion = await sequelize.transaction();

    try {
      const newAd = await models.ad.create(adData, { transaction: transaccion });

      if (interestIds && interestIds.length > 0) {
        const adInterests = interestIds.map((id) => ({
          ad_id: newAd.id,
          interest_id: id,
        }));
        await models.ad_interest.bulkCreate(adInterests, { transaction: transaccion });
      }

      await transaccion.commit();
      return await this.getAdById(newAd.id);
    } catch (error) {
      await transaccion.rollback();
      throw error;
    }
  }

  async getAllAds() {
    return await models.ad.findAll({
      // Corregido: añadida la referencia a la clase
      include: AdService.includeData, 
      order: [['id', 'DESC']]
    });
  }

  async getAdById(id) {
    return await models.ad.findByPk(id, {
      include: AdService.includeData // Corregido
    });
  }

  async getAdsByWord(word) {
    return await models.ad.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.substring]: word } },
          { body: { [Op.substring]: word } },
        ],
      },
      include: AdService.includeData, // Corregido
    });
  }

  async updateAd(id, data) {
    const { interestIds, ...adData } = data;
    const transaccion = await sequelize.transaction();

    try {
      await models.ad.update(adData, { 
        where: { id },
        transaction: transaccion 
      });

      if (interestIds) {
        await models.ad_interest.destroy({ 
          where: { ad_id: id },
          transaction: transaccion 
        });

        const newInterests = interestIds.map(intId => ({
          ad_id: id,
          interest_id: intId
        }));
        await models.ad_interest.bulkCreate(newInterests, { transaction: transaccion });
      }

      await transaccion.commit();
      return await this.getAdById(id);
    } catch (error) {
      await transaccion.rollback();
      throw error;
    }
  }

  async deleteAd(id) {
    // Corregido: de .delete() a .destroy()
    return await models.ad.destroy({ where: { id } });
  }
}

module.exports = new AdService();