const MongoLib = require(`../../db/index`)
const { validateUser, validateUserMod } = require('../../utils/schemas/auth')
const jwt = require("jsonwebtoken");
const { uploadImage } = require('../../utils/middlewares/cloudinaryUpload')
const mongo = new MongoLib()
const bcrypt = require('bcrypt');
const cloudinary = require('../../utils/middlewares/cloudinaryUpload')

const uploadImageController = {
    uploadImage: async (req, res, next) => {
        try {
            const uploader = async (x,y)=> await cloudinary.uploadImage(x, y)
        const { folder } = req.body
        const {path} = req.file

        const newPath = await uploader(path,folder)
        console.log(newPath);
        } catch (error) {
            
        }
        
    }
}

module.exports = { uploadImageController }