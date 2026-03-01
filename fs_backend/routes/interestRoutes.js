const express = require('express');
const router = express.Router();
const interestController = require('../controllers/interestController');
const { validarToken } = require('../middlewares/validarToken');

// Rutas públicas
router.get('/', interestController.getAllInterests);
router.get('/search/:name', interestController.getInterestByName);
router.get('/:id', interestController.getInterestById);

// Rutas protegidas (solo admin)
router.post('/', validarToken, interestController.createInterest);
router.put('/:id', validarToken, interestController.updateInterest);
router.delete('/:id', validarToken, interestController.deleteInterest);

module.exports = router;