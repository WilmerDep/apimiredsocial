const express = require("express");
const router = express.Router();
const PublicationController = require("../controllers/publication");

// DEFINIR RUTAS
router.get("/prueba-publicacion", PublicationController.pruebaPublication);

//EXPORTAR RUTAS
module.exports = router;