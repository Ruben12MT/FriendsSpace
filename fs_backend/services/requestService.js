const sequelize = require("../config/sequelize");
const { initModels } = require("../src/models/init-models");
const { request, user, connection, user_connection } = initModels(sequelize);
const { Op } = require("sequelize");

class RequestService {
  // Crea el registro de la solicitud
  async createRequest(data) {
    const nuevaReq = await request.create({
      ...data,
      created_at: new Date(),
    });
    const reqCompleta = await request.findByPk(nuevaReq.id, {
      include: [
        {
          model: user,
          as: "sender",
          attributes: ["id", "name", "url_image"],
        },

        {
          model: user,
          as: "receiver",
          attributes: ["id", "name", "url_image"],
        },
      ],
    });

    return reqCompleta;
  }

  // Busca una solicitud por su ID (sin joins)
  async getRequestById(id) {
    return await request.findByPk(id);
  }

  // Busca una solicitud por su ID incluyendo datos de sender y receiver
  // Usado para enviar por socket datos completos al frontend
  async getRequestByIdWithUsers(id) {
    return await request.findByPk(id, {
      include: [
        {
          model: user,
          as: "sender",
          attributes: ["id", "name", "url_image"],
        },
        {
          model: user,
          as: "receiver",
          attributes: ["id", "name", "url_image"],
        },
      ],
    });
  }

  // Busca solicitudes pendientes o amistades activas entre dos usuarios
  async findExistingRelationship(userId1, userId2) {
    const pending = await request.findOne({
      where: {
        [Op.or]: [
          { sender_id: userId1, receiver_id: userId2, status: "PENDING" },
          { sender_id: userId2, receiver_id: userId1, status: "PENDING" },
        ],
      },
    });

    const activeFriendship = await connection.findOne({
      include: [
        {
          model: user_connection,
          as: "user_connections",
          where: { user_id: userId1 },
        },
        {
          model: user_connection,
          as: "user_connections",
          where: { user_id: userId2 },
        },
      ],
      where: { status: "ACTIVE" },
    });

    return { pending, activeFriendship };
  }

  // Proceso de aceptacion con transaccion para asegurar la integridad de los datos
  async acceptRequest(requestId, receiverId, senderId) {
    const t = await sequelize.transaction();
    try {
      await request.update(
        {
          status: "ACCEPTED",
          visible_sender: true,
          visible_receiver: true,
          is_read_receiver: true,
          is_read_sender: false,
          updated_at: new Date(),
        },
        { where: { id: requestId }, transaction: t },
      );

      const newConn = await connection.create(
        { status: "ACTIVE" },
        { transaction: t },
      );

      await user_connection.create(
        { user_id: senderId, connection_id: newConn.id },
        { transaction: t },
      );
      await user_connection.create(
        { user_id: receiverId, connection_id: newConn.id },
        { transaction: t },
      );

      await t.commit();
      return true;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // Actualiza cualquier campo de una solicitud
  async updateRequest(requestId, data) {
    return await request.update(data, { where: { id: requestId } });
  }

  // Cuenta las notificaciones no leidas del usuario
  async getUnreadCount(userId) {
    return await request.count({
      where: {
        [Op.or]: [
          {
            receiver_id: userId,
            visible_receiver: true,
            is_read_receiver: false,
          },
          { sender_id: userId, visible_sender: true, is_read_sender: false },
        ],
      },
    });
  }

  // Marca como leidas las notificaciones del usuario
  async markAllAsRead(userId) {
    await request.update(
      { is_read_receiver: true },
      {
        where: {
          receiver_id: userId,
          visible_receiver: true,
          is_read_receiver: false,
        },
      },
    );
    await request.update(
      { is_read_sender: true },
      {
        where: {
          sender_id: userId,
          visible_sender: true,
          is_read_sender: false,
        },
      },
    );
  }

  // Lista todas las solicitudes visibles para el usuario
  async getAllVisibleRequests(userId) {
    return await request.findAll({
      where: {
        [Op.or]: [
          { receiver_id: userId, visible_receiver: true },
          { sender_id: userId, visible_sender: true },
        ],
      },
      include: [
        { model: user, as: "sender", attributes: ["id", "name", "url_image"] },
        {
          model: user,
          as: "receiver",
          attributes: ["id", "name", "url_image"],
        },
      ],
      order: [["updated_at", "DESC"]],
    });
  }

  // Busca si existe una solicitud pendiente entre dos usuarios
  async getPendingRequestBetweenUsers(userId1, userId2) {
    return await request.findOne({
      where: {
        status: "PENDING",
        [Op.or]: [
          { sender_id: userId1, receiver_id: userId2 },
          { sender_id: userId2, receiver_id: userId1 },
        ],
      },
    });
  }

  // Devuelve las solicitudes sin leer del usuario
  async getRequestsWithoutRead(userId) {
    return await request.findAll({
      where: {
        [Op.or]: [
          { sender_id: userId, is_read_sender: false, visible_sender: true },
          {
            receiver_id: userId,
            is_read_receiver: false,
            visible_receiver: true,
          },
        ],
      },
    });
  }
}

module.exports = new RequestService();
