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
          { receiver_id: userId, visible_receiver: true },
          { sender_id: userId, visible_sender: true }
        ],
        is_read: false
      }
    });
  }

  async markAllAsRead(userId) {
    return await request.update(
      { is_read: true },
      {
        where: {
          [Op.or]: [
            { receiver_id: userId, visible_receiver: true },
            { sender_id: userId, visible_sender: true }
          ],
          is_read: false
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
      order: [["created_at", "DESC"]]
    });
  }
}

module.exports = new RequestService();