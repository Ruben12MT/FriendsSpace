const sequelize = require("../config/sequelize.js");
const initModels = require("../src/models/init-models.js").initModels;
const models = initModels(sequelize);

const sameUser = async (req, res, next) => {
  try {
    const tokenId = req.user.id; // ID del usuario logueado (desde el token)
    const paramId = parseInt(req.params.id);

    // Para usuarios
    if (req.baseUrl.includes('users')) {
      if (tokenId !== paramId) {
        return res.status(403).json({ ok: false, mensaje: "No puedes gestionar el perfil de otro usuario" });
      }
    }

    // Para anuncios
    if (req.baseUrl.includes('ads') && req.params.id) {
      const ad = await models.ad.findByPk(paramId);
      if (!ad) return res.status(404).json({ ok: false, mensaje: "Anuncio no encontrado" });
      
      // Solo el autor del anuncio puede editarlo o borrarlo
      if (ad.user_id !== tokenId) {
        return res.status(403).json({ ok: false, mensaje: "No eres el autor de este anuncio" });
      }
    }

    // Para Mensajes
    if (req.baseUrl.includes('messages') && req.params.id) {
      const message = await models.message.findByPk(paramId);
      if (!message) return res.status(404).json({ ok: false, mensaje: "Mensaje no encontrado" });

      if (message.user_id !== tokenId) {
        return res.status(403).json({ ok: false, mensaje: "No tienes permiso sobre este mensaje" });
      }
    }

    next();

  } catch (error) {
    console.error("Error en sameUser:", error);
    return res.status(500).json({ ok: false, mensaje: "Error interno de autorización" });
  }
};

module.exports = { sameUser };