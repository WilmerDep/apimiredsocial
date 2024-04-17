// ACCIONES DE PRUEBA
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: "MENSAJE ENVIADO DESDE: controllers/follow.js"
    });
}

// EXPORTAR ACCIONES
module.exports ={
    pruebaFollow
}