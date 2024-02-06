const jwt=require('jsonwebtoken');
const config=require('../config')
const error=require('../middleware/errors')
const bcrypt=require("bcrypt");

const secret=config.jwt.secret;

function asignarToken(data){
    return jwt.sign(data, secret);
}
function verificarToken(token){
    return jwt.verify(token, secret);
}
const chequearToken={
    confirmarToken:function(req,id){
        const decodificado= decodificarCabecera(req);
        if (decodificado.id!==id){
            throw error ('No tienes privilegios para esta modificación',401)
        }
    

    }
}
function obtenerToken(autorizacion){
    if(!autorizacion){
        throw error ('No viene token',401);
    }
    if (autorizacion.indexOf('Bearer')===-1){
        throw error ('Formato invalido',401)
    }
    let token =autorizacion.replace('Bearer ','')
    return token;
}
function decodificarCabecera(req){
    const autorizacion=req.headers.authorization ||'';
    const token= obtenerToken(autorizacion);
    const decodificado=verificarToken(token);

    req.user=decodificado;
    return decodificado;
}
const hashData=async(data,saltRounds=10)=>{
    try{
        const hashedData=await bcrypt.hash(data,saltRounds);
        return hashedData;
    }catch(error){
        throw error;
    }
};
const verificarHashedData=async(unhashed,hashed)=>{
    try{
        const match=await bcrypt.compare(unhashed,hashed);
        return match;
    }catch (error){
        throw error;
    }
}
module.exports={
    asignarToken,
    chequearToken,
    hashData,
    verificarHashedData
}