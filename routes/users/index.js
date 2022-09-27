const { Router } = require('express')
const express = require('express')
const { userController } = require('../../controllers/userController')
const {verifyTokenHandler} =require('../../utils/middlewares/verifyTokenHandler')
const multer  = require('multer')
const upload = multer({ dest: 'uploads/', fieldSize : 6000000 })
const routerUser = new Router()

routerUser.use(express.json())
routerUser.use(express.urlencoded({ extended: true }))

routerUser.get('/api/user',verifyTokenHandler,userController.getUser)
routerUser.get('/api/user/search-user',verifyTokenHandler,userController.searchUser)
routerUser.post('/api/user/add-friend',verifyTokenHandler ,userController.addFriend)
routerUser.post('/api/user/accept-friend',verifyTokenHandler,userController.acceptFriend)
routerUser.post('/api/user/reject-friend',verifyTokenHandler,userController.rejectRequest)
routerUser.post('/api/user/upload-photo',verifyTokenHandler,upload.single('file'),userController.uploadPhoto)
routerUser.post('/api/user/delete-photo',verifyTokenHandler,userController.deletePhoto)
// routerUser.delete('/api/user/:idUser',verifyTokenHandler, userController.deleteUser)

module.exports = { routerUser }