const mongoose = require("mongoose");

const connection = async() =>{
    try {
        await mongoose.connect("mongodb://localhost:27017/miredsocial");
        console.log("SE HA CONECTADO CORRECTAMENTE A LA BASE DE DATOS: miredsocial")
    } catch (error) {
        console.log(error);
        throw new Error("NO SE HA PODIDO CONECTAR A LA BASE DE DATOS !!")
    }
}

module.exports = {connection}
