const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");
const { validarToken } = require("../middlewares/validarToken");

// Crear una nueva solicitud o reporte
router.post("/", validarToken, requestController.createRequest);

// Obtener el listado de solicitudes recibidas
router.get("/list", validarToken, requestController.getMyNotifications);

// Obtener solo el número de no leídas
router.get("/count", validarToken, requestController.getUnreadCount);

// Marcar todas como leídas
router.patch("/read-all", validarToken, requestController.markAsRead);

module.exports = router;