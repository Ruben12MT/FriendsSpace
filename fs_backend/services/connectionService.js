const sequelize = require("../config/sequelize.js");
const { initModels } = require("../src/models/init-models.js");
const models = initModels(sequelize);
const { Op } = require("sequelize");

class ConnectionService {
  // Configuración para incluir al devolver conexiones
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
            // Filtramos para que en el include venga el otro usuario, no yo
            where: { id: { [Op.ne]: userId } },
          },
        ],
      },
    ];
  }

  // Obtener todas las conexiones activas de un usuario
  async getAllMyConnections(userId) {
  // Primero buscamos los IDs de conexiones donde participa el usuario
  const myConnections = await models.user_connection.findAll({
    where: { user_id: userId },
    attributes: ["connection_id"],
  });

  const connectionIds = myConnections.map((uc) => uc.connection_id);

  if (connectionIds.length === 0) return [];

  return await models.connection.findAll({
    where: { status: "ACTIVE", id: connectionIds },
    include: [
      {
        model: models.user_connection,
        as: "user_connections",
        include: [
          {
            model: models.user,
            as: "user",
            attributes: ["id", "name", "url_image"],
          },
        ],
      },
    ],
  });
}

  // Finalizar una conexión
  async finishConnection(id) {
    return await models.connection.update(
      { status: "FINISHED" },
      { where: { id } },
    );
  }

  // Bloquear una conexión
  async blockConnection(connectionId, userId) {
    const transaction = await sequelize.transaction();
    try {
      await models.connection.update(
        { status: "BLOCKED" },
        { where: { id: connectionId }, transaction },
      );

      await models.user_connection.update(
        { blocked_by: userId },
        {
          where: { connection_id: connectionId, user_id: userId },
          transaction,
        },
      );

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Reactivar o desbloquear una conexión
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

  // Busca si existe una conexión activa entre el usuario loggeado y otro perfil
  async findActiveConnection(myId, profileId) {
    // Corregido: Ahora usa models.connection y models.user_connection
    return await models.connection.findOne({
      where: { status: "ACTIVE" },
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
}

module.exports = new ConnectionService();