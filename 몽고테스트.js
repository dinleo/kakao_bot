import {config} from 'dotenv';
import {MongoClient, ServerApiVersion} from 'mongodb';
import {readFileSync} from 'fs'

config()

const mongoUri = process.env.MONGO_URI
const client = new MongoClient(mongoUri, {useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1});
const print = (s) => {
    console.log(s)
}

const buf = readFileSync('C:\\Users\\dinle\\Code\\Bot\\kakao_bot\\todo.json')
const str = buf.toString()
let todoFile = JSON.parse(str)

const main = async () => {
    let dbName = 'sender'
    let collectionName = 'todo'
    let room = 'Leo'
    let sender = 'Leo'
    let val = {
        'todo': ["3","1"]
    }
    //return modifyValidation(dbName, collectionName)
    return updateDB(dbName, collectionName, room, sender, val)
}

const modifyValidation = async (dbName, collectionName) => {
    await client.connect()
    let db = client.db(dbName)
    let newValidation = {
        $jsonSchema: {
            bsonType: "object",
            title: "todo Object Validation",
            required: ["room", "sender", "todo"],
            properties: {
                room: {
                    bsonType: "string",
                },
                sender: {
                    bsonType: "string",
                },
                todo: {
                    bsonType: "array",
                    items: {
                        bsonType: ["string"]
                    }
                }
            }
        }
    }

    return db.command({
        collMod: collectionName,
        validator: newValidation
    }).then(v=>{
        return v
    });
}

const createCollection = async () => {
    await client.connect()
    const dbName = 'test'
    const collectionName = 'todo'
    let test = client.db(dbName)
    let validation = {
        $jsonSchema: {
            bsonType: "object",
            title: "todo Object Validation",
            required: ["room", "sender", "todo"],
            properties: {
                room: {
                    bsonType: "string",
                },
                sender: {
                    bsonType: "string",
                },
                todo: {
                    bsonType: "array",
                    items: {
                        bsonType: "string"
                    }
                }
            }
        }
    }
    return test.createCollection(collectionName, {
        validator: validation
    }).then(v => {
        return v
    })
}

const updateDB = async (dbName, collectionName, room, sender, updateValue) => {
    await client.connect()
    updateValue['room'] = room
    updateValue['sender'] = sender
    return client
        .db(dbName)
        .collection(collectionName)
        .updateOne({'room': room, 'sender': sender}, {'$set': updateValue}, {'upsert': true})
}

main().then(v => {
    print(v)
}).catch(e => {
    print(e)
}).finally(() => {
    client.close()
})

