const { Router } = require('express')
const express = require('express')
const { authController } = require('../../controllers/authController')
const {verifyTokenHandler} =require('../../utils/middlewares/verifyTokenHandler')
const routerAuth = new Router()

routerAuth.use(express.json())
routerAuth.use(express.urlencoded({ extended: true }))


routerAuth.post('/api/auth/login', authController.login)
routerAuth.post('/api/auth/register', authController.register)
routerAuth.get('/api/auth/validate-account',verifyTokenHandler, authController.validateAcc)
routerAuth.post('/api/auth/change-password/:idUser',verifyTokenHandler, authController.changePassword)
routerAuth.post('/api/auth/request-password', authController.requestPassword)
routerAuth.post('/api/auth/password-recovery',verifyTokenHandler, authController.passwordRecovery)
module.exports = { routerAuth }