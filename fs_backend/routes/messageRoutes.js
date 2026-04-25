const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { validarToken } = require("../middlewares/validarToken");
const { uploadChat } = require("../config/cloudinary");
const multer = require("multer");

router.get("/:connectionId", validarToken, messageController.getMessages);
router.post("/:connectionId/text", validarToken, messageController.sendTextMessage);
router.put("/:connectionId/read", validarToken, messageController.markAsRead);
router.get("/:connectionId/unread", validarToken, messageController.getUnreadCount);
router.get("/unread/total", validarToken, messageController.getUnreadTotal);
router.get("/:messageId/download", validarToken, messageController.downloadFile);

router.post(
  "/:connectionId/media",
  validarToken,
  (req, res, next) => {
    uploadChat.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ ok: false, mensaje: "El archivo es demasiado grande. Máximo 200MB." });
      }
      if (err) return res.status(500).json({ ok: false, mensaje: "Error al procesar el archivo." });
      next();
    });
  },
  messageController.sendMediaMessage,
);

router.delete("/:messageId", validarToken, messageController.deleteMessage);
router.put("/:messageId", validarToken, messageController.editMessage);

module.exports = router;
