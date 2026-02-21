const userService = require("../services/userService");

class UserValidations {
  // Validacion de email
  async emailValidation(email) {
    // El email debe de ser obligatorio
    if (!email) {
      return "El email es obligatorio";
    }

    // Tiene que ser un string
    if (typeof email !== "string") {
      return "El email debe de ser un texto";
    }

    // Limpieza de espacios principio y final y pasar a minuscula
    const cleanedEmail = email.trim().toLowerCase();
    // Este patrón exige: texto + @ + texto + . + texto
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanedEmail)) {
      return "El email no tiene un formato válido (ej: usuario@mail.com)";
    }

    const userFromDb = await userService.getUserByEmailOrUsername(cleanedEmail);
    if (userFromDb) {
      return "Ya existe un usuario con ese email.";
    }
    return null;
  }

  // Validacion de userName
  async userNameValidation(username) {
    // El nombre de usuario debe ser obligatorio
    if (!username) {
      return "El nombre de usuario es obligatorio";
    }

    // Tiene que ser un string
    if (typeof username !== "string") {
      return "El nombre de usuario debe ser un texto";
    }

    // Limpieza de espacios al principio y final y pasar a minúsculas
    const cleanedUsername = username.trim().toLowerCase();

    // Regla de longitud: ni muy corto ni muy largo (estándar de redes sociales)
    if (cleanedUsername.length < 3 || cleanedUsername.length > 20) {
      return "El nombre de usuario debe tener entre 3 y 20 caracteres";
    }

    // Este patrón permite: letras, números y guiones bajos (sin espacios ni puntos)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;

    if (!usernameRegex.test(cleanedUsername)) {
      return "El nombre de usuario solo puede contener letras, números y guiones bajos";
    }

    // Comprobamos si el username ya está pillado en la base de datos
    const userFromDb =
      await userService.getUserByEmailOrUsername(cleanedUsername);

    if (userFromDb) {
      return "Este nombre de usuario ya está en uso";
    }

    // Si todo está correcto, devolvemos null
    return null;
  }

  // Validacion de password
  passwordValidation() {}
}

module.exports = new UserValidations();
