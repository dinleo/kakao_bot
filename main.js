import {config} from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';
import {resolve, t} from "@babel/core/lib/vendor/import-meta-resolve.js";

config()

const uri = process.env.MONGO_URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

export const handler = async (event) => {

    let json = {
        '타입': typeof event['body'],
        '바디': event['body']
    }

    const response = {
        statusCode: 200,
        body: json,
    };
    return response;
};

const readJSON = async (query) => {
    return client.connect().then(v => {
        const collection = client.db('sample_mflix').collection('comments');
        return collection.findOne(query).then(v => {
            client.close()
            return v
        }).catch(e =>{
            e = '에러\n' + e
            return e
        })
    })
}
