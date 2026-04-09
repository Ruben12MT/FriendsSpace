const adService = require("../services/adService");

class AdController {
  async getAllAds(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const search = req.query.search || "";
      const result = await adService.getAllAds({ page, search });
      res.status(200).json({ ok: true, ...result });
    } catch (err) {
      console.error("ERROR getAllAds:", err.message, err.stack);
      res.status(500).json({ ok: false, mensaje: "Error al obtener anuncios" });
    }
  }

  async createAd(req, res) {
    try {
      const { title, body, interests } = req.body;
      const newAd = await adService.createAd(
        { title, body, user_id: req.user.id },
        interests,
      );
      res.status(201).json({ ok: true, datos: newAd });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al crear anuncio" });
    }
  }

  async updateAd(req, res) {
    try {
      const { id } = req.params;
      const { title, body, interests } = req.body;

      const ad = await adService.getAdById(id);
      if (!ad)
        return res.status(404).json({ ok: false, mensaje: "No encontrado" });

      if (
        ad.user_id !== req.user.id &&
        req.user.role !== "ADMIN" &&
        req.user.role !== "DEVELOPER"
      )
        return res
          .status(403)
          .json({
            ok: false,
            mensaje: "No tienes permiso para editar este anuncio",
          });

      const updated = await adService.updateAd(id, { title, body }, interests);
      res.status(200).json({ ok: true, datos: updated });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al actualizar" });
    }
  }

  async deleteAd(req, res) {
    try {
      const { id } = req.params;
      const ad = await adService.getAdById(id);

      if (!ad)
        return res.status(404).json({ ok: false, mensaje: "No encontrado" });

      if (
        ad.user_id !== req.user.id &&
        req.user.role !== "ADMIN" &&
        req.user.role !== "DEVELOPER"
      )
        return res
          .status(403)
          .json({
            ok: false,
            mensaje: "No tienes permiso para borrar este anuncio",
          });

      await adService.deleteAd(id);
      res.status(200).json({ ok: true, mensaje: "Anuncio eliminado" });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al borrar" });
    }
  }

  async getAdsByWord(req, res) {
    try {
      const { word } = req.params;
      const ads = await adService.getAdsByWord(word);
      res.status(200).json({ ok: true, datos: ads });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error en la busqueda" });
    }
  }

  async getAdById(req, res) {
    try {
      const { id } = req.params;
      const ad = await adService.getAdById(id);
      res.status(200).json({ ok: true, datos: ad });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error en la busqueda" });
    }
  }
}

module.exports = new AdController();
