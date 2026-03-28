const sequelize = require("../config/sequelize.js");
const { initModels } = require("../src/models/init-models.js");
const models = initModels(sequelize);
const { Op } = require("sequelize");

class ConnectionService {
  static includeFriend(userId) {
    return [
      {
        model: models.user_connection,
        as: "user_connections",
        include: [
          {
            model: models.user,
            as: "user",
            attributes: ["id", "name", "url_image"],
            where: { id: { [Op.ne]: userId } },
          },
        ],
      },
    ];
  }

  async getAllMyConnections(userId) {
    const myConnections = await models.user_connection.findAll({
      where: { user_id: userId },
      attributes: ["connection_id"],
    });

    const connectionIds = myConnections.map((uc) => uc.connection_id);

    if (connectionIds.length === 0) return [];

    return await models.connection.findAll({
      where: { status: { [Op.in]: ["ACTIVE", "BLOCKED"] }, id: connectionIds },
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
    return await models.connection.findOne({
      where: {
        status: { [Op.in]: ["ACTIVE", "BLOCKED"] },
      },
      include: [
        {
          model: models.user_connection,
          as: "user_connections",
          where: { user_id: myId },
        },
        {
          model: models.user_connection,
          as: "user_connections",
          where: { user_id: profileId },
        },
      ],
    });
  }

  // Comprueba si un usuario pertenece a una conexión concreta
  async userBelongsToConnection(userId, connectionId) {
    const uc = await models.user_connection.findOne({
      where: { user_id: userId, connection_id: connectionId },
    });
    return !!uc;
  }
}

module.exports = new ConnectionService();