const adService = require("../services/adService");

class AdController {
  // Lista todos los anuncios
  async getAllAds(req, res) {
    try {
      const ads = await adService.getAllAds();
      res.status(200).json({ ok: true, datos: ads });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al obtener anuncios" });
    }
  }

  // Crea un anuncio nuevo para el usuario logueado
  async createAd(req, res) {
    try {
      const { title, body, interestIds } = req.body;
      const newAd = await adService.createAd({ 
        title, 
        body, 
        user_id: req.user.id 
      }, interestIds);
      res.status(201).json({ ok: true, datos: newAd });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al crear anuncio" });
    }
  }

  // Edita el anuncio validando que el usuario sea el dueño
  async updateAd(req, res) {
    try {
      const { id } = req.params;
      const { title, body, interestIds, } = req.body;


      const ad = await adService.getAdById(id);
      if (!ad) return res.status(404).json({ ok: false, mensaje: "No encontrado" });

      // Comprueba si el usuario del token es el dueño del anuncio
      if (ad.user_id !== req.user.id) {
        return res.status(403).json({ ok: false, mensaje: "No tienes permiso para editar este anuncio" });
      }

      const updated = await adService.updateAd(id, { title, body }, interestIds);
      res.status(200).json({ ok: true, datos: updated });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al actualizar" });
    }
  }

  // Borra el anuncio validando que el usuario sea el dueño
  async deleteAd(req, res) {
    try {
      const { id } = req.params;
      const ad = await adService.getAdById(id);

      if (!ad) return res.status(404).json({ ok: false, mensaje: "No encontrado" });

      // Comprueba si el usuario del token es el dueño del anuncio
      if (ad.user_id !== req.user.id) {
        return res.status(403).json({ ok: false, mensaje: "No tienes permiso para borrar este anuncio" });
      }

      await adService.deleteAd(id);
      res.status(200).json({ ok: true, mensaje: "Anuncio eliminado" });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al borrar" });
    }
  }

  // Busca anuncios por palabra clave
  async getAdsByWord(req, res) {
    try {
      const { word } = req.params;
      const ads = await adService.getAdsByWord(word);
      res.status(200).json({ ok: true, datos: ads });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error en la busqueda" });
    }
  }
}

module.exports = new AdController();