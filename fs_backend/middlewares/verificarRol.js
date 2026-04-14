const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    const rolUsuario = req.user?.role;
    if (!rolUsuario || !rolesPermitidos.includes(rolUsuario)) {
      return res.status(403).json({ ok: false, mensaje: "No tienes permiso para realizar esta acción" });
    }
    next();
  };
};

module.exports = { verificarRol };