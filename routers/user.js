const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const check = require("../middleware/auth");

// DEFINIR RUTAS
router.get("/prueba-usuario", check.auth, UserController.pruebaUser);
router.post("/registrar-usuario", UserController.register);
router.post("/inicio-de-sesion", UserController.login);
router.get("/perfil/:id", check.auth, UserController.profile);
router.get("/listados/:page?", check.auth, UserController.list);

//EXPORTAR RUTAS
module.exports = router;