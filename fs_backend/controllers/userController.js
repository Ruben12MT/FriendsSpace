const jwt = require("jsonwebtoken");
const { SECRET_JWT_KEY } = require("../config/config");
const userService = require("../services/userService");
const bcrypt = require("bcrypt");
const userValidations = require("../validations/userValidations");

class UserController {
  async login(req, res) {
    try {
      const { emailOrUsername, password } = req.body;

      // 1. Validación básica de presencia
      if (!emailOrUsername || !password) {
        return res.status(400).json({
          ok: false,
          mensaje: "Debes introducir tu usuario/email y contraseña",
        });
      }

      // 2. Limpieza de datos
      const identificador = emailOrUsername.trim().toLowerCase();
      const passwordLimpia = password.trim();

      // 3. Buscar usuario por cualquiera de los dos campos
      const usuarioBuscado =
        await userService.getUserByEmailOrUsername(identificador);

      // 4. Si no existe el usuario
      if (!usuarioBuscado) {
        return res.status(404).json({
          ok: false,
          mensaje: "El usuario o correo electrónico no existe",
        });
      }

      // 5. Comparar contraseña con la de la Base de Datos
      const isMatch = await bcrypt.compare(
        passwordLimpia,
        usuarioBuscado.password,
      );

      if (!isMatch) {
        return res.status(400).json({
          ok: false,
          mensaje: "La contraseña es incorrecta",
        });
      }

      // 6. Si todo está OK, generar JWT
      const token = jwt.sign({ id: usuarioBuscado.id }, SECRET_JWT_KEY, {
        expiresIn: "1h",
      });

      // 7. Enviar Cookie y Respuesta (Usamos los datos reales de la DB)
      return res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: false, 
          sameSite: "lax", // Esto va a permitir que la cookie se mantenga en navegaciones internas
          path: "/",
          maxAge: 3600000,
        })
        .status(200)
        .json({
          ok: true,
          mensaje: "Bienvenido a Friends Space",
          user: {
            email: usuarioBuscado.email,
            name: usuarioBuscado.name,
          },
        });
    } catch (err) {
      console.error("Error en login:", err);
      return res.status(500).json({
        ok: false,
        mensaje: "Error interno del servidor al intentar iniciar sesión",
      });
    }
  }

  async logout(req, res) {
    try {
      return res.clearCookie("access_token").status(200).json({
        ok: true,
        mensaje: "Sesión cerrada correctamente",
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al intentar cerrar la sesión del usuario",
        error: error.menssage,
      });
    }
  }

  async checkAuth(req, res) {
    return res.status(200).json({
      ok: true,
      usuario: req.user,
    });
  }

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

      const userLimpio = userData.toJSON();
      delete userLimpio.password;
      delete userLimpio.email;

      return res.status(200).json({ ok: true, datos: userLimpio });
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

      const emailValidationMessage =
        await userValidations.emailValidation(email);

      if (emailValidationMessage) {
        return res.status(400).json({
          ok: false,
          datos: {},
          mensaje: emailValidationMessage,
        });
      }

      const userNameValidationMessage =
        await userValidations.userNameValidation(name);

      if (userNameValidationMessage) {
        return res.status(400).json({
          ok: false,
          datos: {},
          mensaje: userNameValidationMessage,
        });
      }

      const passwordValidationMessage =
        userValidations.passwordValidation(password);

      if (passwordValidationMessage) {
        return res.status(400).json({
          ok: false,
          datos: {},
          mensaje: passwordValidationMessage,
        });
      }

      const emailMinus = email.trim().toLowerCase();
      const nameLimpio = name.trim();
      const passwordLimpia = password.trim();
      const newUser = await userService.createUser({
        name: nameLimpio,
        email: emailMinus,
        password: passwordLimpia,
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

      // 1. Verificar si el usuario existe
      const user = await userService.getUserById(id);
      if (!user) {
        return res
          .status(404)
          .json({ ok: false, mensaje: "Usuario no encontrado" });
      }

      // 2. Bloquear cambio de email
      delete datosEditados.email;

      // 3. VALIDACIÓN DE NOMBRE DE USUARIO (Si viene en el body)
      if (datosEditados.name) {
        // Limpiamos el nombre
        datosEditados.name = datosEditados.name.trim().toLowerCase();

        // Validamos el nombre
        const nameError = await userValidations.userNameValidation(
          datosEditados.name,
        );

        // Si hay error de validación, pero es el nombre que YA TIENE el usuario, lo ignoramos
        if (nameError && datosEditados.name !== user.name) {
          return res.status(400).json({ ok: false, mensaje: nameError });
        }
      }

      // 4. VALIDACIÓN DE PASSWORD (Si viene en el body)
      if (datosEditados.password) {
        const passError = userValidations.passwordValidation(
          datosEditados.password,
        );
        if (passError) {
          return res.status(400).json({ ok: false, mensaje: passError });
        }
        // Si es válida, hasheamos
        datosEditados.password = await bcrypt.hash(datosEditados.password, 10);
      }

      // 5. Ejecutar actualización
      const updatedUser = await userService.updateUser(id, datosEditados);

      // 6. Limpiar respuesta (quitar password del JSON de salida)
      const userPlain = updatedUser.toJSON ? updatedUser.toJSON() : updatedUser;
      const { password: _, ...userSinPass } = userPlain;

      return res.status(200).json({
        ok: true,
        datos: userSinPass,
        mensaje: "Perfil actualizado correctamente",
      });
    } catch (err) {
      console.error("Error en updateUser:", err);
      return res
        .status(500)
        .json({ ok: false, mensaje: "Error interno al actualizar" });
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
