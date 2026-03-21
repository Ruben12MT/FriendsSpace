const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connectionController');
const { validarToken } = require('../middlewares/validarToken');

// AVISO: Si no estás logueado no podrás acceder a ninguna de estas opciones
//------------------------------------------------------------------------------------

// Ruta para obtener todas las connexiones del usuario loggeado
router.get('/', validarToken, connectionController.getAllMyConnections);

// Ruta para crear una conexión entre dos usuarios
router.post('/', validarToken, connectionController.createConnection);

// Ruta para activar una conexión entre dos usuarios (Hacer que se pueda mandar solicitud para abrirla de nuevo pues no se borran)
router.put('/:id/activate', validarToken, connectionController.activateConnection);

// Ruta para terminar una conexión
router.put('/:id/finish', validarToken, connectionController.finishConnection);

// Ruta para bloquear una conexión
router.put('/:id/block', validarToken, connectionController.blockConnection);





module.exports = router;