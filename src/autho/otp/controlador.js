const { success } = require('../../red/respuestas.js');

const nodemailer=require('nodemailer');
const{AUTH_EMAIL}=process.env;
const{AUTH_PASS}=process.env;
const db = require('../../DB/mysql.js')
const {hashData, verificarHashedData}=require('../index.js')
const { deleteOTPByEmail, findOTPByEmail } = require('../../DB/mysql.js')


const verifyOTP= async (email, otp)=>{
    try{
        if (!(email&&otp)){
            throw Error ("No hay valores para el email o otp");
        }
    //me aseguro que hay un otp para un usuario en particular
    const matchedOTPRecord = await findOTPByEmail(email);
        
    if (!matchedOTPRecord) {
        // Handle case where no OTP record is found for the email
        throw Error("No se encontró ningún registro de OTP para este correo electrónico");
    }
    const {expiresAt}=matchedOTPRecord;
    //verifico que no haya expirado
    if (new Date(expiresAt) < new Date()) {
        await deleteOTPByEmail(email);
        throw Error("Codigo expirado, solicite otro")

    }
    //verificar el valor
    const hashedOTP=matchedOTPRecord.otp;
    const userInputOTP = otp.toString(); 
    const validOTP= await verificarHashedData (userInputOTP,hashedOTP);
    return validOTP;
    }catch (error){
        throw error;
    }
};


const generateOTP=async()=>{
    try{
        return (otp=`${Math.floor(1000+Math.random()*9000)}`);

     }catch (error){
        throw error;
     }
};
const sendOTP=async ({email,subject,message,duration=1})=>{
    try{
       if(!(email&&subject&&message)){
        throw error('Faltan datos',300);
       }
       //generar pin
       const generatedOTP=await generateOTP();
       //enviar email
       const mailOptions={
        from:AUTH_EMAIL,
        to:email,
        subject,
        html:`<p>${message}</p><p style="color:tomato;
        font-size:25px;letter-spacing:2px;"><b>${generatedOTP}</b></p><p>This code <b>expires in ${duration} hour(s)</b>.</p>`,
        };
        await sendEmail(mailOptions); 
        //GUARDAR otp
        const hashedOTP=await hashData(generatedOTP);
                // Calculate expiration time
                const expiresAt = new Date(new Date().getTime() + duration * 60 * 60 * 1000);
                // Insert the OTP into the database
                const newOTP = {
                    email: email,
                    otp: hashedOTP,
                    createdAt: new Date(),
                    expiresAt: expiresAt
                };
                const result = await db.agregar('OTPs', newOTP);
                console.log('OTP saved:', result);
        
                return result;
    }catch (error){
        throw error;
    }
};

let transporter=nodemailer.createTransport({
    host:"smtp-mail.outlook.com",
    auth:{
        user:AUTH_EMAIL,
        pass:AUTH_PASS,
    },

});

//probar transporter
transporter.verify((error,success)=>{
    if(error){
        console.log(error);  

    }else{
        console.log('listo para mensajes');
        console.log(success);
    }    
});


const sendEmail=async(mailOptions)=>{
    try{
        await transporter.sendMail(mailOptions);
        return;
    }catch(error){
        throw error;
    }
}

module.exports={sendOTP, verifyOTP};
