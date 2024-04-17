// IMPORTAR MODULOS
const jwt = require("jwt-simple");
const moment = require("moment");

// IMPORTAR CLAVE SECRETA
const libjwt = require("../services/jwt");
const secret = libjwt.secret; 

// MIDDLEWARE (INTERMEDIARIO) DE AUTENTICACION
exports.auth = (req, res, next) => {
    try {
        // COMPROBAR SI LLEGA LA CABECERA DE AUTH
        if (!req.headers.authorization) {
            throw new Error("La petición no tiene la cabecera de autenticación");
        }

        // OBTENER EL TOKEN DE LA CABECERA DE AUTORIZACIÓN Y LIMPIARLO
        const token = req.headers.authorization.replace(/Bearer\s*/, '');

        // DECODIFICAR EL TOKEN
        const payload = jwt.decode(token, secret);

        // VERIFICAR LA FECHA DE EXPIRACIÓN DEL TOKEN
        if (payload.exp <= moment().unix()) {
            throw new Error("Token expirado");
        }

        // AGREGAR DATOS DE USUARIO AL OBJETO REQUEST
        req.user = payload;

        // PASAR A EJECUCIÓN DE ACCIÓN
        next();
        
    } catch (error) {
        return res.status(401).json({
            status: "error",
            message: error.message
        });
    }
}
