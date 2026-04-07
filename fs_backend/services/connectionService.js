const sequelize = require("../config/sequelize.js");
const { initModels } = require("../src/models/init-models.js");
const models = initModels(sequelize);
const { Op, literal } = require("sequelize");

class ConnectionService {
  async getAllMyConnections(userId) {
    const misConexiones = await models.user_connection.findAll({
      where: { user_id: userId },
      attributes: ["connection_id"],
    });

    const idsDeConexiones = misConexiones.map((uc) => uc.connection_id);
    if (idsDeConexiones.length === 0) return [];

    return await models.connection.findAll({
      where: {
        status: { [Op.in]: ["ACTIVE", "BLOCKED"] },
        id: idsDeConexiones,
      },
      include: [
        {
          model: models.user_connection,
          as: "user_connections",
          include: [
            {
              model: models.user,
              as: "user",
              attributes: ["id", "name", "url_image", "role"],
            },
          ],
        },
        {
          model: models.message,
          as: "messages",
          required: false,
          where: { deleted: false },
          attributes: ["id", "body", "type", "user_id", "createdAt"],
          order: [["createdAt", "DESC"]],
          limit: 1,
          separate: true,
        },
      ],
    });
  }

  async finishConnection(id) {
    return await models.connection.update(
      { status: "FINISHED" },
      { where: { id } },
    );
  }

  async blockConnection(connectionId, userId) {
    const transaction = await sequelize.transaction();
    try {
      await models.connection.update(
        { status: "BLOCKED" },
        { where: { id: connectionId }, transaction },
      );
      await models.user_connection.update(
        { blocked_by: userId },
        { where: { connection_id: connectionId, user_id: userId }, transaction },
      );
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async activateConnection(connectionId) {
    const transaction = await sequelize.transaction();
    try {
      await models.connection.update(
        { status: "ACTIVE" },
        { where: { id: connectionId }, transaction },
      );
      await models.user_connection.update(
        { blocked_by: null },
        { where: { connection_id: connectionId }, transaction },
      );
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async findActiveConnection(myId, profileId) {
    const misConexiones = await models.user_connection.findAll({
      where: { user_id: myId },
      attributes: ["connection_id"],
    });

    const idsDeConexiones = misConexiones.map((uc) => uc.connection_id);
    if (idsDeConexiones.length === 0) return null;

    const conexionesDelPerfil = await models.user_connection.findAll({
      where: { user_id: profileId, connection_id: { [Op.in]: idsDeConexiones } },
      attributes: ["connection_id"],
    });

    const idsCompartidos = conexionesDelPerfil.map((uc) => uc.connection_id);
    if (idsCompartidos.length === 0) return null;

    return await models.connection.findOne({
      where: {
        id: { [Op.in]: idsCompartidos },
        status: { [Op.in]: ["ACTIVE", "BLOCKED"] },
      },
      include: [
        {
          model: models.user_connection,
          as: "user_connections",
          attributes: ["user_id", "connection_id", "blocked_by"],
        },
      ],
    });
  }

  async userBelongsToConnection(userId, connectionId) {
    const uc = await models.user_connection.findOne({
      where: { user_id: userId, connection_id: connectionId },
    });
    return !!uc;
  }

  async getOtherUserInConnection(connectionId, myUserId) {
    const uc = await models.user_connection.findOne({
      where: {
        connection_id: connectionId,
        user_id: { [Op.ne]: myUserId },
      },
      attributes: ["user_id"],
    });
    return uc?.user_id || null;
  }
}

module.exports = new ConnectionService();