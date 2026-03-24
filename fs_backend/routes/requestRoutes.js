const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");
const { validarToken } = require("../middlewares/validarToken");

// Crear una nueva solicitud o reporte
router.post("/", validarToken, requestController.createRequest);

// Obtener el listado de solicitudes en relacion al usuario
router.get("/list", validarToken, requestController.getMyNotifications);

// Obtener solo el número de no leídas
router.get("/count", validarToken, requestController.getUnreadCount);

// Marcar todas como leídas
router.put("/read-all", validarToken, requestController.markAsRead);
router.get("/withoutread", validarToken, requestController.getRequestsWithoutRead);

// Aceptar request  (Comprobar primero si soy el receptor) Al aceptar haces visible esa request para el usuario emisor y para el receptor solo edita las variable status y las variables de visibilidad
router.put("/:id/accept", validarToken, requestController.accept);

// Rechazar request  (Comprobar primero si soy el receptor) Al rechazar haces visible esa request para el usuario receptor variable status y las variables de visibilidad
router.put("/:id/reject", validarToken, requestController.reject);

// Quitar visible request  (Comprobar primero si estoy dentro de esa solicitud) Al desvisivilizar haces invisible esa request para el usuario que la edite en caso de que haya rechazado ya que el verá el mensaje de que ha rechazado
router.put("/:id/invisible", validarToken, requestController.invisible);


// Ruta para comprobar si existe una solicitud pendiente enviada a un usuario específico
router.get("/check-pending/:receiverId", validarToken, requestController.checkPendingRequest);



module.exports = router;