const express = require("express");
const router = express.Router();
const adController = require("../controllers/adController");
const { validarToken } = require("../middlewares/validarToken");
const { sameUser } = require("../middlewares/sameUser");

// Rutas públicas
router.get("/", adController.getAllAds);
router.get("/search/:word", adController.getAdsByWord);
router.get("/:id", adController.getAdById);

// Rutas protegidas (solo same User)
router.post("/", validarToken, adController.createAd);
router.put("/:id", validarToken, sameUser, adController.updateAd);
router.delete("/:id", validarToken, sameUser, adController.deleteAd);

// Rutas protegidas (solo admin)
// router.post('/admin',validarToken ,adController.adminCreateAd);
// router.put('/admin/:id', validarToken, adController.adminUpdateAd);
// router.delete('/admin/:id', validarToken, adController.adminDeleteAd);

module.exports = router;
