// controllers/userController.js
const user = require("../src/models/user");
const userService = require("../services/userService");

class UserController {
  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      return res.status(200).json({
        ok: true,
        datos: users,
        mensaje: "Usuarios recuperados correctamente",
      });
    } catch (err) {
      console.error("Error en getAllUser:", err);
      return res.status(500).json({
        ok: false,
        datos: null,
        mensaje: "Error al recuperar usuarios",
      });
    }
  }
}

module.exports = new UserController();
