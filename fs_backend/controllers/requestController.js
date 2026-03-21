const requestService = require("../services/requestService");
const logger = require("../utils/logger");

class RequestController {
  async createRequest(req, res) {
    try {
      const { receiver_id, body, is_report, info_report } = req.body;
      const newRequest = await requestService.createRequest({
        sender_id: req.user.id,
        receiver_id,
        body,
        is_report,
        info_report,
        status: "PENDING",
        is_read_sender: true,
        is_read_receiver: false,
        visible_sender: false,
        visible_receiver: true,
      });
      res.status(201).json({ ok: true, datos: newRequest });
    } catch (err) {
      logger.error("Error en createRequest: " + err.message);
      res.status(500).json({ ok: false, mensaje: "Error al enviar la solicitud" });
    }
  }

  async accept(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const reqToUpdate = await requestService.getRequestById(id);
      if (!reqToUpdate || reqToUpdate.receiver_id !== userId) {
        return res.status(403).json({ ok: false, mensaje: "No tienes permiso para aceptar esta solicitud" });
      }
      await requestService.updateRequest(id, {
        status: "ACCEPTED",
        visible_sender: true,
        visible_receiver: true,
        is_read_receiver: true,
        is_read_sender: false,
        updated_at: new Date()
      });
      res.status(200).json({ ok: true, mensaje: "Solicitud aceptada" });
    } catch (err) {
      logger.error("Error en accept: " + err.message);
      res.status(500).json({ ok: false, mensaje: "Error al aceptar la solicitud" });
    }
  }

  async reject(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const reqToUpdate = await requestService.getRequestById(id);
      if (!reqToUpdate || reqToUpdate.receiver_id !== userId) {
        return res.status(403).json({ ok: false, mensaje: "No tienes permiso para rechazar esta solicitud" });
      }
      await requestService.updateRequest(id, {
        status: "REJECTED",
        visible_sender: true,
        visible_receiver: true,
        is_read_receiver: true,
        is_read_sender: false,
        updated_at: new Date()
      });
      res.status(200).json({ ok: true, mensaje: "Solicitud rechazada" });
    } catch (err) {
      logger.error("Error en reject: " + err.message);
      res.status(500).json({ ok: false, mensaje: "Error al rechazar la solicitud" });
    }
  }

  async invisible(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const reqToUpdate = await requestService.getRequestById(id);
      if (!reqToUpdate || (reqToUpdate.sender_id !== userId && reqToUpdate.receiver_id !== userId)) {
        return res.status(403).json({ ok: false, mensaje: "No tienes permiso para editar esta solicitud" });
      }
      const updateData = { updated_at: new Date() };
      if (reqToUpdate.sender_id === userId) {
        updateData.visible_sender = false;
        updateData.is_read_sender = true;
      }
      if (reqToUpdate.receiver_id === userId) {
        updateData.visible_receiver = false;
        updateData.is_read_receiver = true;
      }
      await requestService.updateRequest(id, updateData);
      res.status(200).json({ ok: true, mensaje: "Notificación ocultada" });
    } catch (err) {
      logger.error("Error en invisible: " + err.message);
      res.status(500).json({ ok: false, mensaje: "Error al ocultar la solicitud" });
    }
  }

  async getUnreadCount(req, res) {
    try {
      const count = await requestService.getUnreadCount(req.user.id);
      res.status(200).json({ ok: true, datos: count });
    } catch (err) {
      logger.error("Error en getUnreadCount: " + err.message);
      res.status(500).json({ ok: false, mensaje: "Error al obtener el contador" });
    }
  }

  async markAsRead(req, res) {
    try {
      await requestService.markAllAsRead(req.user.id);
      res.status(200).json({ ok: true, mensaje: "Notificaciones marcadas como leídas" });
    } catch (err) {
      logger.error("Error en markAsRead: " + err.message);
      res.status(500).json({ ok: false, mensaje: "Error al actualizar notificaciones" });
    }
  }

  async getMyNotifications(req, res) {
    try {
      const notifications = await requestService.getAllVisibleRequests(req.user.id);
      res.status(200).json({ ok: true, datos: notifications });
    } catch (err) {
      logger.error("Error en getMyNotifications: " + err.message);
      res.status(500).json({ ok: false, mensaje: "Error al obtener el listado" });
    }
  }
}

module.exports = new RequestController();