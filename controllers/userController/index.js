const MongoLib = require(`../../db/index`)
const { validateUser, validateUserMod } = require('../../utils/schemas/auth')
const jwt = require("jsonwebtoken");
const mongo = new MongoLib()
const bcrypt = require('bcrypt');
const cloudinary = require('../../utils/middlewares/cloudinaryUpload')

const userController = {
    getUser: async (req, res, next) => {
        const token = req.headers.authorization.split(' ')[1]
        try {
            jwt.verify(token, process.env.CLIENT_SECRET, (err, decoded) => {
                if (decoded.data) {
                    res.status(200).send(decoded.data)
                } else {
                    res.status(404).send('Usuario no encontrado.')
                }
            });
        } catch (error) {
            res.status(404).send('Usuario no encontrado.')
        }
    },
    searchUser: async (req, res, next) => {
        const { userName } = req.body
        try {
            const data = await mongo.getById("users", [
                { $match: { userName } },
                { $project: { auth: 0, email: 0 , friendRequest : 0 , isLogged : 0} }
            ]);
            // const filterFriends = 
            data.friends = data.friends.length
            if (data) {
                res.status(200).send(data)
            } else {
                res.status(404).send('Usuario no encontrado.')
            }
        } catch (error) {
            console.log(error);
        }



    },
    addFriend: async (req, res, next) => {
        const requestedID = req.body._id
        const token = req.headers.authorization.split(' ')[1]
        const data = await mongo.getById("users", [
            { $match: { _id: requestedID } },
            { $project: { friendRequest: 1 } }
        ]);
        const isVerified = jwt.verify(token, process.env.CLIENT_SECRET, async (err, decoded) => {
            const { name, lastName, userName, _id } = decoded.data
            const newFR = {
                name,
                lastName,
                userName,
                _id
            }
            const alreadySent = await data?.friendRequest?.find(x => x._id === _id)
            if (alreadySent) {
                res.status(400).send('Ya se ha enviado una solicitud a este usuario.')
            } else {
                await mongo.update("users", { _id: requestedID }, { 'friendRequest': [...data.friendRequest, newFR] })
                res.status(201).send('Solicitud enviada con exito.')
            }
        })



    },
    acceptFriend: async (req, res, next) => {
        const requestedID = req.body._id
        console.log(requestedID);
        const token = req.headers.authorization.split(' ')[1]
        const isVerified = jwt.verify(token, process.env.CLIENT_SECRET, async (err, decoded) => {
            const { _id, name, lastName, userName} = decoded.data
            try {
                const whoAccept = await mongo.getById("users", [
                    { $match: { _id } },
                    { $project: { friendRequest: 1, friends: 1 } }
                ]);
                const requester = await mongo.getById("users", [
                    { $match: { _id: requestedID } },
                    { $project: { friends: 1 } }
                ]);
          
                const newFriend = whoAccept.friendRequest.find(x => x._id === requestedID)
                const filteredFriendRequest = whoAccept.friendRequest.filter(x => x._id !== requestedID)
                await mongo.update("users", { _id }, { 'friendRequest': filteredFriendRequest , friends: [...whoAccept.friends, newFriend]})
                const newFR = {
                    name,
                    lastName,
                    userName,
                    _id
                }
          
                await mongo.update("users", { _id: requestedID}, {friends: [...requester.friends, newFR]})
                res.status(200).send('Usuario agregado a lista de amigos.')
            } catch (error) {
                res.status(400).send('Ha ocurrido un error con esta solicitud, intentar nuevamente')
            }
    
        })



    },
    rejectRequest: async (req,res,next)=>{
        const requestedID = req.body._id
        const token = req.headers.authorization.split(' ')[1]
        const isVerified = jwt.verify(token, process.env.CLIENT_SECRET, async (err, decoded) => {
            const { _id, name, lastName, userName} = decoded.data
            try {
                const whoReject = await mongo.getById("users", [
                    { $match: { _id } },
                    { $project: { friendRequest: 1, friends: 1 } }
                ]);
                console.log(requester);
                const filteredFriendRequest = whoReject.friendRequest.filter(x => x._id !== requestedID)
                await mongo.update("users", { _id }, { 'friendRequest': filteredFriendRequest})
                res.status(200).send('Solicitud rechazada con exito.')
            } catch (error) {
                res.status(400).send('Ha ocurrido un error con esta solicitud, intentar nuevamente')
            }
        
        })

    },
    uploadPhoto: (req, res, next) => {
        const token = req.headers.authorization.split(' ')[1]
        const isVerified = jwt.verify(token, process.env.CLIENT_SECRET, async (err, decoded) => {
            const { _id, name, lastName, userName} = decoded.data
            try {
                const uploader = async (x,y)=> await cloudinary.uploadImage(x, y)
                const {path} = req.file
                const newFile = await uploader(path,'profile_pics')
                console.log(path);
                await mongo.update("users", { _id }, { 'photo': newFile.url})
                res.status(200).send('Foto actualizada correctamente.')
            } catch (error) {
                res.status(400).send('Ha ocurrido un error con esta solicitud, intentar nuevamente')
            }
    
        })
    },
    deletePhoto: (req, res, next) => {
        const token = req.headers.authorization.split(' ')[1]
        const isVerified = jwt.verify(token, process.env.CLIENT_SECRET, async (err, decoded) => {
            const { _id, name, lastName, userName} = decoded.data
            try {
                await mongo.update("users", { _id }, { 'photo':null})
                res.status(200).send('Foto actualizada correctamente.')
            } catch (error) {
                res.status(400).send('Ha ocurrido un error con esta solicitud, intentar nuevamente')
            }
    
        })
    }
    ,
    deleteUser: (req, res, next) => {
        const id = req.params.idProd
        const eliminado = mongo.delete('users', id)
        !eliminado ? res.status(404).send('El producto no fue encontrado') : res.send(`Producto Eliminado`)
    }
}

module.exports = { userController }