const connectionService = require("../services/connectionService");
const logger = require("../utils/logger");

class ConnectionController {
  async getAllMyConnections(req, res) {
  try {
    const datos = await connectionService.getAllMyConnections(req.user.id);
    res.json({ ok: true, datos });
  } catch (error) {
    console.error("ERROR getAllMyConnections:", error.message, error.stack);
    res.status(500).json({ ok: false, mensaje: error.message });
  }
}

  async activateConnection(req, res) {
    try {
      const userId = req.user.id;
      const connectionId = req.params.id;

      const pertenece = await connectionService.userBelongsToConnection(userId, connectionId);
      if (!pertenece) {
        return res.status(403).json({ ok: false, mensaje: "No tienes permiso para modificar esta conexión" });
      }

      await connectionService.activateConnection(connectionId);

      const io = req.app.get("socketio");
      if (io) {
        const otherUserId = await connectionService.getOtherUserInConnection(connectionId, userId);
        const payload = { connectionId: Number(connectionId) };
        io.to(`user_${userId}`).emit("conexion_activada", payload);
        if (otherUserId) {
          io.to(`user_${otherUserId}`).emit("conexion_activada", payload);
        }
      }

      res.json({ ok: true, mensaje: "Conexión activada" });
    } catch (error) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  }

  async finishConnection(req, res) {
    try {
      const userId = req.user.id;
      const connectionId = req.params.id;

      const pertenece = await connectionService.userBelongsToConnection(userId, connectionId);
      const esAdmin = req.user.role === "ADMIN" || req.user.role === "DEVELOPER";

      if (!pertenece && !esAdmin) {
        return res.status(403).json({ ok: false, mensaje: "No tienes permiso para finalizar esta conexión" });
      }

      await connectionService.finishConnection(connectionId);

      const io = req.app.get("socketio");
      if (io) {
        const otherUserId = await connectionService.getOtherUserInConnection(connectionId, userId);
        if (otherUserId) {
          io.to(`user_${otherUserId}`).emit("investigacion_finalizada", {
            connectionId: Number(connectionId),
            esReporte: esAdmin,
          });
        }
      }

      res.json({ ok: true, mensaje: "Conexión finalizada" });
    } catch (error) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  }

  async blockConnection(req, res) {
    try {
      const userId = req.user.id;
      const connectionId = req.params.id;

      const pertenece = await connectionService.userBelongsToConnection(userId, connectionId);
      if (!pertenece) {
        return res.status(403).json({ ok: false, mensaje: "No tienes permiso para bloquear esta conexión" });
      }

      await connectionService.blockConnection(connectionId, userId);

      const io = req.app.get("socketio");
      if (io) {
        const otherUserId = await connectionService.getOtherUserInConnection(connectionId, userId);
        const payload = { connectionId: Number(connectionId), blockedBy: userId };
        io.to(`user_${userId}`).emit("conexion_bloqueada", payload);
        if (otherUserId) {
          io.to(`user_${otherUserId}`).emit("conexion_bloqueada", payload);
        }
      }

      res.json({ ok: true, mensaje: "Conexión bloqueada" });
    } catch (error) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  }

  async checkFriendship(req, res) {
    try {
      const myId = req.user.id;
      const { profileId } = req.params;

      const activeConn = await connectionService.findActiveConnection(myId, profileId);

      if (activeConn) {
        const myUserConn = activeConn.user_connections?.find((uc) => uc.user_id === myId);
        return res.status(200).json({
          ok: true,
          exists: true,
          connection_id: activeConn.id,
          status: activeConn.status,
          blocked_by: myUserConn?.blocked_by || null,
        });
      }

      res.status(200).json({ ok: true, exists: false });
    } catch (error) {
      logger.error("Error en checkFriendship: " + error.message);
      res.status(500).json({ ok: false, mensaje: "Error al comprobar la amistad" });
    }
  }
}

module.exports = new ConnectionController();