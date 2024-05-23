// IMPORTAR MODELO 
const Follow = require("../models/follow");

const followUsersIds = async (identityUserId) =>{
    try {
        //MUESTRA LOS USUARIOS QUE ESTOY SIGUIENDO Y OPMITIR ALGUNOS CAMPOS
        let following = await Follow.find({"user": identityUserId})
        .select({"followed":1, "_id":0}).exec();
    
        //MUESTRA LOS USUARIOS QUE ME SIGUIEN Y OPMITIR ALGUNOS CAMPOS
        let followers = await Follow.find({"followed": identityUserId})
        .select({"user":1, "_id":0}).exec();

        // PROCESAR ARRAY DE INDEFICADORES
        let followingClean = [];
        let followersClean = [];

        following.forEach(follow => {
            followingClean.push(follow.followed);
        });


        followers.forEach(follow => {
            followersClean.push(follow.user);
        });
        return {
            following:followingClean,
            followers: followersClean
        }
        
    } catch (error) {
        return ({  message: "ERROR EN EL MODELO DE followUsersIds" }); 
    }
}

const followThisUser = async (identityUserId, profileUserId) =>{
    try {
        //MUESTRA LOS USUARIOS QUE ESTOY SIGUIENDO Y OPMITIR ALGUNOS CAMPOS
        let following = await Follow.findOne({"user": identityUserId, "followed":profileUserId });
    
        //MUESTRA LOS USUARIOS QUE ME SIGUIEN Y OPMITIR ALGUNOS CAMPOS
        let followers = await Follow.findOne({"user": profileUserId, "followed": identityUserId});

        return {
            following,
            followers
        }

    } catch (error) {
        return ({  message: "ERROR EN EL MODELO DE followThisUser" }); 
    }
}

module.exports = {
    followUsersIds,
    followThisUser
}