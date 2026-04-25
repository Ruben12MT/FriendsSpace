const messageService = require("../services/messageService");
const { uploadChat } = require("../config/cloudinary");
const logger = require("../utils/logger");
const sequelize = require("../config/sequelize");
const { initModels } = require("../src/models/init-models");
const models = initModels(sequelize);

class MessageController {
  async getMessages(req, res) {
    try {
      const { connectionId } = req.params;
      const { limit = 30, beforeId = null } = req.query;
      const userId = req.user.id;
      const pertenece = await messageService.userBelongsToConnection(userId, connectionId);
      if (!pertenece) return res.status(403).json({ ok: false, mensaje: "No perteneces a esta conversación" });
      const messages = await messageService.getMessages(connectionId, parseInt(limit), beforeId ? parseInt(beforeId) : null);
      return res.status(200).json({ ok: true, datos: messages.reverse() });
    } catch (err) {
      logger.error("Error en getMessages: " + err.message);
      return res.status(500).json({ ok: false, mensaje: "Error al obtener mensajes" });
    }
  }

  async sendTextMessage(req, res) {
    try {
      const { connectionId } = req.params;
      const { body, reply_id } = req.body;
      const userId = req.user.id;
      const pertenece = await messageService.userBelongsToConnection(userId, connectionId);
      if (!pertenece) return res.status(403).json({ ok: false, mensaje: "No perteneces a esta conversación" });
      if (!body || !body.trim()) return res.status(400).json({ ok: false, mensaje: "El mensaje no puede estar vacío" });
      const newMessage = await messageService.createMessage({
        connection_id: connectionId, user_id: userId, type: "TEXT", body: body.trim(), reply_id: reply_id || null,
      });
      const io = req.app.get("socketio");
      if (io) {
        io.to(`chat_${connectionId}`).emit("nuevo_mensaje", { data: newMessage });
        const participants = await models.user_connection.findAll({ where: { connection_id: connectionId } });
        participants.forEach((p) => {
          if (p.user_id !== userId) io.to(`user_${p.user_id}`).emit("nuevo_mensaje", { data: newMessage });
        });
      }
      return res.status(201).json({ ok: true, datos: newMessage });
    } catch (err) {
      logger.error("Error en sendTextMessage: " + err.message);
      return res.status(500).json({ ok: false, mensaje: "Error al enviar el mensaje" });
    }
  }

  async sendMediaMessage(req, res) {
    try {
      const { connectionId } = req.params;
      const { reply_id, body } = req.body;
      const userId = req.user.id;
      const pertenece = await messageService.userBelongsToConnection(userId, connectionId);
      if (!pertenece) return res.status(403).json({ ok: false, mensaje: "No perteneces a esta conversación" });
      if (!req.file) return res.status(400).json({ ok: false, mensaje: "No se recibió ningún archivo" });
      const mime = req.file.mimetype || "";
      let type = "FILE";
      if (mime.startsWith("image/")) type = "IMAGE";
      else if (mime.startsWith("video/")) type = "VIDEO";
      else if (mime.startsWith("audio/")) type = "AUDIO";
      const newMessage = await messageService.createMessage({
        connection_id: connectionId, user_id: userId, type, url: req.file.path, body: body || null, reply_id: reply_id || null,
      });
      const io = req.app.get("socketio");
      if (io) {
        io.to(`chat_${connectionId}`).emit("nuevo_mensaje", { data: newMessage });
        const participants = await models.user_connection.findAll({ where: { connection_id: connectionId } });
        participants.forEach((p) => {
          if (p.user_id !== userId) io.to(`user_${p.user_id}`).emit("nuevo_mensaje", { data: newMessage });
        });
      }
      return res.status(201).json({ ok: true, datos: newMessage });
    } catch (err) {
      logger.error("Error en sendMediaMessage: " + err.message);
      return res.status(500).json({ ok: false, mensaje: "Error al enviar el archivo" });
    }
  }

