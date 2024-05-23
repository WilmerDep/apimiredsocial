const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const check = require("../middleware/auth");
const multer = require("multer");

// CONFIGURACION DE SUBIDA DE IMAGEN
const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, "./uploads/avatars/")
    },
    filename: (req, file, cb)=>{
        cb(null, "avatar-"+Date.now()+"-"+file.originalname);
    }
});

const uploads = multer({storage});

// DEFINIR RUTAS
router.get("/prueba-usuario", check.auth, UserController.pruebaUser);
router.post("/registrar-usuario", UserController.register);
router.post("/inicio-de-sesion", UserController.login);
router.get("/perfil/:id", check.auth, UserController.profile);
router.get("/listados/:page?", check.auth, UserController.list);
router.put("/actualizar", check.auth, UserController.updateUser);
router.post("/subir", [check.auth, uploads.single("file0")], UserController.upload);
router.get("/avatar/:file", check.auth, UserController.avatar);
//EXPORTAR RUTAS
module.exports = router;