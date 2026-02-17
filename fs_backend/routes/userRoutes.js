const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


//Rutas para el login de usuarios
// router.post('/login', userController.login);
// router.post('/register', userController.register);
// router.post('/logout', userController.logout);

// Rutas para los users
router.get('/', userController.getAllUsers);
// router.post('/', userController.createUser);
// router.get('/:id', userController.getUserById);
// router.put('/:id', userController.updateUser);
// router.delete('/:id', userController.deleteUser);

module.exports = router;