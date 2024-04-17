// ACCIONES DE PRUEBA
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message: "MENSAJE ENVIADO DESDE: controllers/publication.js"
    });
}

// EXPORTAR ACCIONES
module.exports ={
    pruebaPublication
}