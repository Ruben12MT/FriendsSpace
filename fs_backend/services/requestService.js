const sequelize = require("../config/sequelize");
const { initModels } = require("../src/models/init-models")
const { request, user } = initModels(sequelize);
const { Op } = require("sequelize");

class RequestService {
  // Crear la solicitud
  async createRequest(data) {
    return await request.create(data);
  }

  // Cuenta solicitudes recibidas no leídas 
  async getUnreadCount(userId) {
    return await request.count({
      where: {
        receiver_id: userId,
        is_read: false,
        visible: true
      }
    });
  }

  // Marca todas como leídas para un usuario
  async markAllAsRead(userId) {
    return await request.update(
      { is_read: true },
      { 
        where: { 
          receiver_id: userId, 
          is_read: false 
        } 
      }
    );
  }

  // Obtiene las solicitudes con la info básica de los usuarios relacionados
  async getMyRequests(userId) {
    return await request.findAll({
      where: { 
        receiver_id: userId, 
        visible: true 
      },
      include: [
        {
          model: user,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'url_image', 'role']
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }
}

module.exports = new RequestService();