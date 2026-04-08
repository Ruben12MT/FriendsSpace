const sequelize = require("../config/sequelize");
const { initModels } = require("../src/models/init-models");
const { request, user, connection, user_connection } = initModels(sequelize);
const { Op } = require("sequelize");

class RequestService {
  async createRequest(data) {
    const nuevaReq = await request.create({ ...data, created_at: new Date() });
    return await request.findByPk(nuevaReq.id, {
      include: [
        { model: user, as: "sender", attributes: ["id", "name", "url_image"] },
        { model: user, as: "receiver", attributes: ["id", "name", "url_image"] },
      ],
    });
  }

  async getRequestById(id) {
    return await request.findByPk(id);
  }

  async getRequestByIdWithUsers(id) {
    return await request.findByPk(id, {
      include: [
        { model: user, as: "sender", attributes: ["id", "name", "url_image"] },
        { model: user, as: "receiver", attributes: ["id", "name", "url_image"] },
      ],
    });
  }

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
        { model: user_connection, as: "user_connections", where: { user_id: userId1 } },
        { model: user_connection, as: "user_connections", where: { user_id: userId2 } },
      ],
      where: { status: "ACTIVE" },
    });

    return { pending, activeFriendship };
  }

  async acceptRequest(requestId, receiverId, senderId, isReport = false) {
    const t = await sequelize.transaction();
    try {
      const newConn = await connection.create({ status: "ACTIVE" }, { transaction: t });
      await user_connection.create({ user_id: senderId, connection_id: newConn.id }, { transaction: t });
      await user_connection.create({ user_id: receiverId, connection_id: newConn.id }, { transaction: t });

      await request.update(
        {
          status: "ACCEPTED",
          connection_id: newConn.id,
          visible_sender: true,
          visible_receiver: true,
          is_read_receiver: true,
          is_read_sender: false,
          updated_at: new Date(),
        },
        { where: { id: requestId }, transaction: t },
      );

      await t.commit();
      return newConn.id;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async updateRequest(requestId, data) {
    return await request.update(data, { where: { id: requestId } });
  }

  async getUnreadCount(userId) {
    return await request.count({
      where: {
        [Op.or]: [
          { receiver_id: userId, visible_receiver: true, is_read_receiver: false },
          { sender_id: userId, visible_sender: true, is_read_sender: false },
        ],
      },
    });
  }

  async markAllAsRead(userId) {
    await request.update(
      { is_read_receiver: true },
      { where: { receiver_id: userId, visible_receiver: true, is_read_receiver: false } },
    );
    await request.update(
      { is_read_sender: true },
      { where: { sender_id: userId, visible_sender: true, is_read_sender: false } },
    );
  }

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
        { model: user, as: "receiver", attributes: ["id", "name", "url_image"] },
      ],
      order: [["updated_at", "DESC"]],
    });
  }

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

  async getRequestsWithoutRead(userId) {
    return await request.findAll({
      where: {
        [Op.or]: [
          { sender_id: userId, is_read_sender: false, visible_sender: true },
          { receiver_id: userId, is_read_receiver: false, visible_receiver: true },
        ],
      },
    });
  }

  async findAdminWithLeastWorkload() {
    const admins = await user.findAll({
      where: { role: { [Op.in]: ["ADMIN", "DEVELOPER"] }, banned: false },
      attributes: ["id", "name"],
    });

    if (admins.length === 0) throw new Error("No hay administradores disponibles");

    let adminConMenosCarga = null;
    let menorCarga = Infinity;

    for (const admin of admins) {
      const reportesPendientes = await request.count({
        where: { receiver_id: admin.id, is_report: true, status: "PENDING" },
      });

      const conexionesActivas = await connection.count({
        where: { status: "ACTIVE" },
        include: [
          { model: user_connection, as: "user_connections", where: { user_id: admin.id }, required: true },
          {
            model: user_connection, as: "user_connections", required: true,
            include: [{ model: user, as: "user", where: { role: "USER" }, required: true }],
          },
        ],
      });

      const cargaTotal = reportesPendientes + conexionesActivas;
      if (cargaTotal < menorCarga) {
        menorCarga = cargaTotal;
        adminConMenosCarga = admin;
      }
    }

    return adminConMenosCarga;
  }

  async createReport(senderId, body, infoReport) {
    const adminAsignado = await this.findAdminWithLeastWorkload();

    const nuevoReporte = await request.create({
      sender_id: senderId,
      receiver_id: adminAsignado.id,
      body,
      is_report: true,
      info_report: JSON.stringify(infoReport),
      status: "PENDING",
      is_read_sender: true,
      is_read_receiver: false,
      visible_sender: true,
      visible_receiver: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return await request.findByPk(nuevoReporte.id, {
      include: [
        { model: user, as: "sender", attributes: ["id", "name", "url_image"] },
        { model: user, as: "receiver", attributes: ["id", "name", "url_image"] },
      ],
    });
  }
}

module.exports = new RequestService();