const User =require ('../../modulos/usuarios');
const { findUserByEmail, deleteOTPByEmail } = require('../../DB/mysql')
const {sendOTP,verifyOTP}=require('../otp/controlador')

const verifyUserEmail=async ({email,otp})=>{
    try{
        const validOTP=await verifyOTP(email,otp);
        if (!validOTP){
            throw Error ("Codigo invalido- revisa tu inbox");
        }
        await deleteOTPByEmail(email);
        return;
    }catch (error){
        throw error;
    }
};
const sendVerificationOTPEmail =async (email)=>{
    try{
        //chequeamos si existe usuario con ese email
        const existingUser = await findUserByEmail(email);
        if (!existingUser){
            throw Error ("No hay cuenta para el mail seleccionado");

        }
        const otpDetails={
            email,
            subject:"Email Verification",
            message:"Verify your email with the code below",
            duration:1,
        };
        const createdOTP= await sendOTP(otpDetails);
        return createdOTP;

    }catch (error){
        throw error;
    }
};

module.exports={sendVerificationOTPEmail, verifyUserEmail};