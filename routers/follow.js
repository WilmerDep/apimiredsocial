const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/follow");

// DEFINIR RUTAS
router.get("/prueba-seguidor", FollowController.pruebaFollow);

//EXPORTAR RUTAS
module.exports = router;