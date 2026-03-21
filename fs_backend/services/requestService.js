const sequelize = require("../config/sequelize");
const { initModels } = require("../src/models/init-models");
const { request, user } = initModels(sequelize);
const { Op } = require("sequelize");

class RequestService {
  async createRequest(data) {
    return await request.create(data);
  }

  async getRequestById(id) {
    return await request.findByPk(id);
  }

  async updateRequest(requestId, data) {
    return await request.update(data, {
      where: { id: requestId }
    });
  }

  async getUnreadCount(userId) {
    return await request.count({
      where: {
        [Op.or]: [
          { 
            receiver_id: userId, 
            visible_receiver: true, 
            is_read_receiver: false 
          },
          { 
            sender_id: userId, 
            visible_sender: true, 
            is_read_sender: false 
          }
        ]
      }
    });
  }

  async markAllAsRead(userId) {
    // Actualizamos las recibidas por el usuario
    await request.update(
      { is_read_receiver: true },
      {
        where: {
          receiver_id: userId,
          visible_receiver: true,
          is_read_receiver: false
        }
      }
    );

    // Actualizamos las enviadas por el usuario (que tienen respuesta)
    await request.update(
      { is_read_sender: true },
      {
        where: {
          sender_id: userId,
          visible_sender: true,
          is_read_sender: false
        }
      }
    );
  }

  async getAllVisibleRequests(userId) {
    return await request.findAll({
      where: {
        [Op.or]: [
          { receiver_id: userId, visible_receiver: true },
          { sender_id: userId, visible_sender: true }
        ]
      },
      include: [
        { model: user, as: "sender", attributes: ["id", "email", "name", "url_image"] },
        { model: user, as: "receiver", attributes: ["id", "email", "name", "url_image"] }
      ],
      order: [["updated_at", "DESC"]]
    });
  }
}

module.exports = new RequestService();