  async markAsRead(req, res) {
    try {
      const { connectionId } = req.params;
      const userId = req.user.id;
      const pertenece = await messageService.userBelongsToConnection(userId, connectionId);
      if (!pertenece) return res.status(403).json({ ok: false, mensaje: "No perteneces a esta conversación" });
      await messageService.markAsRead(connectionId, userId);
      const io = req.app.get("socketio");
      if (io) io.to(`chat_${connectionId}`).emit("mensajes_leidos", { connectionId: Number(connectionId), userId });
      return res.status(200).json({ ok: true });
    } catch (err) {
      logger.error("Error en markAsRead: " + err.message);
      return res.status(500).json({ ok: false, mensaje: "Error al marcar mensajes como leídos" });
    }
  }

  async getUnreadCount(req, res) {
    try {
      const { connectionId } = req.params;
      const userId = req.user.id;
      const pertenece = await messageService.userBelongsToConnection(userId, connectionId);
      if (!pertenece) return res.status(403).json({ ok: false, mensaje: "No perteneces a esta conversación" });
      const count = await messageService.getUnreadCountByConnection(connectionId, userId);
      return res.status(200).json({ ok: true, count });
    } catch (err) {
      logger.error("Error en getUnreadCount: " + err.message);
      return res.status(500).json({ ok: false, mensaje: "Error al obtener mensajes no leídos" });
    }
  }

  async getUnreadTotal(req, res) {
    try {
      const userId = req.user.id;
      const count = await messageService.getUnreadCountTotal(userId);
      return res.status(200).json({ ok: true, count });
    } catch (err) {
      logger.error("Error en getUnreadTotal: " + err.message);
      return res.status(500).json({ ok: false, mensaje: "Error al obtener total de mensajes no leídos" });
    }
  }

  async deleteMessage(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;
      const msg = await messageService.getMessageById(messageId);
      if (!msg) return res.status(404).json({ ok: false, mensaje: "Mensaje no encontrado" });
      await messageService.deleteMessage(messageId, userId);
      const io = req.app.get("socketio");
      if (io) io.to(`chat_${msg.connection_id}`).emit("mensaje_borrado", { messageId: parseInt(messageId) });
      return res.status(200).json({ ok: true, mensaje: "Mensaje borrado" });
    } catch (err) {
      logger.error("Error en deleteMessage: " + err.message);
      const status = err.message.includes("permiso") ? 403 : 500;
      return res.status(status).json({ ok: false, mensaje: err.message });
    }
  }

  async editMessage(req, res) {
    try {
      const { messageId } = req.params;
      const { body } = req.body;
      const userId = req.user.id;
      if (!body || !body.trim()) return res.status(400).json({ ok: false, mensaje: "El mensaje no puede estar vacío" });
      const updated = await messageService.editMessage(messageId, userId, body.trim());
      const io = req.app.get("socketio");
      if (io) io.to(`chat_${updated.connection_id}`).emit("mensaje_editado", { data: updated });
      return res.status(200).json({ ok: true, datos: updated });
    } catch (err) {
      logger.error("Error en editMessage: " + err.message);
      const status = err.message.includes("permiso") ? 403 : 500;
      return res.status(status).json({ ok: false, mensaje: err.message });
    }
  }

  async downloadFile(req, res) {
    try {
      const { messageId } = req.params;
      const msg = await messageService.getMessageById(messageId);
      if (!msg || !msg.url) return res.status(404).json({ ok: false });
      const axios = require("axios");
      const response = await axios.get(msg.url, { responseType: "arraybuffer" });
      const fileName = msg.body || "archivo";
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      res.setHeader("Content-Type", response.headers["content-type"] || "application/octet-stream");
      res.send(Buffer.from(response.data));
    } catch (err) {
      logger.error("Error en downloadFile: " + err.message);
      res.status(500).json({ ok: false });
    }
  }
}

module.exports = new MessageController();
