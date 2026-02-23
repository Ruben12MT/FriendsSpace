const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

//Rutas para login y registro de usuarios
router.post('/login', userController.login );
router.post('/register', userController.createUser );
// router.post('/logout', userController.logout );

// router.post('/protected', userController.protected  );



// Ruta para sacar todos los users
router.get('/', userController.getAllUsers);

//Ruta para sacar un usuario por email u nombre de usuario
router.get('/search/:emailOrUsername', userController.getUserByEmailOrUsername);

//Ruta para sacar un usuario por id de usuario
router.get('/:id', userController.getUserById);

//Ruta para actualizar un usuario por id
router.put('/:id', userController.updateUser);

//Ruta para eliminar un usuario por id
router.delete('/:id', userController.deleteUser);

//Ruta para bloquear un usuario por id
// router.post('/:id/block', userController.blockUser);

module.exports = router;