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
  include: [{ model: models.user, as: "author", attributes: ["id", "name"] }],
};

class MessageService {
  async getMessages(connectionId, limit = 30, beforeId = null) {
    const where = { connection_id: connectionId };
    if (beforeId) where.id = { [Op.lt]: beforeId };
    return await models.message.findAll({
      where,
      include: [authorInclude, replyInclude],
      order: [["id", "DESC"]],
      limit,
    });
  }

  async createMessage(data) {
    const newMessage = await models.message.create(data);
    return await models.message.findByPk(newMessage.id, {
      include: [authorInclude, replyInclude],
    });
  }

  async deleteMessage(messageId, userId) {
    const msg = await models.message.findByPk(messageId);
    if (!msg) throw new Error("Mensaje no encontrado");
    if (msg.user_id !== userId) throw new Error("No tienes permiso para borrar este mensaje");
    return await models.message.update(
      { deleted: true, body: null, url: null },
      { where: { id: messageId } },
    );
  }

  async editMessage(messageId, userId, newBody) {
    const msg = await models.message.findByPk(messageId);
    if (!msg) throw new Error("Mensaje no encontrado");
    if (msg.user_id !== userId) throw new Error("No tienes permiso para editar este mensaje");
    if (msg.type !== "TEXT") throw new Error("Solo se pueden editar mensajes de texto");
    if (msg.deleted) throw new Error("No se puede editar un mensaje borrado");
    await models.message.update({ body: newBody, is_edited: true }, { where: { id: messageId } });
    return await models.message.findByPk(messageId, { include: [authorInclude, replyInclude] });
  }

  async getMessageById(messageId) {
    return await models.message.findByPk(messageId, { include: [authorInclude, replyInclude] });
  }

  async userBelongsToConnection(userId, connectionId) {
    const uc = await models.user_connection.findOne({ where: { user_id: userId, connection_id: connectionId } });
    return !!uc;
  }

  async markAsRead(connectionId, userId) {
    await models.message.update(
      { is_read: true },
      { where: { connection_id: connectionId, user_id: { [Op.ne]: userId }, is_read: false} },
    );
  }

  async getUnreadCountByConnection(connectionId, userId) {
    return await models.message.count({
      where: { connection_id: connectionId, user_id: { [Op.ne]: userId }, is_read: false, deleted: false },
    });
  }

  async getUnreadCountTotal(userId) {
    const connections = await models.user_connection.findAll({
      where: { user_id: userId },
      attributes: ["connection_id"],
    });
    const connectionIds = connections.map((c) => c.connection_id);
    if (connectionIds.length === 0) return 0;
    return await models.message.count({
      where: { connection_id: { [Op.in]: connectionIds }, user_id: { [Op.ne]: userId }, is_read: false, deleted: false },
    });
  }
}

module.exports = new MessageService();
