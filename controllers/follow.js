// IMPORTAR MODELO DE SEGUIDARES
const Follow = require("../models/follow");
const User = require("../models/user");

// IMPORTAR DEPENDENCIAS
const mongoosePagination = require("mongoose-pagination");

// IMPORTAR SERVICIOS
const followService = require("../services/followService");
// ACCIONES DE PRUEBA
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        status: "success",
        message: "MENSAJE ENVIADO DESDE: controllers/follow.js"
    });

   
}
const save = async (req, res) =>{
    try {
        // CONSEGUIR DATOS POR EL BODY
        const params = req.body;
        // ACCION DE SEGUIR
        const identity = req.user;
    
        // CREAR OBJETO CON MODELO FOLLOW
        let userToFollow = new Follow({
           user : identity.id,
           followed : params.followed
        });
        
        // GUARDAR USUARIO EN LA BD
        let followStored = await userToFollow.save();

        if (!followStored) {
            return res.status(500).send({
              status: "error",
              message: "NO SE HA PODIDO SEGUIR EL USUARIO",
            });
        }
        // USUARIOS QUE ME SIGUEN
        return res.status(200).send({
            status: "success",
            message: "USUARIO SEGUIDOR",
            identity: req.user,
            follow: followStored
        });
        
    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "ERROR AL SEGUIR USUARIO",
        });  
    }
}
// ACCION DE DEJAR DE SEGUIR
const unFollow = async (req, res)=>{
    try {
        // RECOGER EL ID DEL USUARIO 
          const userID = req.user.id;
    
        // RECOGER EL ID DEL USUARIO SEGUIDO PARA DEJAR DE SEGUIR
        const followedId = req.params.id;
    
        // BUSCAR LAS COINCIDENCIAS Y REMOVER EL ID PARA DEJAR DE SEGUIR CON REMOVE.
        const followDeleted = await Follow.deleteMany({
        "user": userID,
        "followed": followedId
    });

    // Verificar si se eliminaron los usurios correctamente
    if (!followDeleted || followDeleted.deletedCount === 0) {
        return res.status(500).send({
            status: "error",
            message: "NO DEJASTE DE SEGUIR AL USUARIO",
        });
    }
        return res.status(200).send({
            status: "success",
            message: "DEJASTE DE SEGUIR A ESTE USUARIO CORRECTAMENTE",
        });
            
    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "ERROR AL DEJAR DE SEGUIR"
        });  
    }

}
// USUARIOS QUE SE ESTA (SIGUIENDO)
const following = async (req, res)=> {
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
        const totalUsersFollowing = await Follow.countDocuments();  

        // BUSCAR A QUIEN SIGUES, POPULAR DATOS DE LOS USUARIO Y PAGINAR CON MOONGOOSE PAGINATE
        const followPopulation = await Follow.find({user: userID})
        //MUESTRA LOS USUARIOS Y LO QUE ESTA SIGUIENDO Y OPMITIR ALGUNOS CAMPOS DEL POPULATE
        .populate("user followed", "-password -role -__v")
        .skip(skip).limit(itemsPerPage).exec(); 

        if (!totalUsersFollowing) {
            return res.status(404).send({
              status: "error",
              message: "NO ESTAS SIGUIENDO A NINGUN USUARIOS",
              error: error.message
            });
          }
        // LISTADO DE SEGUIDORES EN COMUN
        const followUsersIds = await followService.followUsersIds(req.user.id);
        // MOSTRAR UN ARRAY DE IDS CON EL LISTADO DE SEGUIDORES SEGUN QUIEN ESTE RESGISTRADO
        
        return res.status(200).send({
            status: "success",
            message: "LISTA DE USUARIOS QUE ESTOY SIGUIENDO",
            followPopulation,
            totalUsersFollowing,
            pages: Math.ceil(totalUsersFollowing/itemsPerPage),
            user_following: followUsersIds.following,
            user_follow_me: followUsersIds.followers
        }); 
        
    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "ERROR DE SIGUIENDO"
        });  
    }
}
// USUARIOS QUE ME SIGUEN O A CUALER OTRO (MIS SIGUIDORES)
const followers = async (req, res)=> {
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
        const totalUsersFollowing = await Follow.countDocuments();  

       // BUSCAR A QUIEN SIGUES, POPULAR DATOS DE LOS USUARIO Y PAGINAR CON MOONGOOSE PAGINATE
        const followPopulation = await Follow.find({followed: userID})
        //MUESTRA LOS USUARIOS Y LO QUE ESTA SIGUIENDO Y OPMITIR ALGUNOS CAMPOS DEL POPULATE
        .populate("user", "-password -role -__v")
        .skip(skip).limit(itemsPerPage).exec(); 

        if (!totalUsersFollowing) {
            return res.status(404).send({
              status: "error",
              message: "NO ESTAS SIGUIENDO A NINGUN USUARIOS",
              error: error.message
            });
          }
       
        const followUsersIds = await followService.followUsersIds(req.user.id);
               
        return res.status(200).send({
            status: "success",
            message: "LISTA DE USUARIOS QUE ME SIGUEN",
            followPopulation,
            totalUsersFollowing,
            pages: Math.ceil(totalUsersFollowing/itemsPerPage),
            user_following: followUsersIds.following,
            user_follow_me: followUsersIds.followers
        }); 

    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "ERROR DE SIGUIDORES"
        });  
    }
}
// EXPORTAR ACCIONES
module.exports ={
    pruebaFollow,
    save,
    unFollow,
    following,
    followers
}