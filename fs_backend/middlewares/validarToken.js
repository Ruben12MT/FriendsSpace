const jwt = require("jsonwebtoken");
const { SECRET_JWT_KEY } = require("../config/config");
const logger = require("../utils/logger");

const validarToken = async (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    logger.warn("NO EXISTE EL TOKEN");
    return res.status(401).json({ ok: false, mensaje: "No hay token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_JWT_KEY);

    const { initModels } = require("../src/models/init-models");
    const sequelize = require("../config/sequelize");
    const { user } = initModels(sequelize);

    const usuarioActual = await user.findByPk(decoded.id, {
      attributes: ["id", "banned", "role", "token_version"],
    });

    if (!usuarioActual || usuarioActual.banned) {
      return res.status(401).json({ ok: false, mensaje: "Cuenta suspendida" });
    }

    // Si el token_version no coincide la contraseña fue cambiada en otro dispositivo
    if (decoded.token_version !== usuarioActual.token_version) {
      return res.status(401).json({ ok: false, mensaje: "Sesión expirada, vuelve a iniciar sesión" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.error("EL TOKEN ES INVALIDO");
    return res.status(401).json({ ok: false, mensaje: "Token inválido", detalles: error.message });
  }
};

module.exports = { validarToken };