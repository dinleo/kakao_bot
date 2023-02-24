import {config} from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';

config()

const mongoUri = process.env.MONGO_URI
const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

export const handler = async (event) => {
    let query = JSON.parse(event['body'])
    let json = await readJSON(query)


    const response = {
        statusCode: 200,
        body: json,
    };
    return response;
};

const readJSON = async (query) => {
    return client.connect().then(v => {
        const collection = client.db('test').collection('test');
        return collection.findOne(query).then(v => {
            client.close()
            return v
        }).catch(e =>{
            e = '에러\n' + e
            return e
        })
    })
}
