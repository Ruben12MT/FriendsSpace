const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { validarToken } = require("../middlewares/validarToken");
const { uploadAvatar } = require("../config/cloudinary");

// Rutas publicas de autenticacion
router.post("/login", userController.login);
router.post("/register", userController.createUser);
router.post("/logout", userController.logout);
// Ruta para comprobar si hay usuario logueado
router.get("/check-auth", validarToken, userController.checkAuth);

// Rutas de gestion de informacion de usuario
router.get("/", userController.getAllUsers);
router.get("/search/:emailorusername", userController.getUserByEmailOrUsername);
router.get("/:id", userController.getUserById);

// Rutas protegidas que requieren token y ser el mismo usuario
router.put("/:id", validarToken, userController.updateUser);
router.put(
  "/:id/avatar",
  validarToken,
  uploadAvatar.single("avatar"),
  userController.updateAvatar,
);

// Rutas para gestionar los intereses como subrecurso del usuario
router.get("/:id/interests", validarToken, userController.getMyInterests);
router.post("/:id/interests", validarToken, userController.addInterests);
router.delete("/:id/interests", validarToken, userController.removeInterests);

module.exports = router;
