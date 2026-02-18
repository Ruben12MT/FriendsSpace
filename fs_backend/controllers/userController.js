// controllers/userController.js
const user = require("../src/models/user");
const userService = require("../services/userService");

class UserController {
  async login(req, res) {
    const emailOrUsername = req.body.emailOrUsername;
    const passwordLogin = req.body.password;

    try {
      if (!emailOrUsername || !passwordLogin) {
        return res.status(400).json({
          ok: false,
          datos: null,
          mensaje: "Faltan campos obligatorios",
        });
      }

      const comprobarUser =
        await userService.getUserByEmailOrUsername(emailOrUsername);

      if (!comprobarUser) {
        return res.status(404).json({
          ok: false,
          datos: null,
          mensaje: "Usuario no encontrado",
        });
      }

      const usuarioExistente = comprobarUser.toJSON();

      const esCorrecta = await bcrypt.compare(passwordLogin, usuarioExistente.password);

      if (esCorrecta) {
        const { password, createdAt, ...userSinPrivados } = usuarioExistente;
        return res.status(200).json({
          ok: true,
          datos: userSinPrivados,
          mensaje: "Inicio de sesión exitoso",
        });
      } else {
        return res.status(401).json({
          ok: false,
          datos: null,
          mensaje: "Credenciales incorrectas",
        });
      }
    } catch (error) {
      console.error("Error en login:", error);
      return res.status(500).json({
        ok: false,
        datos: null,
        mensaje: "Error interno al iniciar sesión",
      });
    }
  }

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

      return res.status(200).json({
        ok: true,
        datos: user,
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
      const { name, email, passwordLogin } = req.body;
      if (!name || !email || !passwordLogin) {
        return res
          .status(400)
          .json({ ok: false, mensaje: "Faltan campos obligatorios" });
      } else {
        const newUser = await userService.createUser({ name, email, passwordLogin });
        return res.status(201).json({
          ok: true,
          datos: newUser,
          mensaje: "Usuario creado correctamente",
        });
      }
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
      const {
        name,
        email,
        password,
        url_image,
        bio,
        role,
        goals,
        short_sentece,
      } = req.body;
      const user = await userService.getUserById(id);
      if (!user) {
        return res
          .status(404)
          .json({ ok: false, mensaje: "Usuario no encontrado" });
      }
      const updatedUser = await userService.updateUser(id, {
        name,
        email,
        password,
        url_image,
        bio,
        role,
        goals,
        short_sentece,
      });
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
