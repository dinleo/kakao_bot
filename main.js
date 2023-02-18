import AWS from 'aws-sdk';
import {config} from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';

config()

const uri = process.env.MONGO_URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

AWS.config.update({region: 'ap-northeast-2'});

export const handler = async (event) => {
    let json = await readJSON(event)
    const response = {
        statusCode: 200,
        body: json,
    };
    return response;
};

const readJSON = async (query) => {
    const collection = client.db('sample_mflix').collection('comments');
    let json = collection.findOne(query).then(v => {
        client.close()
        return v
    }).catch(e =>{
        e = '에러\n' + e
        return e
    })

    return json
}
