const adService = require("../services/adService");

class AdController {
  async createAd(req, res) {
    try {
      const { user_id, title, body, interestIds } = req.body;
      
      if (!title) {
        return res.status(400).json({ ok: false, mensaje: "Debe al menos tener un título" });
      }
      if (!interestIds || interestIds.length === 0) {
        return res.status(400).json({ ok: false, mensaje: "Debe seleccionar al menos un interés" });
      }

      if (!user_id) {
        return res.status(400).json({ ok: false, mensaje: "Todo anuncio debe tener un creador" });
      }

      const newAd = await adService.createAd({ user_id, title, body, interestIds });
      
      return res.status(201).json({
        ok: true,
        datos: newAd,
        mensaje: "Anuncio creado correctamente",
      });
    } catch (err) {
      console.error("Error en createAd:", err);
      return res.status(500).json({ ok: false, mensaje: "Error al crear anuncio" });
    }
  }

  async getAdsByWord(req, res) {
    try {
      const { word } = req.params;
      const ads = await adService.getAdsByWord(word);
      
      if (!ads || ads.length === 0) {
        return res.status(404).json({ ok: false, mensaje: "No existen anuncios con esa palabra clave" });
      }
      
      return res.status(200).json({ ok: true, datos: ads });
    } catch (err) {
      console.error("Error en getAdsByWord:", err);
      return res.status(500).json({ ok: false, mensaje: "Error al buscar anuncios" });
    }
  }

  async getAdById(req, res) {
    try {
      const { id } = req.params;
      const ad = await adService.getAdById(id);
      
      if (!ad) {
        return res.status(404).json({ ok: false, mensaje: "Anuncio no encontrado" });
      }
      
      return res.status(200).json({ ok: true, datos: ad });
    } catch (err) {
      console.error("Error en getAdById:", err);
      return res.status(500).json({ ok: false, mensaje: "Error al obtener el anuncio" });
    }
  }

  async getAllAds(req, res) {
    try {
      const ads = await adService.getAllAds();
      return res.status(200).json({ ok: true, datos: ads });
    } catch (err) {
      console.error("Error en getAllAds:", err);
      return res.status(500).json({ ok: false, mensaje: "Error al obtener anuncios" });
    }
  }

  async updateAd(req, res) {
    try {
      const { id } = req.params;
      // Primero verificamos si existe
      const adExists = await adService.getAdById(id);
      if (!adExists) {
        return res.status(404).json({ ok: false, mensaje: "Anuncio no encontrado" });
      }

      if (req.body.user_id) {
                return res.status(404).json({ ok: false, mensaje: "No puedes cambiar el autor de un anuncio" });

      }

      const updated = await adService.updateAd(id, req.body);
      
      return res.status(200).json({
        ok: true,
        datos: updated,
        mensaje: "Anuncio actualizado correctamente",
      });
    } catch (err) {
      console.error("Error en updateAd:", err);
      return res.status(500).json({ ok: false, mensaje: "Error al actualizar anuncio" });
    }
  }

  async deleteAd(req, res) {
    try {
      const { id } = req.params;
      const adExists = await adService.getAdById(id);
      
      if (!adExists) {
        return res.status(404).json({ ok: false, mensaje: "Anuncio no encontrado" });
      }

      await adService.deleteAd(id);
      
      return res.status(200).json({ ok: true, mensaje: "Anuncio eliminado correctamente" });
    } catch (err) {
      console.error("Error en deleteAd:", err);
      return res.status(500).json({ ok: false, mensaje: "Error al eliminar anuncio" });
    }
  }
}

module.exports = new AdController();