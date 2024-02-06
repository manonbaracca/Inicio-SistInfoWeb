const express = require ('express');
const morgan=require('morgan'); 
const config = require ('./config');

const estudiantes = require ('./modulos/estudiantes/rutas.js')
const usuarios = require ('./modulos/usuarios/rutas.js')
const auth = require ('./modulos/auth/rutas.js')
const otp=require('./autho/otp/rutas.js')
const EmailVerificationRoutes=require('./autho/email_verification/rutas.js')
const error=require('./red/errors.js')
const app = express();
const cors = require('cors');
app.use(cors());


//config
app.set('port', config.app.port)
app.use(express.json());
app.use(express.urlencoded({extended:true}));
//rutas
app.use('/api/estudiantes', estudiantes )
app.use('/api/usuarios', usuarios )
app.use('/api/auth', auth )
app.use('/api/otp', otp);
app.use('/api/email_verification',EmailVerificationRoutes )
//Middleware
app.use(morgan('dev'));
app.delete('/delete-expired-otps', (req, res) => {
    const deleteQuery = 'DELETE FROM OTPs WHERE expiresAt < NOW()';
    
    connection.query(deleteQuery, (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      res.json({ message: 'Expired OTPs deleted', affectedRows: results.affectedRows });
    });
  });
app.use(error);
module.exports = app;