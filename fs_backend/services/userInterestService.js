const initModels = require("../src/models/init-models.js").initModels;
const sequelize = require("../config/sequelize.js");
const models = initModels(sequelize);
const user_interest = models.user_interest;
const interest = models.interest;

class UserInterestService {
  async getUserInterests(userId) {
    return await user_interest.findAll({
      where: { user_id: userId },
      include: [{ model: interest, as: "interest" }],
    });
  }

  async addInterestToUser(userId, interestIds) {
    const ids = Array.isArray(interestIds) ? interestIds : [interestIds];
    return await user_interest.bulkCreate(
      ids.map((interestId) => ({ user_id: userId, interest_id: interestId })),
    );
  }

  async removeInterestFromUser(userId, interestIds) {
    const ids = Array.isArray(interestIds) ? interestIds : [interestIds];
    return await user_interest.destroy({
      where: { user_id: userId, interest_id: ids },
    });
  }

  async userHasInterest(userId, interestId) {
    const result = await user_interest.findOne({
      where: { user_id: userId, interest_id: interestId },
    });
    return !!result;
  }
}

module.exports = new UserInterestService();
