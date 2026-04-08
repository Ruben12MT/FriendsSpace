const sequelize = require("../config/sequelize");
const { initModels } = require("../src/models/init-models");

const models = initModels(sequelize);
const { user, interest, user_interest, connection, user_connection } = models;

const { Op } = require("sequelize");
const bcrypt = require("bcrypt");

class UserService {
  async getAllUsers() {
    return await user.findAll({
      attributes: { exclude: ["password"] },
      where: { role: "USER" },
      include: [{ model: interest, as: "interests", through: { attributes: [] } }],
    });
  }

  async getAllAdmins(myUserId) {
    return await user.findAll({
      attributes: { exclude: ["password"] },
      where: { role: { [Op.in]: ["ADMIN", "DEVELOPER"] }, id: { [Op.ne]: myUserId } },
      include: [{ model: interest, as: "interests", through: { attributes: [] } }],
    });
  }

  async getUserById(id) {
    return await user.findByPk(id, {
      include: [{ model: interest, as: "interests", through: { attributes: [] } }],
    });
  }

  async getUserByEmailOrUsername(emailOrUsername) {
    return await user.findOne({
      where: { [Op.or]: [{ name: emailOrUsername }, { email: emailOrUsername }] },
    });
  }

  async createUser(userData) {
    const hash = await bcrypt.hash(userData.password, 10);
    userData.password = hash;
    return await user.create(userData);
  }

  async createDevAdminConnection(devId, adminId) {
    const t = await sequelize.transaction();
    try {
      const newConn = await connection.create({ status: "ACTIVE" }, { transaction: t });
      await user_connection.create({ user_id: devId, connection_id: newConn.id }, { transaction: t });
      await user_connection.create({ user_id: adminId, connection_id: newConn.id }, { transaction: t });
      await t.commit();
      return newConn;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async updateUser(id, userData) {
    const [updated] = await user.update(userData, { where: { id } });
    return updated;
  }

  async deleteUser(id) {
    return await user.destroy({ where: { id } });
  }

  async getUserInterests(userId) {
    const foundUser = await user.findByPk(userId, {
      include: [{ model: interest, as: "interests", through: { attributes: [] } }],
    });
    return foundUser ? foundUser.interests : [];
  }

  async addInterestsToUser(userId, interestIds) {
    const ids = Array.isArray(interestIds) ? interestIds : [interestIds];
    const userInstance = await user.findByPk(userId);
    if (!userInstance) throw new Error("Usuario no encontrado");
    return await userInstance.addInterests(ids);
  }

  async removeInterestsFromUser(userId, interestIds) {
    const ids = Array.isArray(interestIds) ? interestIds : [interestIds];
    const userInstance = await user.findByPk(userId);
    if (!userInstance) throw new Error("Usuario no encontrado");
    return await userInstance.removeInterests(ids);
  }
}

module.exports = new UserService();