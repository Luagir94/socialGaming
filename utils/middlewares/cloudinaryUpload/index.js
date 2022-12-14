const dotenv = require('dotenv').config()
const cloudinary  =require('cloudinary')
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  const uploadImage = (file,folder) => {
    return new Promise(resolve =>{
        cloudinary.uploader.upload(file, (result)=>{
            resolve({
                url :result.url,
                id: result.public_id

            })
        },{
            resource_type : 'auto',
            folder: folder
        }
        )
    })
  }

module.exports = { uploadImage }