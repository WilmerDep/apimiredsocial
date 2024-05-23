const express = require("express");
const router = express.Router();
const PublicationController = require("../controllers/publication");
const check = require("../middleware/auth");
const multer = require("multer");

// CONFIGURACION DE SUBIDA DE IMAGEN
const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, "./uploads/publications/")
    },
    filename: (req, file, cb)=>{
        cb(null, "pub-"+Date.now()+"-"+file.originalname);
    }
});

const uploads = multer({storage});

// DEFINIR RUTAS
router.get("/prueba-publicacion", PublicationController.pruebaPublication);
router.post("/guardar", check.auth, PublicationController.save);
router.delete("/borrar/:id", check.auth, PublicationController.remove);
router.post("/subir/:id", [check.auth, uploads.single("file0")], PublicationController.upload);
router.get("/detalle/:id", check.auth, PublicationController.detail);
router.get("/mis-publicaciones/:id?/:page?", check.auth, PublicationController.user);
router.get("/archivo/:file", check.auth, PublicationController.showMedia);
router.get("/feed/:page?", check.auth, PublicationController.feed);
//EXPORTAR RUTAS
module.exports = router;