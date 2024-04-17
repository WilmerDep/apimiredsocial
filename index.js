// 0 IMPORTAR DEPENDENCIA
const {connection} = require("./database/connection");
const express = require("express");
const cors = require("cors");

// MENSAJE DE BIENVENIDA
console.log("Buelcom, jaja att.: EL BUHONERO RE4, MENTIRA API NODE PARA RED SOCIAL EJECUTADA");

// 1 CONEXION BD
connection();

// 2 CREAR SERVIDOR NODE
const app = express();
const port = 3900;

// 3 CONFIGURAR CORS
app.use(cors());

// 4 CONVETIR LOS DATOS DEL BODY A OBJETOS JS
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// 5 CARGAR CONFIGURACION DE RUTAS
const UserRouter = require("./routers/user");
const PublicationRouter = require("./routers/publication");
const FollowRouter = require("./routers/follow");

app.use("/api/user", UserRouter);
app.use("/api/publication", PublicationRouter);
app.use("/api/follow", FollowRouter);

// RUTA DE PRUBA
app.get("/ruta-prueba", (req, res)=>{
    return res.status(200).json(
        {
            "id": 1,
            "nombre": "Wilmer",
            "web": "pholiodev.com"
        }
    );
})

// 6 PONER AL SERVIDOR A ESCUCHAR PETICIONES HTTP
app.listen(port, () => {
    console.log("SERVIDOR DE NODE CORRIENDO EN EL PUERTO: ", port);
});