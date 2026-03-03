const sameUser = (req, res, next) => {
  const tokenId = req.user.id;
  const paramId = parseInt(req.params.id);

  if (tokenId !== paramId) {
    return res.status(403).json({ ok: false, mensaje: "No tienes permiso para realizar esta acción" });
  }
  next();
};

module.exports = { sameUser };