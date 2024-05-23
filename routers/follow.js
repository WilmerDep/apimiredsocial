const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/follow");
const check = require("../middleware/auth");
// DEFINIR RUTAS
router.get("/prueba-seguidor", FollowController.pruebaFollow);
router.post("/guardar", check.auth, FollowController.save);
router.delete("/borrar/:id", check.auth, FollowController.unFollow);
router.get("/siguiendo/:id?/:page?", check.auth, FollowController.following);
router.get("/seguidores/:id?/:page?", check.auth, FollowController.followers);

//EXPORTAR RUTAS
module.exports = router;