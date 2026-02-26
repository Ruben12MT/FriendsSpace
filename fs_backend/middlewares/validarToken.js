const jwt = require("jsonwebtoken");
const { SECRET_JWT_KEY } = require('../config/config');

const validarToken = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({ ok: false, mensaje: "No hay token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_JWT_KEY); 
    req.user = decoded;
    next();
  } catch (error) {
    
    return res.status(401).json({ 
      ok: false, 
      mensaje: "Token inválido",
      detalles: error.message 
    });
  }
};

module.exports = { validarToken };