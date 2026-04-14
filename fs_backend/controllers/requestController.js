const requestService = require("../services/requestService");
const logger = require("../utils/logger");
const userService = require("../services/userService");

class RequestController {
  async createRequest(req, res) {
    try {
      const { receiver_id, body, is_report, info_report } = req.body;
      const sender_id = req.user.id;

      const { pending, activeFriendship } =
        await requestService.findExistingRelationship(sender_id, receiver_id);

      if (pending)
        return res
          .status(400)
          .json({ ok: false, mensaje: "Ya hay una solicitud pendiente" });
      if (activeFriendship)
        return res.status(400).json({ ok: false, mensaje: "Ya sois amigos" });
      const receiver = await userService.getUserById(receiver_id);
      if (!receiver)
        return res
          .status(404)
          .json({ ok: false, mensaje: "Usuario no encontrado" });

      if (req.user.role === "USER" && receiver.role !== "USER")
        return res.status(403).json({
          ok: false,
          mensaje: "No puedes enviar solicitudes a este usuario",
        });

      if (req.user.role === "ADMIN" && receiver.role !== "ADMIN")
        return res.status(403).json({
          ok: false,
          mensaje: "No puedes enviar solicitudes a este usuario",
        });

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
      }

      res.status(201).json({ ok: true, datos: newRequest });
    } catch (err) {
      logger.error("Error en createRequest: " + err.message);
      res
        .status(500)
        .json({ ok: false, mensaje: "Error al enviar la solicitud" });
    }
  }

  async createReport(req, res) {
    try {
      const sender_id = req.user.id;
      const { body, infoReport } = req.body;

      if (!body || !body.trim())
        return res.status(400).json({
          ok: false,
          mensaje: "El motivo del reporte no puede estar vacío",
        });
      if (!infoReport || !infoReport.type)
        return res
          .status(400)
          .json({ ok: false, mensaje: "Debes indicar qué estás reportando" });
      if (
        infoReport.type === "USER" &&
        String(infoReport.user_id) === String(sender_id)
      ) {
        return res
          .status(400)
          .json({ ok: false, mensaje: "No puedes reportarte a ti mismo" });
      }

      if (infoReport.type === "USER") {
        const reportedUser = await userService.getUserById(infoReport.user_id);
        if (
          reportedUser &&
          (reportedUser.role === "ADMIN" || reportedUser.role === "DEVELOPER")
        )
          return res
            .status(403)
            .json({
              ok: false,
              mensaje: "No puedes reportar a un administrador",
            });
      }

      const nuevoReporte = await requestService.createReport(
        sender_id,
        body.trim(),
        infoReport,
      );

      const io = req.app.get("socketio");
      if (io) {
        io.to(`user_${nuevoReporte.receiver_id}`).emit("nuevo_reporte", {
          message: `Nuevo reporte asignado de ${req.user.name}`,
          data: nuevoReporte,
        });
      }

      res.status(201).json({ ok: true, datos: nuevoReporte });
    } catch (err) {
      logger.error("Error en createReport: " + err.message);
      const mensaje =
        err.message === "No hay administradores disponibles"
          ? err.message
          : "Error al enviar el reporte";
      res.status(500).json({ ok: false, mensaje });
    }
  }

  async accept(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const reqFound = await requestService.getRequestById(id);
      if (!reqFound)
        return res
          .status(404)
          .json({ ok: false, mensaje: "Solicitud no encontrada" });
      if (reqFound.receiver_id !== userId)
        return res
          .status(403)
          .json({ ok: false, mensaje: "No tienes permiso" });
      if (reqFound.status !== "PENDING")
        return res
          .status(400)
          .json({ ok: false, mensaje: "La solicitud ya no está pendiente" });

      const connectionId = await requestService.acceptRequest(
        id,
        userId,
        reqFound.sender_id,
        reqFound.is_report,
      );
      const reqActualizada = await requestService.getRequestByIdWithUsers(id);

      const io = req.app.get("socketio");
      if (io) {
        // Notificar al emisor — tanto si es solicitud normal como reporte
        io.to(`user_${reqFound.sender_id}`).emit("solicitud_respondida", {
          message: reqFound.is_report
            ? `Tu reporte ha sido aceptado y se ha abierto una investigación`
            : `${req.user.name} ha aceptado tu solicitud de amistad`,
          data: reqActualizada,
        });

        // Si es reporte, notificar también al chat que se ha creado
        if (reqFound.is_report && connectionId) {
          io.to(`user_${reqFound.sender_id}`).emit("reporte_aceptado", {
            connectionId,
            requestId: Number(id),
          });
        }
      }

      res
        .status(200)
        .json({ ok: true, mensaje: "Solicitud aceptada", connectionId });
    } catch (err) {
      logger.error("Error en accept: " + err.message);
      res.status(500).json({ ok: false, mensaje: "Error al aceptar" });
    }
  }

  async reject(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const reqFound = await requestService.getRequestById(id);
      if (!reqFound || reqFound.receiver_id !== userId)
        return res.status(403).json({ ok: false, mensaje: "No autorizado" });

      await requestService.updateRequest(id, {
        status: "REJECTED",
        visible_sender: true,
        visible_receiver: true,
        is_read_receiver: true,
        is_read_sender: false,
        updated_at: new Date(),
      });

      const reqActualizada = await requestService.getRequestByIdWithUsers(id);

      const io = req.app.get("socketio");
      if (io) {
        io.to(`user_${reqFound.sender_id}`).emit("solicitud_respondida", {
          message: reqFound.is_report
            ? `Tu reporte ha sido desestimado`
            : `${req.user.name} ha rechazado tu solicitud de amistad`,
          data: reqActualizada,
        });
      }

      res.status(200).json({ ok: true, mensaje: "Solicitud rechazada" });
    } catch (err) {
      logger.error("Error en reject: " + err.message);
      res.status(500).json({ ok: false, mensaje: "Error al rechazar" });
    }
  }

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

  async markAsRead(req, res) {
    try {
      await requestService.markAllAsRead(req.user.id);
      res.status(200).json({ ok: true, mensaje: "Notificaciones leidas" });
    } catch (err) {
      logger.error("Error en markAsRead: " + err.message);
      res.status(500).json({ ok: false, mensaje: "Error al actualizar" });
    }
  }

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
        const type = pending.sender_id === myId ? "SENT" : "RECEIVED";
        return res
          .status(200)
          .json({ ok: true, exists: true, type, data: pending });
      }

      res.status(200).json({ ok: true, exists: false });
    } catch (err) {
      logger.error("Error en checkPendingRequest: " + err.message);
      res.status(500).json({ ok: false });
    }
  }

  async getRequestsWithoutRead(req, res) {
    try {
      const myId = req.user.id;
      const requests = await requestService.getRequestsWithoutRead(myId);
      return res.status(200).json({ ok: true, numRequests: requests.length });
    } catch (err) {
      logger.error("Error en getRequestsWithoutRead: " + err.message);
      res
        .status(500)
        .json({ ok: false, mensaje: "Error en getRequestsWithoutRead" });
    }
  }
}

module.exports = new RequestController();
