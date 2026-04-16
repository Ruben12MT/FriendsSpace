const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { validarToken } = require("../middlewares/validarToken");
const { uploadAvatar } = require("../config/cloudinary");
const { verificarRol } = require("../middlewares/verificarRol");


router.post("/login", userController.login);
router.post("/register", userController.createUser);
router.post("/logout", userController.logout);
router.get("/check-auth", validarToken, userController.checkAuth);

router.get("/", userController.getAllUsers);
router.get("/admins", validarToken, verificarRol("DEVELOPER", "ADMIN"), userController.getAllAdmins);
router.post("/create-admin", validarToken, verificarRol("DEVELOPER"), userController.createAdmin);
router.get("/search/:emailorusername", userController.getUserByEmailOrUsername);
router.get("/:id", validarToken, userController.getUserById);

router.put("/:id", validarToken, userController.updateUser);
router.put("/:id/avatar", validarToken, uploadAvatar.single("avatar"), userController.updateAvatar);
router.put("/:id/change-password", validarToken, userController.changePassword);

router.get("/:id/interests", validarToken, userController.getMyInterests);
router.post("/:id/interests", validarToken, userController.addInterests);
router.delete("/:id/interests", validarToken, userController.removeInterests);

router.put("/:id/ban", validarToken, userController.banUser);
router.put("/:id/unban", validarToken, userController.unbanUser);

module.exports = router;