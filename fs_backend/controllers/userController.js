const userService = require("../services/userService");
const userValidations = require("../validations/userValidations");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_JWT_KEY } = require("../config/config");
const logger = require("../utils/logger");

const generarToken = (usuario) => jwt.sign(
  { id: usuario.id, name: usuario.name, url_image: usuario.url_image, role: usuario.role, first_login: usuario.first_login, token_version: usuario.token_version || 0 },
  SECRET_JWT_KEY,
  { expiresIn: "1h" }
);

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 1000 * 60 * 60,
};

class UserController {
  async login(req, res) {
    try {
      const { emailOrUsername, password } = req.body;
      if (!emailOrUsername || !password)
        return res.status(400).json({ ok: false, mensaje: "Introduce tus datos" });

      const usuarioBuscado = await userService.getUserByEmailOrUsername(emailOrUsername.trim().toLowerCase());

      if (!usuarioBuscado || !(await bcrypt.compare(password, usuarioBuscado.password)))
        return res.status(401).json({ ok: false, mensaje: "Credenciales incorrectas" });

      if (usuarioBuscado.banned)
        return res.status(401).json({ ok: false, mensaje: "Cuenta suspendida" });

      const token = generarToken(usuarioBuscado);
      res.cookie("access_token", token, cookieOpts);

      return res.status(200).json({
        ok: true,
        usuario: { id: usuarioBuscado.id, name: usuarioBuscado.name, url_image: usuarioBuscado.url_image, role: usuarioBuscado.role, first_login: usuarioBuscado.first_login },
        mensaje: "Bienvenido",
      });
    } catch (err) {
      logger.error("Error en login: " + err.message);
      return res.status(500).json({ ok: false, mensaje: "Error en el servidor" });
    }
  }

  async createUser(req, res) {
    try {
      const { email, name, password } = req.body;
      const emailError = await userValidations.emailValidation(email);
      if (emailError) return res.status(400).json({ ok: false, mensaje: emailError });
      const nameError = await userValidations.userNameValidation(name);
      if (nameError) return res.status(400).json({ ok: false, mensaje: nameError });
      const passError = userValidations.passwordValidation(password);
      if (passError) return res.status(400).json({ ok: false, mensaje: passError });
      const newUser = await userService.createUser({ name, email, password });
      return res.status(201).json({ ok: true, datos: newUser });
    } catch (err) {
      logger.error("Error en createUser: " + err.message);
      return res.status(500).json({ ok: false, mensaje: "Error al registrar usuario", detalle: err.message });
    }
  }

  async createAdmin(req, res) {
    try {
      if (req.user.role !== "DEVELOPER")
        return res.status(403).json({ ok: false, mensaje: "Solo los developers pueden crear admins" });

      const { email, name, password } = req.body;
      const emailError = await userValidations.emailValidation(email);
      if (emailError) return res.status(400).json({ ok: false, mensaje: emailError });
      const nameError = await userValidations.userNameValidation(name);
      if (nameError) return res.status(400).json({ ok: false, mensaje: nameError });
      const passError = userValidations.passwordValidation(password);
      if (passError) return res.status(400).json({ ok: false, mensaje: passError });

      const newAdmin = await userService.createUser({ name, email, password, role: "ADMIN", first_login: 1 });
      await userService.createDevAdminConnection(req.user.id, newAdmin.id);
      return res.status(201).json({ ok: true, datos: newAdmin });
    } catch (err) {
      logger.error("Error en createAdmin: " + err.message);
      return res.status(500).json({ ok: false, mensaje: "Error al crear admin", detalle: err.message });
    }
  }

  async getAllAdmins(req, res) {
    try {
      if (req.user.role !== "DEVELOPER" && req.user.role !== "ADMIN")
        return res.status(403).json({ ok: false, mensaje: "No tienes permiso" });
      const page = parseInt(req.query.page) || 1;
      const search = req.query.search || "";
      const result = await userService.getAllAdmins({ myUserId: req.user.id, page, search });
      res.status(200).json({ ok: true, ...result });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al consultar admins" });
    }
  }

