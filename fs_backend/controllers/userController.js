const userService = require("../services/userService");
const userValidations = require("../validations/userValidations");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_JWT_KEY } = require("../config/config");
const logger = require("../utils/logger"); // Ajusta la ruta según tu carpeta
const { json } = require("sequelize");
class UserController {
  // Maneja el inicio de sesion y la creacion de la cookie
  async login(req, res) {
    logger.info("LOGIN INICIADO");
    try {
      const { emailOrUsername, password } = req.body;
      if (!emailOrUsername || !password) {
        logger.warn("ALGUNO DE LOS DATOS ESTA VACIO");

        return res
          .status(400)
          .json({ ok: false, mensaje: "Introduce tus datos" });
      }

      const usuarioBuscado = await userService.getUserByEmailOrUsername(
        emailOrUsername.trim().toLowerCase(),
      );

      if (
        !usuarioBuscado ||
        !(await bcrypt.compare(password, usuarioBuscado.password))
      ) {
        logger.warn("LA CONTRASEÑA INSERTADA NO ES LA CORRECTA");

        return res
          .status(401)
          .json({ ok: false, mensaje: "Credenciales incorrectas" });
      }

      const token = jwt.sign(
        {
          id: usuarioBuscado.id,
          name: usuarioBuscado.name,
          url_image: usuarioBuscado.url_image,
          role: usuarioBuscado.role,
          first_login: usuarioBuscado.first_login,
        },
        SECRET_JWT_KEY,
        { expiresIn: "1h" },
      );

      res.cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
      });
      logger.info("LOGIN EXITOSO");
      return res.status(200).json({
        ok: true,
        usuario: {
          id: usuarioBuscado.id,
          name: usuarioBuscado.name,
          url_image: usuarioBuscado.url_image,
          role: usuarioBuscado.role,
          first_login: usuarioBuscado.first_login,
        },
        mensaje: "Bienvenido",
      });
    } catch (err) {
      logger.error("HA OCURRIDO UN ERROR DURANTE EL LOGIN");
      return res
        .status(500)
        .json({ ok: false, mensaje: "Error en el servidor" });
    }
  }

  // Registra un usuario nuevo usando las validaciones personalizadas
  async createUser(req, res) {
    try {
      const { email, name, password } = req.body;

      // Usamos tus validaciones de userValidations.js
      const emailError = await userValidations.emailValidation(email);
      if (emailError)
        return res.status(400).json({ ok: false, mensaje: emailError });

      const nameError = await userValidations.userNameValidation(name);
      if (nameError)
        return res.status(400).json({ ok: false, mensaje: nameError });

      const passError = userValidations.passwordValidation(password);
      if (passError)
        return res.status(400).json({ ok: false, mensaje: passError });

      const newUser = await userService.createUser(req.body);
      return res.status(201).json({ ok: true, datos: newUser });
    } catch (err) {
      return res
        .status(500)
        .json({ ok: false, mensaje: "Error al registrar usuario" });
    }
  }

  // Cierra la sesion limpiando la cookie
  async logout(req, res) {
    return res
      .clearCookie("access_token")
      .json({ ok: true, mensaje: "Sesion terminada" });
  }

  // Verifica el estado de autenticacion del usuario
  async checkAuth(req, res) {
    logger.info("DEVOLVIENDO EL USUARIO LOGUEADO");
    try {
      const usuarioActual = await userService.getUserById(req.user.id);
      if (!usuarioActual) {
        return res
          .status(401)
          .json({ ok: false, mensaje: "Usuario no encontrado" });
      }
      const { password, ...usuarioLimpio } = usuarioActual.toJSON();
      return res.status(200).json({ ok: true, usuario: usuarioLimpio });
    } catch (err) {
      logger.error("Error en checkAuth: " + err.message);
      return res
        .status(500)
        .json({ ok: false, mensaje: "Error al comprobar sesión" });
    }
  }

  // Devuelve la lista completa de usuarios
  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({ ok: true, datos: users });
    } catch (err) {
      res
        .status(500)
        .json({ ok: false, mensaje: "Error al consultar usuarios" });
    }
  }

  // Devuelve un usuario por nombre
  async getUserByEmailOrUsername(req, res) {
    try {
      const usuario = await userService.getUserByEmailOrUsername(
        req.params.emailorusername,
      );

      logger.info("USUARIO A BUSCAR " + req.params.emailorusername);
      if (!usuario) {
        return res
          .status(404)
          .json({ ok: false, mensaje: "Usuario no encontrado" });
      }
      const { password, ...usuarioLimpio } = usuario.toJSON();

      res.status(200).json({
        ok: true,
        datos: usuarioLimpio,
      });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al consultar" });
    }
  }

  // Busca y devuelve un usuario por su id
  async getUserById(req, res) {
    try {
      const usuarioBuscado = await userService.getUserById(req.params.id);
      const { password, ...usuarioLimpio } = usuarioBuscado.toJSON
        ? usuarioBuscado.toJSON()
        : usuarioBuscado;

      if (!usuarioBuscado)
        return res
          .status(404)
          .json({ ok: false, mensaje: "Usuario no encontrado" });
      return res.status(200).json({
        ok: true,
        usuario: usuarioLimpio,
      });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al buscar usuario" });
    }
  }

  // Actualiza los datos del usuario logueado
  async updateUser(req, res) {
    try {
      if (req.user.id != req.params.id)
        return res.status(403).json({
          ok: false,
          mensaje: "No tienes permiso para realizar esta acción",
        });

      // 1. Actualizamos en la DB
      await userService.updateUser(req.params.id, req.body);

      // 2. Buscamos el usuario RECIÉN actualizado para tener los datos reales
      const usuarioActualizado = await userService.getUserById(req.params.id);

      // 3. Generamos un NUEVO TOKEN con los datos actualizados
      const token = jwt.sign(
        {
          id: usuarioActualizado.id,
          name: usuarioActualizado.name,
          url_image: usuarioActualizado.url_image,
          role: usuarioActualizado.role,
          first_login: usuarioActualizado.first_login,
        },
        SECRET_JWT_KEY,
        { expiresIn: "1h" },
      );

      // 4. Volvemos a enviar la cookie (sobrescribe la anterior)
      res.cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
      });

      // Enviamos el usuario actualizado para que el frontend lo guarde en Zustand
      res.status(200).json({
        ok: true,
        mensaje: "Perfil actualizado",
        usuario: usuarioActualizado,
      });
    } catch (err) {
      res
        .status(500)
        .json({ ok: false, mensaje: "Error al actualizar perfil" });
    }
  }

  // Borra al usuario de la base de datos
  async deleteUser(req, res) {
    try {
      if (req.user.id != req.params.id)
        return res.status(403).json({
          ok: false,
          mensaje: "No tienes permiso para realizar esta acción",
        });
      await userService.deleteUser(req.params.id);
      res.status(200).json({ ok: true, mensaje: "Cuenta eliminada" });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al eliminar cuenta" });
    }
  }

  // Gestion de intereses del usuario
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
        return res.status(403).json({
          ok: false,
          mensaje: "No tienes permiso para realizar esta acción",
        });
      await userService.addInterestsToUser(req.params.id, req.body.interestIds);
      res.status(200).json({ ok: true, mensaje: "Intereses guardados" });
    } catch (err) {
      res
        .status(500)
        .json({ ok: false, mensaje: "Error al guardar intereses" });
    }
  }

  async banUser(req, res) {
    try {
      const { id } = req.params;
      const requestingRole = req.user.role;
      const targetUser = await userService.getUserById(id);

      if (!targetUser) {
        return res
          .status(404)
          .json({ ok: false, mensaje: "Usuario no encontrado" });
      }

      const targetRole = targetUser.role;

      if (
        requestingRole === "ADMIN" &&
        (targetRole === "ADMIN" || targetRole === "DEVELOPER")
      ) {
        return res.status(403).json({
          ok: false,
          mensaje: "No puedes banear a un admin o developer",
        });
      }

      if (requestingRole === "DEVELOPER" && targetRole === "DEVELOPER") {
        return res
          .status(403)
          .json({ ok: false, mensaje: "No puedes banear a otro developer" });
      }

      if (requestingRole === "USER") {
        return res
          .status(403)
          .json({ ok: false, mensaje: "No tienes permiso" });
      }

      await userService.updateUser(id, { banned: true });

      // Notificar en tiempo real al usuario baneado
      const io = req.app.get("socketio");
      if (io) {
        io.to(`user_${id}`).emit("usuario_baneado", {
          mensaje: "Tu cuenta ha sido suspendida",
        });
      }

      return res.status(200).json({ ok: true, mensaje: "Usuario baneado" });
    } catch (err) {
      logger.error("Error en banUser: " + err.message);
      return res
        .status(500)
        .json({ ok: false, mensaje: "Error al banear usuario" });
    }
  }

  async unbanUser(req, res) {
  try {
    const { id } = req.params;
    const requestingRole = req.user.role;

    if (requestingRole === "USER") {
      return res.status(403).json({ ok: false, mensaje: "No tienes permiso" });
    }

    const targetUser = await userService.getUserById(id);
    if (!targetUser) {
      return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });
    }

    await userService.updateUser(id, { banned: false });

    const io = req.app.get("socketio");
    if (io) {
      io.to(`user_${id}`).emit("usuario_desbaneado", {
        mensaje: "Tu cuenta ha sido reactivada",
      });
    }

    return res.status(200).json({ ok: true, mensaje: "Usuario desbaneado" });
  } catch (err) {
    logger.error("Error en unbanUser: " + err.message);
    return res.status(500).json({ ok: false, mensaje: "Error al desbanear usuario" });
  }
}

  async removeInterests(req, res) {
    try {
      if (req.user.id != req.params.id)
        return res.status(403).json({
          ok: false,
          mensaje: "No tienes permiso para realizar esta acción",
        });
      await userService.removeInterestsFromUser(req.params.id);
      res.status(200).json({ ok: true, mensaje: "Intereses quitados" });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al quitar intereses" });
    }
  }

  async updateAvatar(req, res) {
    try {
      if (req.user.id != req.params.id)
        return res.status(403).json({
          ok: false,
          mensaje: "No tienes permiso para realizar esta acción",
        });

      if (!req.file)
        return res.status(400).json({ ok: false, mensaje: "Sube una imagen" });

      // 1. Actualizamos la URL de la imagen en la DB
      const nuevaUrl = req.file.path;
      await userService.updateUser(req.params.id, { url_image: nuevaUrl });

      // 2. Buscamos el usuario completo para el token
      const usuarioActualizado = await userService.getUserById(req.params.id);

      // 3. Generamos NUEVO TOKEN con la NUEVA URL de imagen
      const token = jwt.sign(
        {
          id: usuarioActualizado.id,
          name: usuarioActualizado.name,
          url_image: usuarioActualizado.url_image, // <--- Ahora es la nueva
          role: usuarioActualizado.role,
          first_login: usuarioActualizado.first_login,
        },
        SECRET_JWT_KEY,
        { expiresIn: "1h" },
      );

      // 4. Actualizamos la cookie
      res.cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
      });

      res.status(200).json({
        ok: true,
        url: nuevaUrl,
        usuario: usuarioActualizado,
      });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al subir avatar" });
    }
  }
}

module.exports = new UserController();
