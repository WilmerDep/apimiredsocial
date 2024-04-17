// IMPORTAR DEPENDENCIAS
const jwt = require("jwt-simple");
const moment = require("moment");


// CLAVE SECREATA
const secret = "CLAVE_SECRETA_del_proyecto_DE_LA_RED_SociaL_121396";

// CREAR UNA FUNCION PARA GENERAR TOKENS
const createToken = (user) => {
    const payload = {
        id:user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, "days").unix()
    };
    
    // DEVOLVER JWT TOKEN CODIFICADO
    return jwt.encode(payload, secret);
}

module.exports = {
    secret,
    createToken
}