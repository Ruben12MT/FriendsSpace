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

    // Comprobamos en BD que el usuario no esté baneado
    const { initModels } = require("../src/models/init-models");
    const sequelize = require("../config/sequelize");
    const { user } = initModels(sequelize);

    const usuarioActual = await user.findByPk(decoded.id, {
      attributes: ["id", "banned", "role"],
    });

    if (!usuarioActual || usuarioActual.banned) {
      return res.status(401).json({ ok: false, mensaje: "Cuenta suspendida" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.error("EL TOKEN ES INVALIDO");
    return res.status(401).json({
      ok: false,
      mensaje: "Token inválido",
      detalles: error.message,
    });
  }
};

module.exports = { validarToken };
