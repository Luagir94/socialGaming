const { Router } = require('express')
const express = require('express')
const { tournamentController } = require('../../controllers/tournamentController')
const {verifyTokenHandler} =require('../../utils/middlewares/verifyTokenHandler')
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const routerTournaments = new Router()

routerTournaments.use(express.json())
routerTournaments.use(express.urlencoded({ extended: true }))

routerTournaments.post('/api/tournaments/add-tournament',verifyTokenHandler,upload.single('file'),tournamentController.newTournament)
routerTournaments.get('/api/tournaments/all-tournaments',verifyTokenHandler,tournamentController.getPublicTournaments)
routerTournaments.get('/api/tournaments/invitation-tournament',verifyTokenHandler,tournamentController.getByInvitation)
routerTournaments.put('/api/tournaments/join-tournament',verifyTokenHandler,tournamentController.joinTournament)
routerTournaments.put('/api/tournaments/leave-tournament',verifyTokenHandler,tournamentController.unsuscribeTournament)
routerTournaments.put('/api/tournaments/delete-from-tournament',verifyTokenHandler,tournamentController.banFromTournament)
routerTournaments.delete('/api/tournaments/delete-tournament',verifyTokenHandler,tournamentController.deleteTournament)
module.exports = { routerTournaments }