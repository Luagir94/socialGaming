const MongoLib = require(`../../db/index`);
const jwt = require("jsonwebtoken");
const mongo = new MongoLib();
const bcrypt = require("bcrypt");
const { validateUser, validatePassword } = require("../../utils/schemas/auth");
const { emailSenderHandler } = require("../../utils/middlewares/emailSenderHandler");
const dotenv = require('dotenv').config()
const cloudinary = require('../../utils/middlewares/cloudinaryUpload')
const gamesController = {
    addGame: async (req, res, next) => {
        try {
            const { name } = req.body;
            const { path } = req.file
            console.log(name, path);
            const uploader = async (x, y) => await cloudinary.uploadImage(x, y)
            const newFile = await uploader(path, 'games')
            const gameSchema = {
                name,
                photoUrl : newFile.url,
                users: []
            };
            const newUser = await mongo.create("games", gameSchema);
             res.status(201).send(`El juego ${name} ha sido agregado con exito.`)   
        } catch (error) {
            res.status(400).send('Ha ocurrido un error.')
        }
  


    }


};
module.exports = { gamesController };
