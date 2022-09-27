const MongoLib = require(`../../db/index`)
const { validateTournament } = require('../../utils/schemas/tournaments')
const { idGenerator } = require('../../utils/middlewares/generateIdsHandler')
const mongo = new MongoLib()
const bcrypt = require('bcrypt');
const cloudinary = require('../../utils/middlewares/cloudinaryUpload')
const jwt = require("jsonwebtoken");
const { x } = require('joi');
const tournamentController = {
    getPublicTournaments: async (req, res, next) => {

        const tournaments = await mongo.getAll('tournaments', [
            { $match: { privacy: false } },
            { $project: { tournamentName: 1 , participantsNumber: 1} }
        ])
        !tournaments ? res.status(404).send('Los torneos no fueron encontrados') : res.send(tournaments)
    },
    getByInvitation: async (req, res, next) => {
        const { invitationCode } = req.body
        const tournament = await mongo.getById('tournaments', [
            { $match: { invitationCode } },
            { $project: { tournamentName: 1 , participantsNumber: 1} }
        ])
        !tournament ? res.status(404).send('El torneo no fue encontrado o el codigo es invalido') : res.send(tournament)
    },
    newTournament: async (req, res, next) => {
        const token = req.headers.authorization.split(' ')[1]
        const { tournamentName, privacy } = req.body
        const uploader = async (x, y) => await cloudinary.uploadImage(x, y)
        const { path } = req.file

        const { error, value } = validateTournament(tournamentName)
        const isVerified = jwt.verify(token, process.env.CLIENT_SECRET, async (err, decoded) => {
            const { userName, _id } = decoded.data
            try {
                if (!error) {
                    const photo = req.file ? await uploader(path, 'tournaments_pics') : ''
                    const newT = {
                        tournamentName,
                        privacy : JSON.parse(privacy),
                        participants: [{userName, _id, score : 0}],
                        invitationCode: idGenerator(),
                        owner: userName,
                        photo : photo.url,
                        participantsNumber: 1
                    }
                    const newTournament = await mongo.create('tournaments', newT)
                    const getUser = await mongo.getById('users', [
                        { $match: { _id } },
                    ])
                    const updateUser = await mongo.update('users', { _id }, { tournaments : [...getUser.tournaments, {tournamentName: tournamentName, tournamentId: newTournament.insertedId} ] })
                    res.status(200).send('Torneo creado satisfactoriamente.');
                } else {
                    const mensaje = error.details[0].message;
                    res.status(400).send(mensaje);
                }
            } catch (error) {
                res.status(400).send('Ha ocurrido un error con esta solicitud, intentar nuevamente')
            }

        })



    },
    joinTournament: async (req, res, next) => {
        const { tournamentId } = req.body
        const token = req.headers.authorization.split(' ')[1]
        const isVerified = jwt.verify(token, process.env.CLIENT_SECRET, async (err, decoded) => {
            const { userName, _id } = decoded.data
            try {
                const tournament = await mongo.getById('tournaments', [
                    { $match: { _id: tournamentId } },
                ])
                const isSuscribed = tournament.participants.find(x => x._id === _id)
                if (isSuscribed) {
                    res.status(400).send('Ya participas de este torneo.')
                } else {
                    const userWhoJoin = await mongo.getById('users', [
                        { $match: { _id} },
                    ])
                    if (tournament.owner !== userName) {
                        const newParticipant = {
                            userName,
                            _id,
                            score: 0,
                        }
                        const updateParticipants = [...tournament.participants, newParticipant]
                        const updateUserT =[...userWhoJoin.tournaments, {tournamentName: tournament.tournamentName, tournamentId: tournament._id}]
                        const updateTournament = await mongo.update('tournaments', { _id: tournamentId }, { participants: updateParticipants, participantsNumber :updateParticipants.length })
                        const updateUser = await mongo.update('users', { _id }, { tournaments : updateUserT })
                        res.status(200).send('Has ingresado al torneo satisfactoriamente.');
                    }
                }
              
            } catch (error) {
                res.status(400).send('Ha ocurrido un error con esta solicitud, intentar nuevamente')
            }

        })
    },
    unsuscribeTournament : async (req,res,next)=>{
        const { tournamentId } = req.body
        const token = req.headers.authorization.split(' ')[1]
        const isVerified = jwt.verify(token, process.env.CLIENT_SECRET, async (err, decoded) => {
            const { userName, _id } = decoded.data
            try {
                const tournament = await mongo.getById('tournaments', [
                    { $match: { _id: tournamentId } },
                ])
                const userWhoLeaves = await mongo.getById('users', [
                    { $match: { _id} },
                ])
                    const updateParticipants = tournament.participants.filter(x => x._id !== _id)
                    const updateUserT =userWhoLeaves.tournaments.filter(x => x.tournamentId !== tournamentId)
                    const updateTournament = await mongo.update('tournaments', { _id: tournamentId }, { participants: updateParticipants, participantsNumber :updateParticipants.length })
                    const updateUser = await mongo.update('users', { _id }, { tournaments : updateUserT })
                    res.status(200).send('Has abandonado el torneo satisfactoriamente.');
                
            } catch (error) {
                res.status(400).send('Ha ocurrido un error con esta solicitud, intentar nuevamente')
            }

        })
    },
    banFromTournament : async (req,res,next) =>{
        const { tournamentId, idToDelete } = req.body
        const token = req.headers.authorization.split(' ')[1]
        const isVerified = jwt.verify(token, process.env.CLIENT_SECRET, async (err, decoded) => {
            const { userName, _id } = decoded.data
            try {
                const tournament = await mongo.getById('tournaments', [
                    { $match: { _id: tournamentId } },
                ])
                const userWhoLeaves = await mongo.getById('users', [
                    { $match: { _id : idToDelete} },
                ])
                if (tournament.owner === userName) {
                    const updateParticipants = tournament.participants.filter(x => x._id !== _id)
                    const updateUserT =userWhoLeaves.tournaments.filter(x => x.tournamentId !== tournamentId)
                    const updateTournament = await mongo.update('tournaments', { _id: tournamentId }, { participants: updateParticipants, participantsNumber :updateParticipants.length })
                    const updateUser = await mongo.update('users', { _id: idToDelete}, { tournaments : updateUserT })
                    res.status(200).send('Has abandonado el torneo satisfactoriamente.'); 
                } else{
                    res.status(400).send('Persona no autorizada para eliminar gente del torneo.')
                }
                   
                
            } catch (error) {
                res.status(400).send('Ha ocurrido un error con esta solicitud, intentar nuevamente')
            }

        }) 
    },
    deleteTournament: async (req, res, next) =>{
        const { tournamentId } = req.body
        const token = req.headers.authorization.split(' ')[1]
        const isVerified = jwt.verify(token, process.env.CLIENT_SECRET, async (err, decoded) => {
            const { userName, _id } = decoded.data
            try {
                const tournament = await mongo.getById('tournaments', [{ $match: { _id: tournamentId } }])
                
                if (tournament.owner === userName) {
                    for (const x of tournament.participants) {
                        const unsuscriber = await mongo.getById('users', [
                            { $match: { _id : x._id} },
                            { $project: { _id: 1, tournaments: 1} }
                        ])
                        
                        const updateUserT =unsuscriber.tournaments.filter(y => y.tournamentId !== tournamentId)
                        const updateUser = await mongo.update('users', { _id: x._id  }, { tournaments : updateUserT })
                    }
                    setTimeout(() => {
                        const tournament =  mongo.delete('tournaments', tournamentId)
                    }, 1);
                    
                    res.status(200).send('Torneo eliminado satisfactoriamente.'); 
                } else{
                    res.status(400).send('Persona no autorizada para eliminar el torneo.')
                }
                   
                
            } catch (error) {
                res.status(400).send('Ha ocurrido un error con esta solicitud, intentar nuevamente')
            }

        }) 
    }

}


module.exports = { tournamentController }