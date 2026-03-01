const userInterestService = require("../services/userInterestService");
const interestService = require("../services/interestService");

class UserInterestController {
  async getUserInterests(req, res) {
    try {
      const { userId } = req.params;
      const interests = await userInterestService.getUserInterests(userId);
      return res.status(200).json({ ok: true, datos: interests });
    } catch (err) {
      console.error("Error en getUserInterests:", err);
      return res
        .status(500)
        .json({ ok: false, mensaje: "Error al obtener intereses del usuario" });
    }
  }

  async addInterestToUser(req, res) {
    try {
      const { userId } = req.params;
      const { interestIds } = req.body;

      const ids = Array.isArray(interestIds) ? interestIds : [interestIds];

      for (const interestId of ids) {
        const interest = await interestService.getInterestById(interestId);
        if (!interest) {
          return res
            .status(404)
            .json({
              ok: false,
              mensaje: `Interés ${interestId} no encontrado`,
            });
        }
        const alreadyHas = await userInterestService.userHasInterest(
          userId,
          interestId,
        );
        if (alreadyHas) {
          return res
            .status(400)
            .json({
              ok: false,
              mensaje: `El usuario ya tiene el interés ${interestId}`,
            });
        }
      }

      const result = await userInterestService.addInterestToUser(
        userId,
        interestIds,
      );
      return res
        .status(201)
        .json({
          ok: true,
          datos: result,
          mensaje: "Intereses añadidos correctamente",
        });
    } catch (err) {
      console.error("Error en addInterestToUser:", err);
      return res
        .status(500)
        .json({ ok: false, mensaje: "Error al añadir intereses" });
    }
  }

  async removeInterestFromUser(req, res) {
    try {
      const { userId } = req.params;
      const { interestIds } = req.body;

      const ids = Array.isArray(interestIds) ? interestIds : [interestIds];

      for (const interestId of ids) {
        const alreadyHas = await userInterestService.userHasInterest(
          userId,
          interestId,
        );
        if (!alreadyHas) {
          return res
            .status(404)
            .json({
              ok: false,
              mensaje: `El usuario no tiene el interés ${interestId}`,
            });
        }
      }

      await userInterestService.removeInterestFromUser(userId, interestIds);
      return res
        .status(200)
        .json({ ok: true, mensaje: "Intereses eliminados correctamente" });
    } catch (err) {
      console.error("Error en removeInterestFromUser:", err);
      return res
        .status(500)
        .json({ ok: false, mensaje: "Error al eliminar intereses" });
    }
  }
}

module.exports = new UserInterestController();
