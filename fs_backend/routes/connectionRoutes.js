const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connectionController');
const { validarToken } = require('../middlewares/validarToken');

// Todas las rutas requieren token de usuario logueado
// ------------------------------------------------------------------------------------

// Obtener todas las conexiones activas del usuario
router.get('/', validarToken, connectionController.getAllMyConnections);

// Activar o desbloquear una conexion existente por su ID
router.put('/:id/activate', validarToken, connectionController.activateConnection);

// Finalizar una conexion (cambia estado a FINISHED)
router.put('/:id/finish', validarToken, connectionController.finishConnection);

// Bloquear una conexion (cambia estado a BLOCKED)
router.put('/:id/block', validarToken, connectionController.blockConnection);

// Ruta para verificar si ya existe una amistad activa con un usuario
router.get("/check/:profileId", validarToken, connectionController.checkFriendship);

module.exports = router;