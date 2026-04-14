const express = require("express");
const router = express.Router();
const interestController = require("../controllers/interestController");
const { validarToken } = require("../middlewares/validarToken");
const { verificarRol } = require("../middlewares/verificarRol");
router.get("/", interestController.getAllInterests);

router.post(
  "/",
  validarToken,
  verificarRol("ADMIN", "DEVELOPER"),
  interestController.createInterest,
);
router.delete(
  "/:id",
  validarToken,
  verificarRol("ADMIN", "DEVELOPER"),
  interestController.deleteInterest,
);

module.exports = router;
