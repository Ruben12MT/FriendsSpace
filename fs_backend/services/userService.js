const sequelize = require("../config/sequelize");
const { initModels } = require("../src/models/init-models");

const models = initModels(sequelize);
const { user, interest, user_interest, connection, user_connection } = models;

const { Op } = require("sequelize");
const bcrypt = require("bcrypt");

const LIMIT = 20;

class UserService {
  async getAllUsers({ page = 1, search = "", interests = [] } = {}) {
    const offset = (page - 1) * LIMIT;
    const whereClause = { role: "USER" };
    if (search) whereClause.name = { [Op.substring]: search };

    const includeClause = [{
      model: interest, as: "interests", through: { attributes: [] },
      ...(interests.length > 0 && { where: { id: { [Op.in]: interests } } }),
    }];

    const { count, rows } = await user.findAndCountAll({
      attributes: { exclude: ["password"] },
      where: whereClause, include: includeClause,
      limit: LIMIT, offset, distinct: true,
    });

    return { datos: rows, total: count, hasMore: offset + rows.length < count };
  }

  async getAllAdmins({ myUserId, page = 1, search = "" } = {}) {
    const offset = (page - 1) * LIMIT;
    const whereClause = { role: { [Op.in]: ["ADMIN", "DEVELOPER"] }, id: { [Op.ne]: myUserId } };
    if (search) whereClause.name = { [Op.substring]: search };

    const { count, rows } = await user.findAndCountAll({
      attributes: { exclude: ["password"] },
      where: whereClause,
      include: [{ model: interest, as: "interests", through: { attributes: [] } }],
      limit: LIMIT, offset, distinct: true,
    });

    return { datos: rows, total: count, hasMore: offset + rows.length < count };
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

  async changePassword(userId, currentPassword, newPassword) {
    const foundUser = await user.findByPk(userId);
    if (!foundUser) throw new Error("Usuario no encontrado");

    const passwordMatch = await bcrypt.compare(currentPassword, foundUser.password);
    if (!passwordMatch) throw new Error("La contraseña actual no es correcta");

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Incrementar token_version para invalidar todos los tokens existentes
    await user.update(
      { password: hashedNewPassword, token_version: foundUser.token_version + 1 },
      { where: { id: userId } }
    );

    return foundUser.token_version + 1;
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

  async removeInterestsFromUser(userId) {
    const userInstance = await user.findByPk(userId);
    if (!userInstance) throw new Error("Usuario no encontrado");
    return await userInstance.setInterests([]);
  }
}

module.exports = new UserService();