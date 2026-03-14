const jwt = require("jsonwebtoken");
const { SECRET_JWT_KEY } = require("../config/config");
const logger = require("../utils/logger");

const validarToken = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    logger.warn("NO EXISTE EL TOKEN");

    return res.status(401).json({ ok: false, mensaje: "No hay token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_JWT_KEY);
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
