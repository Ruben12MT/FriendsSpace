const sequelize = require("../config/sequelize.js");
const { initModels } = require("../src/models/init-models.js");
const { Op } = require("sequelize");
const models = initModels(sequelize);

const authorInclude = {
  model: models.user,
  as: "author",
  attributes: ["id", "name", "url_image"],
};

const replyInclude = {
  model: models.message,
  as: "parent_message",
  attributes: ["id", "body", "type", "url", "deleted"],
  include: [
    {
      model: models.user,
      as: "author",
      attributes: ["id", "name"],
    },
  ],
};

class MessageService {
  // Obtiene los mensajes de una conexión con paginación por cursor
  // Devuelve los últimos `limit` mensajes anteriores al `beforeId` dado
  async getMessages(connectionId, limit = 30, beforeId = null) {
    const where = {
      connection_id: connectionId,
    };

    if (beforeId) {
      where.id = { [Op.lt]: beforeId };
    }

    return await models.message.findAll({
      where,
      include: [authorInclude, replyInclude],
      order: [["id", "DESC"]],
      limit,
    });
  }

  // Crea un nuevo mensaje en una conexión
  async createMessage(data) {
    const newMessage = await models.message.create(data);

    // Devolvemos el mensaje completo con author y reply incluidos
    return await models.message.findByPk(newMessage.id, {
      include: [authorInclude, replyInclude],
    });
  }

  // Borrado lógico: marca el mensaje como deleted y borra el contenido
  async deleteMessage(messageId, userId) {
    const msg = await models.message.findByPk(messageId);

    if (!msg) throw new Error("Mensaje no encontrado");
    if (msg.user_id !== userId) throw new Error("No tienes permiso para borrar este mensaje");

    return await models.message.update(
      { deleted: true, body: null, url: null },
      { where: { id: messageId } },
    );
  }

  // Edita el cuerpo de un mensaje de texto
  async editMessage(messageId, userId, newBody) {
    const msg = await models.message.findByPk(messageId);

    if (!msg) throw new Error("Mensaje no encontrado");
    if (msg.user_id !== userId) throw new Error("No tienes permiso para editar este mensaje");
    if (msg.type !== "TEXT") throw new Error("Solo se pueden editar mensajes de texto");
    if (msg.deleted) throw new Error("No se puede editar un mensaje borrado");

    await models.message.update(
      { body: newBody, is_edited: true },
      { where: { id: messageId } },
    );

    return await models.message.findByPk(messageId, {
      include: [authorInclude, replyInclude],
    });
  }

  // Busca un mensaje por id (para validaciones en el controller)
  async getMessageById(messageId) {
    return await models.message.findByPk(messageId, {
      include: [authorInclude, replyInclude],
    });
  }

  // Comprueba que el usuario pertenece a la conexión
  async userBelongsToConnection(userId, connectionId) {
    const uc = await models.user_connection.findOne({
      where: { user_id: userId, connection_id: connectionId },
    });
    return !!uc;
  }
}

module.exports = new MessageService();
