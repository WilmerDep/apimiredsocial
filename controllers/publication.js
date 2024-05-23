// IMPORTACION DE MODELOS Y DEPENDENCIAS
const Publication = require("../models/publication");
const fs = require("fs");
const path = require("path");

// SERVICIOS
const followServices = require("../services/followService");

// ACCIONES DE PRUEBA
const pruebaPublication = (req, res) => {
  return res.status(200).send({
    message: "MENSAJE ENVIADO DESDE: controllers/publication.js",
  });
};

// GUARDAR PUBLICACION
const save = async (req, res) => {
  try {
    // CONSEGUIR DATOS POR EL BODY
    const params = req.body;
    // ACCION DE SEGUIR
    const identity = req.user;

    // CREAR OBJETO CON MODELO PUBLICATION
    let newPublication = new Publication(params);
    newPublication.user = identity.id;

    // GUARDAR PUBLICATION EN LA BD
    let publicationStored = await newPublication.save();

    if (!publicationStored) {
      return res.status(404).send({
        status: "error",
        message: "NO SE HA PODIDO GUARDAR LA PUBLICACION",
      });
    }

    return res.status(200).send({
      status: "success",
      message: "METODO DE GUARDAR PUBLICACIONES EXITOSO",
      publicationStored,
    });
  } catch (error) {
    return res.status(400).send({
      status: "error",
      message: "DEBES DE ENVIAR EL OBJETO DE LA PUBLICACION",
    });
  }
};
// SACAR UNA PUBLICACION
const detail = async (req, res) => {
  try {
    // SACAR ID DE LA PUBLICACION POR URL
    const publicacionID = req.params.id;

    // BUSCAR EL ID A MOSTRAR
    const findPublication = await Publication.findById(publicacionID);

    if (!findPublication) {
      return res.status(500).send({
        status: "error",
        message: "NO EXISTE LA PUBLICACION",
      });
    }

    return res.status(200).send({
      status: "success",
      message: "METODO DE MOSTRAR UNA PUBLICACION POR ID EXITOSO",
      publication: findPublication,
    });
  } catch (error) {
    return res.status(404).send({
      status: "error",
      message: "ERROR AL MOSTRAR LA PUBLICACION",
    });
  }
};
// ELIMINAR PUBLICACIONES
const remove = async (req, res) => {
  try {
    // RECOGER ID DEL USUARIO
    const userPublicationID = req.user.id;

    // RECOGER ID DE LA PUBLICACION A ELIMINAR
    const publicacionId = req.params.id;

    // BUSCAR LAS COINCIDENCIAS Y REMOVER EL ID PARA DESPUBLICAR CON REMOVE.
    const publicacionDeleted = await Publication.deleteMany({
      user: userPublicationID,
      _id: publicacionId,
    });

    // Verificar si se eliminaron las publicaciones correctamente
    if (!publicacionDeleted || publicacionDeleted.deletedCount === 0) {
      return res.status(500).send({
        status: "error",
        message: "ERROR NO SE ELIMINO LA PUBLICACION",
      });
    }

    return res.status(200).send({
      status: "success",
      message: "METODO DE REMOVER UNA PUBLICACION POR ID EXITOSO",
      publication: publicacionId,
    });
  } catch (error) {
    return res.status(404).send({
      status: "error",
      message: "ERROR AL ELIMINAR LA PUBLICACION",
    });
  }
};

// LISTAR PUBLICACIONES DE UN USUARIO
const user = async (req, res) => {
  try {
    // SACAR EL ID DEL USUARIO INDETIFICADO
    let userID = req.user.id;

    // COMPROBAR SI ME LLEGA EL ID POR PARAMENTRO URL
    if (req.params.id) userID = req.params.id;

    // COMPROBAR SI ME LLEGA LA PAGINA, SI NO LA PAGINA 1 POR DEFECTO
    let page = 1;
    if (req.params.page) page = req.params.page;

    // USUARIO POR PAGINA A MOSTRAR
    let itemsPerPage = 5;
    let skip = (page - 1) * itemsPerPage;

    // Consulta adicional para contar el número total de usuarios que estoy siguiendo
    const totalUsersPublication = await Publication.countDocuments();

    // BUSCAR A QUIEN SIGUES, POPULAR DATOS DE LOS USUARIO Y PAGINAR CON MOONGOOSE PAGINATE
    const publicationPopulation = await Publication.find({ user: userID })
      //MUESTRA LOS USUARIOS Y LO QUE ESTA SIGUIENDO Y OPMITIR ALGUNOS CAMPOS DEL POPULATE
      .sort("-created_at")
      .populate("user", "-password -role -__v")
      .skip(skip)
      .limit(itemsPerPage)
      .exec();

    if (publicationPopulation.length <= 0) {
      return res.status(400).send({
        status: "error",
        message: "NO HAY PUBLICACIONES PARA MOSTRAR",
      });
    }
    return res.status(200).send({
      status: "success",
      message: "LISTA DE MIS PUBLICACIONES",
      page,
      pages: Math.ceil(totalUsersPublication / itemsPerPage),
      totalUsersPublication,
      publicationPopulation,
    });
  } catch (error) {
    return res.status(404).send({
      status: "error",
      message: "ERROR AL MOSTRAR LA LISTA DE PUBLICACIONES",
    });
  }
};

