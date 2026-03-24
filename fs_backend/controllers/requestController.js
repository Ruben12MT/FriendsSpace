const requestService = require("../services/requestService");
const logger = require("../utils/logger");

class RequestController {
  // Comprueba si ya existe una relacion antes de crear la solicitud
  async createRequest(req, res) {
    try {
      const { receiver_id, body, is_report, info_report } = req.body;
      const sender_id = req.user.id;

      const { pending, activeFriendship } =
        await requestService.findExistingRelationship(sender_id, receiver_id);

      if (pending) {
        return res
          .status(400)
          .json({ ok: false, mensaje: "Ya hay una solicitud pendiente" });
      }

      if (activeFriendship) {
        return res.status(400).json({ ok: false, mensaje: "Ya sois amigos" });
      }

      const newRequest = await requestService.createRequest({
        sender_id,
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

      const io = req.app.get("socketio");

      if (io) {
        io.to(`user_${receiver_id}`).emit("nueva_solicitud", {
          message: `Has recibido una nueva solicitud de ${req.user.name}`,
          data: newRequest,
        });

        logger.info(`Evento enviado hacia el buzon de: user_${receiver_id}`);
      }

      res.status(201).json({ ok: true, datos: newRequest });
    } catch (err) {
      logger.error("Error en createRequest: " + err.message);
      res
        .status(500)
        .json({ ok: false, mensaje: "Error al enviar la solicitud" });
    }
  }

  // Valida permisos y estado antes de aceptar la solicitud
  async accept(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const reqFound = await requestService.getRequestById(id);

      if (!reqFound) {
        return res
          .status(404)
          .json({ ok: false, mensaje: "Solicitud no encontrada" });
      }

      if (reqFound.receiver_id !== userId) {
        return res
          .status(403)
          .json({ ok: false, mensaje: "No tienes permiso" });
      }

      if (reqFound.status !== "PENDING") {
        return res
          .status(400)
          .json({ ok: false, mensaje: "La solicitud ya no esta pendiente" });
      }

      await requestService.acceptRequest(id, userId, reqFound.sender_id);

      res.status(200).json({ ok: true, mensaje: "Solicitud aceptada" });
    } catch (err) {
      logger.error("Error en accept: " + err.message);
      res.status(500).json({ ok: false, mensaje: "Error al aceptar" });
    }
  }

  // Valida permisos antes de rechazar
  async reject(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const reqFound = await requestService.getRequestById(id);

      if (!reqFound || reqFound.receiver_id !== userId) {
        return res.status(403).json({ ok: false, mensaje: "No autorizado" });
      }

      await requestService.updateRequest(id, {
        status: "REJECTED",
        visible_sender: true,
        visible_receiver: true,
        is_read_receiver: true,
        is_read_sender: false,
        updated_at: new Date(),
      });

      res.status(200).json({ ok: true, mensaje: "Solicitud rechazada" });
    } catch (err) {
      logger.error("Error en reject: " + err.message);
      res.status(500).json({ ok: false, mensaje: "Error al rechazar" });
    }
  }

  // Valida pertenencia antes de ocultar la notificacion
  async invisible(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const reqFound = await requestService.getRequestById(id);

      if (
        !reqFound ||
        (reqFound.sender_id !== userId && reqFound.receiver_id !== userId)
      ) {
        return res.status(403).json({ ok: false, mensaje: "No autorizado" });
      }

      const updateData = { updated_at: new Date() };

      if (reqFound.sender_id === userId) {
        updateData.visible_sender = false;
        updateData.is_read_sender = true;
      }

      if (reqFound.receiver_id === userId) {
        updateData.visible_receiver = false;
        updateData.is_read_receiver = true;
      }

      await requestService.updateRequest(id, updateData);
      res.status(200).json({ ok: true, mensaje: "Notificacion ocultada" });
    } catch (err) {
      logger.error("Error en invisible: " + err.message);
      res.status(500).json({ ok: false, mensaje: "Error al ocultar" });
    }
  }

  // Obtiene el numero de notificaciones nuevas
  async getUnreadCount(req, res) {
    try {
      const count = await requestService.getUnreadCount(req.user.id);
      res.status(200).json({ ok: true, datos: count });
    } catch (err) {
      logger.error("Error en getUnreadCount: " + err.message);
      res
        .status(500)
        .json({ ok: false, mensaje: "Error al contar notificaciones" });
    }
  }

  // Marca todas las notificaciones como vistas
  async markAsRead(req, res) {
    try {
      await requestService.markAllAsRead(req.user.id);
      res.status(200).json({ ok: true, mensaje: "Notificaciones leidas" });
    } catch (err) {
      logger.error("Error en markAsRead: " + err.message);
      res.status(500).json({ ok: false, mensaje: "Error al actualizar" });
    }
  }

  // Lista las notificaciones para la bandeja de entrada
  async getMyNotifications(req, res) {
    try {
      const notifications = await requestService.getAllVisibleRequests(
        req.user.id,
      );
      res.status(200).json({ ok: true, datos: notifications });
    } catch (err) {
      logger.error("Error en getMyNotifications: " + err.message);
      res.status(500).json({ ok: false, mensaje: "Error al listar" });
    }
  }

  async checkPendingRequest(req, res) {
    try {
      const myId = req.user.id;
      const { receiverId } = req.params;

      const pending = await requestService.getPendingRequestBetweenUsers(
        myId,
        receiverId,
      );

      if (pending) {
        // Si el sender_id de la DdBb es mi Id, yo la envié. Si no, yo la recibí.
        const type = pending.sender_id === myId ? "SENT" : "RECEIVED";

        return res.status(200).json({
          ok: true,
          exists: true,
          type: type,
          data: pending,
        });
      }

      res.status(200).json({ ok: true, exists: false });
    } catch (err) {
      logger.error("Error en checkPendingRequest: " + err.message);
      res.status(500).json({ ok: false });
    }
  }
  // Devolver la cantidad de request sin leer tiene lel usuario

  async getRequestsWithoutRead(req, res) {
    try {
      const myId = req.user.id;

      const requests = await requestService.getRequestsWithoutRead(myId);

      return res.status(200).json({
        ok: true,
        numRequests: requests.length,
      });
    } catch (err) {
      logger.error("Error en checkPendingRequest: " + err.message);
      res.status(500).json({ ok: false });
    }
  }
}

module.exports = new RequestController();
