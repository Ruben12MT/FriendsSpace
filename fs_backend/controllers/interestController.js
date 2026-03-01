const interestService = require("../services/interestService");

class InterestController {
  async createInterest(req, res) {
    try {
      const { name, color } = req.body;
      if (!name || !color) {
        return res
          .status(400)
          .json({ ok: false, mensaje: "Faltan campos obligatorios" });
      }
      const newInterest = await interestService.createInterest({ name, color });
      return res
        .status(201)
        .json({
          ok: true,
          datos: newInterest,
          mensaje: "Interés creado correctamente",
        });
    } catch (err) {
      console.error("Error en createInterest:", err);
      return res
        .status(500)
        .json({ ok: false, mensaje: "Error al crear interés" });
    }
  }

  async getInterestByName(req, res) {
    try {
      const { name } = req.params;
      const interest = await interestService.getInterestByName(name);
      if (!interest) {
        return res
          .status(404)
          .json({ ok: false, mensaje: "Interés no encontrado" });
      }
      return res.status(200).json({ ok: true, datos: interest });
    } catch (err) {
      console.error("Error en getInterestByName:", err);
      return res
        .status(500)
        .json({ ok: false, mensaje: "Error al buscar interés" });
    }
  }

  async getInterestById(req, res) {
    try {
      const { id } = req.params;
      const interest = await interestService.getInterestById(id);
      if (!interest) {
        return res
          .status(404)
          .json({ ok: false, mensaje: "Interés no encontrado" });
      }
      return res.status(200).json({ ok: true, datos: interest });
    } catch (err) {
      console.error("Error en getInterestById:", err);
      return res
        .status(500)
        .json({ ok: false, mensaje: "Error al obtener interés" });
    }
  }
  async getAllInterests(req, res) {
    try {
      const interests = await interestService.getAllInterests();
      return res.status(200).json({ ok: true, datos: interests });
    } catch (err) {
      console.error("Error en getAllInterests:", err);
      return res
        .status(500)
        .json({ ok: false, mensaje: "Error al obtener intereses" });
    }
  }

  async updateInterest(req, res) {
    try {
      const { id } = req.params;
      const interest = await interestService.getInterestById(id);
      if (!interest) {
        return res
          .status(404)
          .json({ ok: false, mensaje: "Interés no encontrado" });
      }
      const updated = await interestService.updateInterest(id, req.body);
      return res
        .status(200)
        .json({
          ok: true,
          datos: updated,
          mensaje: "Interés actualizado correctamente",
        });
    } catch (err) {
      console.error("Error en updateInterest:", err);
      return res
        .status(500)
        .json({ ok: false, mensaje: "Error al actualizar interés" });
    }
  }

  async deleteInterest(req, res) {
    try {
      const { id } = req.params;
      const interest = await interestService.getInterestById(id);
      if (!interest) {
        return res
          .status(404)
          .json({ ok: false, mensaje: "Interés no encontrado" });
      }
      await interestService.deleteInterest(id);
      return res
        .status(200)
        .json({ ok: true, mensaje: "Interés eliminado correctamente" });
    } catch (err) {
      console.error("Error en deleteInterest:", err);
      return res
        .status(500)
        .json({ ok: false, mensaje: "Error al eliminar interés" });
    }
  }
}

module.exports = new InterestController();
