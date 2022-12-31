const AWS = require('aws-sdk');

// Set the region where the bucket is located
AWS.config.update({region: 'ap-northeast-2'});

// Create an S3 client object
const s3 = new AWS.S3();

// Set the bucket and key of the object you want to read/write
const bucket = 'kakaobot';
const key = 'JSON/dict/dict.json';
let dict

// Read the object from the bucket
s3.getObject({Bucket: bucket, Key: key}, (err, data) => {
    if (err) {
        console.error(err);
    } else {
        dict = data.Body.toString()
    }
});

// Write a new object to the bucket
// const content = 'Hello, World!';
// s3.putObject({Bucket: bucket, Key: key, Body: content}, (err, data) => {
//     if (err) {
//         console.error(err);
//     } else {
//         console.log('Successfully wrote object to bucket');
//     }
// });

export const handler = async(event) => {
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify(dict),
    };
    return response;
};


console.log("hello")