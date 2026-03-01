const express = require('express');
const router = express.Router();
const userInterestController = require('../controllers/userInterestController');
const { validarToken } = require('../middlewares/validarToken');

router.get('/:userId/interests', validarToken, userInterestController.getUserInterests);
router.post('/:userId/interests', validarToken, userInterestController.addInterestToUser);
router.delete('/:userId/interests/:interestId', validarToken, userInterestController.removeInterestFromUser);

module.exports = router;