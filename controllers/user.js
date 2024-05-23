// IMPORTACION DE MODULOS Y DEPENDENCIAS
const User = require("../models/user");
const bcrypt = require("bcrypt");
const mongoosePagination = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");
// SERVICIOS
const jwt = require("../services/jwt");
const { error } = require("console");
const followService = require("../services/followService");

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

    // INFORMACION DE SEGUIMIENTO PARA SABER SI ME SIGUEN O SI SIGO A OTRA PERSONA
    const followInfo = await followService.followThisUser(req.user.id, id);

    // DEVOLVER EL RESULTADO
    return res.status(200).send({
      status: "success",
      message: "HAZ INICIADO SESION CON EXITO",
      userProfile,
      following: followInfo.following,
      followers: followInfo.followers
    });
  } catch (error) {
    return res.status(404).send({
      status: "error",
      message: "ERROR EL USUARIO NO EXISTE O ESTA MAL ESCRITO",
    });
  }
}

const list = async (req, res) => {
  try {
    // para pasar el parametro por url
    if (req.params.page) {
      page = parseInt(req.params.page); // para volverlo un entero
    }

    let itemsPerPage = 5;
    let skip = (page - 1) * itemsPerPage;

   // Consulta adicional para contar el número total de usuarios
    const totalUsers = await User.countDocuments();  

   // Consulta para filtrar los usuarios y limitarlos por paginas
    const usersList = await User.find().sort('_id').skip(skip).limit(itemsPerPage).exec();
    
    if (!totalUsers) {
      return res.status(404).send({
        status: "error",
        message: "NO HAY USUARIOS DISPONIBLES",
        error: error.message
      });
    }

    // INFORMACION DE SEGUIMIENTO PARA SABER SI ME SIGUEN O SI SIGO A OTRA PERSONA
    const followUsersIds = await followService.followUsersIds(req.user.id);

    // DEVOLVER LOS USUARIOS (TAMBIEN INFO DE SEGUIDORES)  
    return res.status(200).send({
      status: "success",
      message: "RUTA DE LISTADO DE USUARIOS",
      usersList,
      page,
      itemsPerPage,
      totalUsers,
      pages: Math.ceil(totalUsers/itemsPerPage),
      user_following: followUsersIds.following,
      user_follow_me: followUsersIds.followers
    });

  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "ERROR EN LA CONSULTA",
      error: error.message
    });
  }
}

const updateUser = async (req, res) =>{
  try {
    // RECOGER INFO DE USUARIO A ACTUALIZAR
    let userIdentity = req.user;
    let userToUpdate = req.body;
  
    // ELIMINAR CAMPOS SOBRANTES
    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.image;

    // COMPROBAR SI EL USUARIO EXISTE
    const users = await User.find({
      $or: [
        {
          email: userToUpdate.email.toLowerCase(),
          nick: userToUpdate.nick.toLowerCase(),
        },
      ],
    });

    let userIsset = false;
      users.forEach(user => {
        if (user && user._id != userIdentity.id) userIsset = true;
      }); 

    if (userIsset) {
      return res.status(200).send({
        status: "error",
        message: "EL USUARIO YA EXISTE",
      });
    }

    if (userToUpdate.password) {
      // CIFRAR LA CONTRASEñA
      let pwd = await bcrypt.hash(userToUpdate.password, 10);
      userToUpdate.password = pwd;
      
      // BUSCAR Y ACTULIZAR EL USUARIO
      const newUserUpdate = await User.findByIdAndUpdate({_id:userIdentity.id}, userToUpdate, {new:true});

      if (!userToUpdate) {
        return res.status(404).send({
          status: "error",
          message: "ERROR AL ACTUALIZAR XDDE",
          error: error.message
        });
      }

      // DEVOLVER RESPUESTA
      return res.status(200).send({
        status: "success",
        message: "METODO PARA ACTUALIZAR USUARIOS",
        user:newUserUpdate
      });
    }
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "ERROR AL ACTUALIZAR USUARIO",
      error: error.message
    });
  }
}


const upload = async (req, res) => {
  try {
    let userUpload = req.user;
    // CONSEGUIR EL NOMBRE DEL ARCHIVO
    let imagen = req.file.originalname;
    let imageName = req.file.filename;
     // SACAR LA EXTENCION DEL ARCHIVO
     const imageSplit = imagen.split("\.");
     const extesion = imageSplit[1];

    // RECOGER EL FICHERO DE IMAGEN Y COMPROBAR SI EXISTE
    if (!req.file) {
      // DEVOLVER RESPUESTA NEGATIVA
      return res.status(400).send({
        status: "error",
        message: "ERROR LA PETICION NO INCLUYE LA IMAGEN"
      });
    }
   
    // COMPROBAR EXTENSION
    if (!["png", "jpg", "jpeg", "gif", "webp"].includes(extesion.toLowerCase())) {
      // BORRAR EL ARCHIVO SUBIDO SI NO ES VALIDO   
      const filePath = req.file.filePath;
      const fileDeleted = fs.unlinkSync(filePath);
      // DEVOLVER RESPUESTA NEGATIVA
      return res.status(422).send({
        status: "error",
        message: "ERROR EXTENSION NO VALIDA!!"
      });
    }

    // ACTUALIZAR LA IMAGEN DEL USUARIO EN LA BASE DE DATOS
    let userUpdated = await User.findOneAndUpdate(
      { _id: req.user.id }, // Utilizamos un objeto para filtrar por el ID del usuario
      { image: imageName }, // Establecemos la nueva imagen del usuario
      { new: true } // Opción para devolver el documento actualizado
    );

    // Verificar si el usuario fue actualizado correctamente
    if (!userUpdated) {
      return res.status(500).send({
        status: "error",
        message: "ERROR AL ACTUALIZAR EL USUARIO EL CAMPO ESTA VACIO",
        userUpload,
        file: req.file
      });
    }

    // DEVOLVER RESPUESTA EXITOSA
    return res.status(200).send({
      status: "success",
      message: "SUBIDA DE IMAGEN EXITOSA",
      user: userUpdated,
      file: req.file
    });
  } catch (error) {
    // Devolver respuesta de error con el mensaje específico y el código de estado adecuado
    return res.status(400).send({
      status: "error",
      message: "ERROR AL ACTUALIZAR EL USUARIO",
    });
  }
}
const avatar = (req, res)=> {

  // SACAR EL PARAMETRO DE LA URL
  const file = req.params.file;
  // MONTAR LA RUTA DE LA IMAGEN
  const filePath = "./uploads/avatars/"+file;
  // COMPROBAR QUE EXISTE
  fs.stat(filePath, (error, exists)=>{
    if (!exists) {
      return res.status(404).send({
        status: "error",
        message: "ERROR LA IMAGEN NO EXISTE",
    });
    }
    
    // DEVOLVER RESPUESTA EXITOSA
    // DEVOLVER EL FILE
    return res.sendFile(path.resolve(filePath));
  });
}

// EXPORTAR ACCIONES
module.exports = {
  pruebaUser,
  register,
  login,
  profile,
  list,
  updateUser,
  upload,
  avatar
}
