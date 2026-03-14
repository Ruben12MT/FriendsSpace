const express = require('express');
const router = express.Router();
const interestController = require('../controllers/interestController');
const { validarToken } = require('../middlewares/validarToken');

// Ruta publica para que cualquiera (o usuarios logueados) vean los intereses disponibles
router.get('/', interestController.getAllInterests);

// Rutas que podrias proteger mas adelante solo para administradores
router.post('/', validarToken, interestController.createInterest);
router.delete('/:id', validarToken, interestController.deleteInterest);

module.exports = router;