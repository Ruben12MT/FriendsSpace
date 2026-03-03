const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validarToken } = require('../middlewares/validarToken');
const { uploadAvatar } = require('../config/cloudinary');
const { sameUser } = require('../middlewares/sameUser');

//Rutas para login y registro de usuarios
router.post('/login', userController.login );
router.post('/register', userController.createUser );
router.post('/logout', userController.logout );
router.get('/check-auth', validarToken, userController.checkAuth );

// router.post('/protected', userController.protected  );

// Ruta para sacar todos los users
router.get('/', userController.getAllUsers);

//Ruta para sacar un usuario por email u nombre de usuario
router.get('/search/:emailOrUsername', userController.getUserByEmailOrUsername);

//Ruta para sacar un usuario por id de usuario
router.get('/:id', userController.getUserById);

// Ruta para cambiar la foto del usuario
router.put('/:id/avatar', validarToken, sameUser, uploadAvatar.single('avatar'), userController.updateAvatar);

// Ruta para actualizar un usuario por id
router.put('/:id', validarToken, sameUser, userController.updateUser);

// Ruta para eliminar un usuario por id
router.delete('/:id', validarToken, sameUser, userController.deleteUser);

//Ruta para bloquear un usuario por id
// router.post('/:id/block', userController.blockUser);

module.exports = router;