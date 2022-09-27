const dotenv = require('dotenv').config()
const nodemailer = require ("nodemailer")
const CLIENT_ID = process.env.GMAIL_CLIENT_ID
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET
const REDIRECT_URI =process.env.GMAIL_REDIRECT_URI 
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN
const {google} = require('googleapis');
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID,CLIENT_SECRET,REDIRECT_URI)
oAuth2Client.setCredentials({refresh_token:REFRESH_TOKEN})
        const sendMail = async (email, msg)=>{
    try {
   const accessToken = await oAuth2Client.getAccessToken()
   const transport = nodemailer.createTransport({
     service : 'gmail',
     auth:{
       type:'OAuth2',
       user: 'prodex.app@gmail.com',
       clientId : CLIENT_ID,
       clientSecret: CLIENT_SECRET,
       refreshToken:REFRESH_TOKEN,
       accessToken: accessToken
     }
   })


  const responseToSender ={
    from:'Prodex <prodex.app@gmail.com>',
    to:email,
    ...msg
  }

  const respuesta = await transport.sendMail(responseToSender)
 
 } catch (error) {
   console.log(error);
 }
}





const emailSenderHandler = async (email, mail) =>{
try {
    await sendMail(email, mail)
    
} catch (error) {
    
}


       
}

module.exports = { emailSenderHandler }