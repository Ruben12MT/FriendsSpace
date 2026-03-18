const requestService = require("../services/requestService");
const logger = require("../utils/logger");

class RequestController {
  // Maneja la creación de solicitudes de amistad o reportes
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
        is_read: false,
      });

      res.status(201).json({ ok: true, datos: newRequest });
    } catch (err) {
      logger.error("Error en createRequest: " + err.message);
      res
        .status(500)
        .json({ ok: false, mensaje: "Error al enviar la solicitud" });
    }
  }

  // Devuelve el total de notificaciones no leídas
  async getUnreadCount(req, res) {
    try {
      const count = await requestService.getUnreadCount(req.user.id);
      res.status(200).json({ ok: true, datos: count });
    } catch (err) {
      logger.error("Error en getUnreadCount: " + err.message);
      res
        .status(500)
        .json({ ok: false, mensaje: "Error al obtener el contador" });
    }
  }

  // Cambia el estado de las notificaciones a leídas
  async markAsRead(req, res) {
    try {
      await requestService.markAllAsRead(req.user.id);
      res
        .status(200)
        .json({ ok: true, mensaje: "Notificaciones marcadas como leídas" });
    } catch (err) {
      logger.error("Error en markAsRead: " + err.message);
      res
        .status(500)
        .json({ ok: false, mensaje: "Error al actualizar notificaciones" });
    }
  }

  // Obtiene el historial de solicitudes recibidas
  async getMyNotifications(req, res) {
    try {
      const notifications = await requestService.getMyRequests(req.user.id);
      res.status(200).json({ ok: true, datos: notifications });
    } catch (err) {
      logger.error("Error en getMyNotifications: " + err.message);
      res
        .status(500)
        .json({ ok: false, mensaje: "Error al obtener el listado" });
    }
  }
}

module.exports = new RequestController();
