// IMPORTACION DE MODULOS Y DEPENDENCIAS
const User = require("../models/user");
const bcrypt = require("bcrypt");

// SERVICIOS
const jwt = require("../services/jwt");

// ACCIONES DE PRUEBA
const pruebaUser = (req, res) => {
  return res.status(200).send({
    message: "MENSAJE ENVIADO DESDE: controllers/user.js",
    user: req.user,
  });
}

// REGISTRO DE USUARIO
const register = async (req, res) => {
  try {
    // RECOGER DATOS DE LA PETICION
    let params = req.body;
    // COMPROBAR QUE LLEGAN LOS DATOS MAS VALIDACION
    if (!params.name || !params.email || !params.password || !params.nick) {
      return res.status(400).json({
        status: "error",
        message: "FALTAN DATOS POR ENVIAR",
      });
    }

    // CONTROL DE USUARIOS DUPLICADOS
    const users = await User.find({
      $or: [
        {
          email: params.email.toLowerCase(),
          nick: params.nick.toLowerCase(),
        },
      ],
    });

    if (users && users.length >= 1) {
      return res.status(200).send({
        status: "error",
        message: "EL USUARIO YA EXISTE",
      });
    }

    // CIFRAR LA CONTRASEñA
    let pwd = await bcrypt.hash(params.password, 10);
    params.password = pwd;

    // CREAR OBJETO DE USUARIO
    let userToSave = new User(params);

    // GUARDAR USUARIO EN LA BD
    let userStored = await userToSave.save();

    // DEVOLVER RESULTADOS
    return res.status(200).json({
      status: "success",
      message: "NUEVO USUARIO REGISTRADO",
      user: userStored,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "ERROR EN EL REGISTRO DE USUARIO",
    });
  }
}

// LOGUEAR USUARIO
const login = async (req, res) => {
  // ENCONTRAR PARAMETROS DEL BODY
  let params = req.body;

  if (!params.email || !params.password) {
    return res.status(400).send({
      status: "error",
      message: "FALTAN DATOS POR ENVIAR",
    });
  }
  // BUSCAR EN LA BD SI EXISTE
  try {
    const usersLogin = await User.findOne({ email: params.email });
    //.select({"password": 0});

    if (!usersLogin) {
      return res.status(404).send({
        status: "error",
        message: "EL USUARIO NO EXISTE",
      });
    }

    // COMPROBAR LA CONTRASEÑA
    const pwd = bcrypt.compareSync(params.password, usersLogin.password);

    if (!pwd) {
      return res.status(404).send({
        status: "error",
        message: "CONTRASEñA INCORRECTA",
      });
    }
    // CONSEGUIR TOKEN
    const token = jwt.createToken(usersLogin);

    // DEVOLVER DATOS DEL USUARIO
    // RESPUESTA AL LOGUEARSE
    return res.status(200).send({
      status: "success",
      message: "HAZ INICIADO SESION CON EXITO",
      usersLogin: {
        id: usersLogin._id,
        name: usersLogin.name,
        nick: usersLogin.nick,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "ERROR AL BUSCAR EL USUARIO",
    });
  }
}

const profile = async (req, res) => {
  try {
    // RECIBIR EL PARAMETRO DEL ID POR URL
    const id = req.params.id;

    // CONSULTA PARA SACAR LOS DATOS DEL USUARIO
    const userProfile = await User.findById(id).select({
      password: 0,
      role: 0,
    }); // SELECT PARA QUITAR OPCIONES A MOSTRAR

    // DEVOLVER EL RESULTADO
    return res.status(200).send({
      status: "success",
      message: "HAZ INICIADO SESION CON EXITO",
      userProfile,
    });
  } catch (error) {
    return res.status(404).send({
      status: "error",
      message: "ERROR EL USUARIO NO EXISTE O ESTA MAL ESCRITO",
    });
  }
}

const list = (req, res) => {
  try {
    // CONTROLAR LA PAGINACION

    // CONSULTAR CON MONGOOSE LA PAGINACION

    // DEVOLVER EL RESULTADO (POSTERIORMENTE INFO FOLLOW)

    return res.status(200).send({
      status: "success",
      message: "RUTA DE LISTADO DE USUARIOS"
    });

  } catch (error) {
     return res.status(404).send({
      status: "error",
      message: "ERROR PAGINA NO ENCONTRADA",
    });
  }
}
// EXPORTAR ACCIONES
module.exports = {
  pruebaUser,
  register,
  login,
  profile,
  list
}
