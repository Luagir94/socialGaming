require('dotenv').config()
const cloudinary  =require('cloudinary')
const config = {
    port: 8080,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbHost: process.env.DB_HOST,
    dbName: process.env.DB_NAME,
}
