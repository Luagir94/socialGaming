const { query } = require('express');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const { config } = require('../config')
const USER = encodeURIComponent(config.dbUser)
const PASSWORD = encodeURIComponent(config.dbPassword)
const DBHOST = encodeURIComponent(config.dbHost)
const DB_NAME = config.dbName
const MONGO_URI = `mongodb+srv://${USER}:${PASSWORD}@${DBHOST}/${DB_NAME}?retryWrites=true&w=majority`
const { v4: uuidv4 } = require('uuid');
class MongoLib {
    constructor() {
        this.client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
        this.dbName = DB_NAME
    }
    connect = () => {
        if (!MongoLib.connection) {
            MongoLib.connection = new Promise((resolve, reject) => {
                this.client.connect(err => {
                    if (err) return reject(err);
                    console.log('Connected to Mongo');
                    resolve(this.client.db(this.dbName))
                })

            })
        }
        return MongoLib.connection
    }
    getAll = (collection, query) => {
        return this.connect().then(async db => {
            const coll = await db.collection(collection)
            const cursor = await coll.aggregate(query)
            return await cursor.toArray();
        })
    }
    getById = (collection, query) => {
        return this.connect().then(async db => {
            const coll = await db.collection(collection)
            const cursor = coll.aggregate(query)
            const result= await cursor.toArray();
            return result[0]
        })
    }
    create = (collection, data) => {
        return this.connect().then(async db => {
            const isUserCreated = collection === 'users' ? await db.collection(collection).findOne({ email: data.email }) : false
            if (!isUserCreated) {
                return db.collection(collection).insertOne({ _id: uuidv4(), ...data })
            }
        }).then(result => result )


    }
    update = (collection, id, data) => {
        return this.connect().then(db => {
            return db.collection(collection).updateOne(id, { $set: data }, { upsert: true })
        })
            .then(result => result.upsertedId || id)
    }
    delete = (collection, id) => {
        return this.connect().then(db => {
            return db.collection(collection).deleteOne({ _id : id})
        }).then(() => console.log('Registro eliminado con exito.'))
    }
}

module.exports = MongoLib