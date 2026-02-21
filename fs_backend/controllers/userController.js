// controllers/userController.js
const user = require("../src/models/user");
const userService = require("../services/userService");
const bcrypt = require("bcrypt");
const userValidations = require("../validations/userValidations")

class UserController {
  async login() {}

  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();

      const usersLimpios = users.map((user) => {
        const { password, email, ...datosPublicos } = user.toJSON();
        return datosPublicos;
      });

      return res.status(200).json({
        ok: true,
        datos: usersLimpios,
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

  async getUserById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);

      if (!user) {
        return res.status(404).json({
          ok: false,
          datos: null,
          mensaje: "Usuario no encontrado",
        });
      }

      const userLimpio = user.toJSON();
      delete userLimpio.password;
      delete userLimpio.email;

      return res.status(200).json({
        ok: true,
        datos: userLimpio,
        mensaje: "Usuario recuperado correctamente",
      });
    } catch (err) {
      console.error("Error en getUserById:", err);
      return res.status(500).json({
        ok: false,
        datos: null,
        mensaje: "Error al recuperar usuario",
      });
    }
  }

  async getUserByEmailOrUsername(req, res) {
    try {
      const { emailOrUsername } = req.params;

      if (!emailOrUsername) {
        return res
          .status(400)
          .json({ ok: false, mensaje: "Falta el parámetro" });
      }

      const userData =
        await userService.getUserByEmailOrUsername(emailOrUsername);

      if (!userData) {
        return res
          .status(404)
          .json({ ok: false, mensaje: "Usuario no encontrado" });
      }

      return res.status(200).json({ ok: true, datos: userData });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, mensaje: "Error interno" });
    }
  }

  async createUser(req, res) {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ ok: false, mensaje: "Faltan campos obligatorios" });
      }

      const emailValidationMessage = await userValidations.emailValidation(email);
      
      if(emailValidationMessage){
        return res.status(400).json({
        ok: false,
        datos: {},
        mensaje: emailValidationMessage,
      }); 
      }

      const userNameValidationMessage = await userValidations.userNameValidation(name);
      
      if(userNameValidationMessage){
        return res.status(400).json({
        ok: false,
        datos: {},
        mensaje: userNameValidationMessage,
      }); 
      }

      const emailMinus = email.trim().toLowerCase();
      const nameLimpio = name.trim();
      const newUser = await userService.createUser({
        name: nameLimpio,
        email: emailMinus,
        password: password,
      });

      const { password: passwdOut, ...newUserSinPasswd } = newUser.toJSON();

      return res.status(201).json({
        ok: true,
        datos: newUserSinPasswd,
        mensaje: "Usuario creado correctamente",
      });
      
    } catch (err) {
      console.error("Error en createUser:", err);
      return res.status(500).json({
        ok: false,
        datos: null,
        mensaje: "Error al crear usuario",
      });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const datosEditados = req.body;

      const user = await userService.getUserById(id);
      if (!user) {
        return res
          .status(404)
          .json({ ok: false, mensaje: "Usuario no encontrado" });
      }

      //Evitar que se actualice el email ya que es un campo único y cada cuenta se asocia a un email específico. Si se permite actualizar el email, podría generar conflictos con otras cuentas existentes.
      if (datosEditados.email) {
        delete datosEditados.email;
      }

      if (datosEditados.password) {
        datosEditados.password = await bcrypt.hash(datosEditados.password, 10);
      } else {
        delete datosEditados.password;
      }

      const updatedUser = await userService.updateUser(id, datosEditados);

      return res.status(200).json({
        ok: true,
        datos: updatedUser,
        mensaje: "Usuario actualizado correctamente",
      });
    } catch (err) {
      console.error("Error en updateUser:", err);
      return res.status(500).json({
        ok: false,
        datos: null,
        mensaje: "Error al actualizar usuario",
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const userData = await userService.getUserById(id);

      if (!userData) {
        return res
          .status(404)
          .json({ ok: false, mensaje: "Usuario no encontrado" });
      }

      const deletedUser = await userService.deleteUser(id);

      return res.status(200).json({
        ok: true,
        datos: deletedUser,
        mensaje: "Usuario eliminado correctamente",
      });
    } catch (err) {
      console.error("Error en deleteUser:", err);
      return res.status(500).json({ ok: false, mensaje: "Error al eliminar" });
    }
  }
}

module.exports = new UserController();
