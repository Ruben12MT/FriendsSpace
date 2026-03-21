const connectionService = require("../services/connectionService");
const logger = require("../utils/logger");


class ConnectionController {
  async getAllMyConnections(req, res) {
    try {
      const datos = await connectionService.getAllMyConnections(req.user.id);
      res.json({ ok: true, datos });
    } catch (error) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  }

  async activateConnection(req, res) {
    try {
      await connectionService.activateConnection(req.params.id);
      res.json({ ok: true, mensaje: "Conexión activada" });
    } catch (error) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  }

  async finishConnection(req, res) {
    try {
      await connectionService.finishConnection(req.params.id);
      res.json({ ok: true, mensaje: "Conexión finalizada" });
    } catch (error) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  }

  async blockConnection(req, res) {
    try {
      await connectionService.blockConnection(req.params.id, req.user.id);
      res.json({ ok: true, mensaje: "Conexión bloqueada" });
    } catch (error) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  }

  async checkFriendship(req, res) {
    try {
      const myId = req.user.id;
      const { profileId } = req.params;

      const activeConn = await connectionService.findActiveConnection(
        myId,
        profileId,
      );

      if (activeConn) {
        return res.status(200).json({
          ok: true,
          exists: true,
          connection_id: activeConn.id,
        });
      }

      res.status(200).json({ ok: true, exists: false });
    } catch (error) {
      logger.error("Error en checkFriendship: " + error.message);
      res
        .status(500)
        .json({ ok: false, mensaje: "Error al comprobar la amistad" });
    }
  }
}

module.exports = new ConnectionController();
