const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { validarToken } = require("../middlewares/validarToken");
const { uploadChat } = require("../config/cloudinary");

// Obtener historial de mensajes de una conexión (paginado)
// GET /api/messages/:connectionId?limit=30&beforeId=150
router.get("/:connectionId", validarToken, messageController.getMessages);

// Enviar mensaje de texto
router.post("/:connectionId/text", validarToken, messageController.sendTextMessage);

// Enviar mensaje con archivo multimedia (imagen, vídeo, audio, archivo)
router.post(
  "/:connectionId/media",
  validarToken,
  uploadChat.single("file"),
  messageController.sendMediaMessage,
);

// Borrar mensaje (borrado lógico, solo el autor)
router.delete("/:messageId", validarToken, messageController.deleteMessage);

// Editar mensaje de texto (solo el autor)
router.put("/:messageId", validarToken, messageController.editMessage);

module.exports = router;