  async logout(req, res) {
    return res.clearCookie("access_token").json({ ok: true, mensaje: "Sesion terminada" });
  }

  async checkAuth(req, res) {
    try {
      const usuarioActual = await userService.getUserById(req.user.id);
      if (!usuarioActual) return res.status(401).json({ ok: false, mensaje: "Usuario no encontrado" });
      const { password, ...usuarioLimpio } = usuarioActual.toJSON();
      return res.status(200).json({ ok: true, usuario: usuarioLimpio });
    } catch (err) {
      logger.error("Error en checkAuth: " + err.message);
      return res.status(500).json({ ok: false, mensaje: "Error al comprobar sesión" });
    }
  }

  async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const search = req.query.search || "";
      const interests = req.query.interests ? req.query.interests.split(",").map(Number).filter(Boolean) : [];
      const result = await userService.getAllUsers({ page, search, interests });
      res.status(200).json({ ok: true, ...result });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al consultar usuarios" });
    }
  }

  async getUserByEmailOrUsername(req, res) {
    try {
      const usuario = await userService.getUserByEmailOrUsername(req.params.emailorusername);
      if (!usuario) return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });
      const { password, ...usuarioLimpio } = usuario.toJSON();
      res.status(200).json({ ok: true, datos: usuarioLimpio });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al consultar" });
    }
  }

  async getUserById(req, res) {
    try {
      const usuarioBuscado = await userService.getUserById(req.params.id);
      if (!usuarioBuscado) return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });
      const { password, ...usuarioLimpio } = usuarioBuscado.toJSON ? usuarioBuscado.toJSON() : usuarioBuscado;
      return res.status(200).json({ ok: true, usuario: usuarioLimpio });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al buscar usuario" });
    }
  }

  async updateUser(req, res) {
    try {
      if (req.user.id != req.params.id)
        return res.status(403).json({ ok: false, mensaje: "No tienes permiso para realizar esta acción" });

      const camposPermitidos = ["name", "bio", "short_sentece", "goals", "first_login"];
      const datosLimpios = {};
      camposPermitidos.forEach((campo) => {
        if (req.body[campo] !== undefined) datosLimpios[campo] = req.body[campo];
      });

      await userService.updateUser(req.params.id, datosLimpios);
      const usuarioActualizado = await userService.getUserById(req.params.id);
      const token = generarToken(usuarioActualizado);
      res.cookie("access_token", token, cookieOpts);
      res.status(200).json({ ok: true, mensaje: "Perfil actualizado", usuario: usuarioActualizado });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al actualizar perfil" });
    }
  }

  async changePassword(req, res) {
    try {
      if (req.user.id != req.params.id)
        return res.status(403).json({ ok: false, mensaje: "No tienes permiso" });

      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!currentPassword || !newPassword || !confirmPassword)
        return res.status(400).json({ ok: false, mensaje: "Todos los campos son obligatorios" });

      if (newPassword !== confirmPassword)
        return res.status(400).json({ ok: false, mensaje: "Las contraseñas no coinciden" });

      const passError = userValidations.passwordValidation(newPassword);
      if (passError) return res.status(400).json({ ok: false, mensaje: passError });

      const nuevaVersion = await userService.changePassword(req.params.id, currentPassword, newPassword);

      // Cerrar sesión — el usuario debe volver a autenticarse
      res.clearCookie("access_token");
      return res.status(200).json({ ok: true, mensaje: "Contraseña actualizada. Por favor, inicia sesión de nuevo." });
    } catch (err) {
      logger.error("Error en changePassword: " + err.message);
      if (err.message === "La contraseña actual no es correcta")
        return res.status(400).json({ ok: false, mensaje: err.message });
      return res.status(500).json({ ok: false, mensaje: "Error al cambiar la contraseña" });
    }
  }

  async deleteUser(req, res) {
    try {
      if (req.user.id != req.params.id)
        return res.status(403).json({ ok: false, mensaje: "No tienes permiso para realizar esta acción" });
      await userService.deleteUser(req.params.id);
      res.status(200).json({ ok: true, mensaje: "Cuenta eliminada" });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al eliminar cuenta" });
    }
  }

  async getMyInterests(req, res) {
    try {
      const interests = await userService.getUserInterests(req.params.id);
      res.status(200).json({ ok: true, datos: interests });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al cargar intereses" });
    }
  }

  async addInterests(req, res) {
    try {
      if (req.user.id != req.params.id)
        return res.status(403).json({ ok: false, mensaje: "No tienes permiso para realizar esta acción" });
      await userService.addInterestsToUser(req.params.id, req.body.interestIds);
      res.status(200).json({ ok: true, mensaje: "Intereses guardados" });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al guardar intereses" });
    }
  }

  async banUser(req, res) {
    try {
      const { id } = req.params;
      const requestingRole = req.user.role;
      const targetUser = await userService.getUserById(id);
      if (!targetUser) return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });

      const targetRole = targetUser.role;
      if (requestingRole === "ADMIN" && (targetRole === "ADMIN" || targetRole === "DEVELOPER"))
        return res.status(403).json({ ok: false, mensaje: "No puedes banear a un admin o developer" });
      if (requestingRole === "DEVELOPER" && targetRole === "DEVELOPER")
        return res.status(403).json({ ok: false, mensaje: "No puedes banear a otro developer" });
      if (requestingRole === "USER")
        return res.status(403).json({ ok: false, mensaje: "No tienes permiso" });

      await userService.updateUser(id, { banned: true });
      const io = req.app.get("socketio");
      if (io) io.to(`user_${id}`).emit("usuario_baneado", { mensaje: "Tu cuenta ha sido suspendida" });
      return res.status(200).json({ ok: true, mensaje: "Usuario baneado" });
    } catch (err) {
      logger.error("Error en banUser: " + err.message);
      return res.status(500).json({ ok: false, mensaje: "Error al banear usuario" });
    }
  }

  async unbanUser(req, res) {
    try {
      const { id } = req.params;
      const requestingRole = req.user.role;
      if (requestingRole === "USER") return res.status(403).json({ ok: false, mensaje: "No tienes permiso" });
      const targetUser = await userService.getUserById(id);
      if (!targetUser) return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });
      await userService.updateUser(id, { banned: false });
      const io = req.app.get("socketio");
      if (io) io.to(`user_${id}`).emit("usuario_desbaneado", { mensaje: "Tu cuenta ha sido reactivada" });
      return res.status(200).json({ ok: true, mensaje: "Usuario desbaneado" });
    } catch (err) {
      logger.error("Error en unbanUser: " + err.message);
      return res.status(500).json({ ok: false, mensaje: "Error al desbanear usuario" });
    }
  }

  async removeInterests(req, res) {
    try {
      if (req.user.id != req.params.id)
        return res.status(403).json({ ok: false, mensaje: "No tienes permiso para realizar esta acción" });
      await userService.removeInterestsFromUser(req.params.id);
      res.status(200).json({ ok: true, mensaje: "Intereses quitados" });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al quitar intereses" });
    }
  }

  async updateAvatar(req, res) {
    try {
      if (req.user.id != req.params.id)
        return res.status(403).json({ ok: false, mensaje: "No tienes permiso para realizar esta acción" });
      if (!req.file) return res.status(400).json({ ok: false, mensaje: "Sube una imagen" });

      const nuevaUrl = req.file.path;
      await userService.updateUser(req.params.id, { url_image: nuevaUrl });
      const usuarioActualizado = await userService.getUserById(req.params.id);
      const token = generarToken(usuarioActualizado);
      res.cookie("access_token", token, cookieOpts);
      res.status(200).json({ ok: true, url: nuevaUrl, usuario: usuarioActualizado });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al subir avatar" });
    }
  }
}

module.exports = new UserController();