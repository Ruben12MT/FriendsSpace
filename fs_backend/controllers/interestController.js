const interestService = require("../services/interestService");

class InterestController {
  // Devuelve todos los intereses al cliente
  async getAllInterests(req, res) {
    try {
      const interests = await interestService.getAllInterests();
      res.status(200).json({ ok: true, datos: interests });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al obtener catálogo de intereses" });
    }
  }

  // Crea un nuevo interés (esto lo usará normalmente un admin)
  async createInterest(req, res) {
    try {
      const newInterest = await interestService.createInterest(req.body);
      res.status(201).json({ ok: true, datos: newInterest });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al crear el interés" });
    }
  }

  // Elimina un interés por su id
  async deleteInterest(req, res) {
    try {
      await interestService.deleteInterest(req.params.id);
      res.status(200).json({ ok: true, mensaje: "Interés eliminado" });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al eliminar el interés" });
    }
  }
}

module.exports = new InterestController();