// SUBIR ARCHIVOS MULTIMEDIA PARA PUBLICAR
const upload = async (req, res) => {
  try {
    // RECOGER ID DE LA PUBLICACION
    const publicationId = req.params.id;

    let publicationUpload = req.user;
    // CONSEGUIR EL NOMBRE DEL ARCHIVO
    let imagen = req.file.originalname;
    let imageName = req.file.filename;
    // SACAR LA EXTENCION DEL ARCHIVO
    const imageSplit = imagen.split(".");
    const extesion = imageSplit[1];

    // RECOGER EL FICHERO DE IMAGEN Y COMPROBAR SI EXISTE
    if (!req.file) {
      // DEVOLVER RESPUESTA NEGATIVA
      return res.status(400).send({
        status: "error",
        message: "ERROR LA PETICION NO INCLUYE LA IMAGEN",
      });
    }

    // COMPROBAR EXTENSION
    if (
      !["png", "jpg", "jpeg", "gif", "webp"].includes(extesion.toLowerCase())
    ) {
      // BORRAR EL ARCHIVO SUBIDO SI NO ES VALIDO
      const filePath = req.file.filePath;
      const fileDeleted = fs.unlinkSync(filePath);
      // DEVOLVER RESPUESTA NEGATIVA
      return res.status(422).send({
        status: "error",
        message: "ERROR EXTENSION NO VALIDA!!",
      });
    }

    // ACTUALIZAR LA IMAGEN DE LA PUBILCACION DEL USUARIO QUE ESTA IDENTIFICADO.
    let publicationUpdated = await Publication.findOneAndUpdate(
      { user: req.user.id, _id: publicationId }, // Utilizamos un objeto para filtrar por el ID del usuario
      { file: imageName }, // Establecemos la nueva imagen del usuario
      { new: true } // Opción para devolver el documento actualizado
    );

    // Verificar si la publicacion fue actualizada correctamente
    if (!publicationUpdated) {
      return res.status(500).send({
        status: "error",
        message: "ERROR AL SUBIR EL ARCHIVO EL CAMPO ESTA VACIO",
        publicationUpload,
        file: req.file,
      });
    }

    // DEVOLVER RESPUESTA EXITOSA
    return res.status(200).send({
      status: "success",
      message: "SUBIDA DE IMAGEN EXITOSA",
      publication: publicationUpdated,
      file: req.file,
    });
  } catch (error) {
    // Devolver respuesta de error con el mensaje específico y el código de estado adecuado
    return res.status(404).send({
      status: "error",
      message: "ERROR AL ACTUALIZAR LA PUBLICACION",
    });
  }
};

// DEVOLVER ARCHIVOS MULTIMEDIA DE PUBLICACION
const showMedia = (req, res) => {
  // SACAR EL PARAMETRO DE LA URL
  const file = req.params.file;

  // MONTAR LA RUTA DE LA IMAGEN
  const filePath = "./uploads/publications/" + file;

  // COMPROBAR QUE EXISTE
  fs.stat(filePath, (error, exists) => {
    if (!exists) {
      return res.status(404).send({
        status: "error",
        message: "ERROR LA IMAGEN NO EXISTE",
      });
    }

    // DEVOLVER RESPUESTA EXITOSA
    return res.sendFile(path.resolve(filePath)); // DEVOLVER EL FILE
  });
};
// LISTAR TODAS LAS PUBLICACIONES (FEED)
const feed = async (req, res) => {
  try {
    // SACAR EL ID DEL USUARIO INDETIFICADO
    let userID = req.user.id;

    // COMPROBAR SI ME LLEGA EL ID POR PARAMENTRO URL
    if (req.params.id) userID = req.params.id;

    // COMPROBAR SI ME LLEGA LA PAGINA, SI NO LA PAGINA 1 POR DEFECTO
    let page = 1;
    if (req.params.page) page = req.params.page;

    // USUARIO POR PAGINA A MOSTRAR
    let itemsPerPage = 5;
    let skip = (page - 1) * itemsPerPage;

    // Consulta adicional para contar el número total de usuarios que estoy siguiendo
    const totalUsersPublication = await Publication.countDocuments();

    // INFORMACION DE SEGUIMIENTO PARA SABER SI ME SIGUEN O SI SIGO A OTRA PERSONA
    const myFollows = await followServices.followUsersIds(req.user.id);

    // BUSCAR A QUIEN SIGO, PARA MOSTRAR LOS DATOS DEL FEED
    const publications = await Publication.find({
      user: { $in: myFollows.following },
    });
    return res.status(200).send({
      status: "success",
      message: "METODO DE FEED PARA PUBLICACION EXITOSO",
      following: myFollows.following,
      publications,
    });
  } catch (error) {
    return res.status(404).send({
      status: "error",
      message: "ERROR AL MOSTRAR EL FEED",
    });
  }
};
/*---------------------------------------*/
// EXPORTAR ACCIONES
module.exports = {
  pruebaPublication,
  save,
  detail,
  remove,
  user,
  upload,
  showMedia,
  feed,
};
