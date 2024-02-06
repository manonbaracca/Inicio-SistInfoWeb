const mysql=require('mysql');
const config =require('../config');

const dbconfig={
    host:config.mysql.host,
    user:config.mysql.user,
    password:config.mysql.password,
    database:config.mysql.database,
}

let conexion;
function conMysql() {
    // Solo crea una nueva conexión si no existe una o si se ha cerrado.
    if (!conexion || conexion.state === 'disconnected') {
      conexion = mysql.createConnection(dbconfig);
  
      conexion.connect(err => {
        if (err) {
          console.log('[db err]', err);
          setTimeout(conMysql, 2000); // Reintenta con un intervalo más largo para evitar intentos excesivos
        } else {
          console.log('DB conectada!!');
        }
      });
  
      conexion.on('error', err => {
        console.log('[db err]', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
          conMysql(); // Reconectar solo si se pierde la conexión.
        } else {
          throw err;
        }
      });
    }
  }
  
  function closeConnection() {
    return new Promise((resolve, reject) => {
      if (conexion) {
        conexion.end(err => {
          if (err) {
            console.error('[db close err]', err);
            reject(err);
          } else {
            console.log('DB conexión cerrada.');
            resolve();
          }
        });
        conexion = null; // Restablecer la variable de conexión
      } else {
        resolve(); // Resolver inmediatamente si no hay conexión para cerrar.
      }
    });
  }
  
function todos (tabla){
    return new Promise((resolve, reject)=>{
        conexion.query(`SELECT * FROM ${tabla}`, (error,result)=>{
            return error ? reject(error): resolve(result);
        })
    });

}
function uno(tabla, id){
    return new Promise((resolve, reject)=>{
        conexion.query(`SELECT * FROM ${tabla} WHERE id=${id}`, (error,result)=>{
            return error ? reject(error): resolve(result);
        });
    });
}
function agregar(tabla, data){
    return new Promise((resolve, reject)=>{
        conexion.query(`INSERT INTO ${tabla}  SET ? ON DUPLICATE KEY UPDATE ? `, [data,data], (error,result)=>{
            return error ? reject(error): resolve(result);
        })
    });
    }

function eliminar(tabla, data){
return new Promise((resolve, reject)=>{
    conexion.query(`DELETE FROM ${tabla} WHERE id=?`, data.id, (error,result)=>{
        return error ? reject(error): resolve(result);
    });
});
}
function query(tabla, consulta){
    return new Promise((resolve, reject)=>{
        conexion.query(`SELECT * FROM ${tabla} WHERE ?`, consulta, (error,result)=>{
            return error ? reject(error): resolve(result[0]);
        });
    });
    }
function deleteOTPByEmail(email) {
        return new Promise((resolve, reject) => {
            const deleteQuery = 'DELETE FROM OTPs WHERE email = ?';
            conexion.query(deleteQuery, [email], (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve();
            });
        });
}
function findOTPByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM OTPs WHERE email = ? LIMIT 1';
      conexion.query(query, [email], (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results.length > 0 ? results[0] : null);
      });
    });
  }
  function findUserByEmail(email) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM auth WHERE usuario = ? LIMIT 1';
        conexion.query(query, [email], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results.length > 0 ? results[0] : null);
        });
    });
}



module.exports = {
    todos,
    uno,
    agregar,
    eliminar,
    query,
    findOTPByEmail,
    deleteOTPByEmail,
    findUserByEmail,
    closeConnection,
    conMysql
};
