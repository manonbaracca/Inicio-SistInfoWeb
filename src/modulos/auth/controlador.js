
const TABLA ='auth';
const bcrypt=require('bcrypt');
const auth=require('../../autho');
const {findUserByEmail}=require('../../DB/mysql')
module.exports=function(dbInyectada){

    let db=dbInyectada;
    if(!db){
        db=require ('../../DB/mysql');
    }

    async function login(usuario, password) {
        try {
            const user = await findUserByEmail(usuario);
            if (user) {
                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    // Generar y devolver el token
                    return auth.asignarToken({ id: user.id, usuario: user.usuario });
                } else {
                    throw new Error('Contraseña incorrecta');
                }
            } else {
                throw new Error('Usuario no registrado');
            }
        } catch (error) {
            // Manejar errores aquí
            throw error;
        }
    }
    
    async function agregar (data){
        console.log(data)
        const authData={
            id:data.id,
        }
        if (data.usuario){
            authData.usuario=data.usuario
        }
        if (data.password){
            authData.password=await bcrypt.hash(data.password.toString(),5);
        }
        return db.agregar(TABLA, authData);
    }

    return{

        agregar,
        login,

    };
}

  