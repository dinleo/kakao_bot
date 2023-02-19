import {config} from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';
import {resolve} from "@babel/core/lib/vendor/import-meta-resolve.js";

config()

const uri = process.env.MONGO_URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

export const handler = async (event) => {
    // let json = await readJSON(event)
    // if (json == null){
    //     let q = {
    //         'name':'밈미'
    //     }
    //     json = await readJSON(q)
    // }
    let json = {}
    json['타입'] = typeof event
    json['전체'] = event
    for (let i in event){
        json['웅' +i] = event[i]
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
