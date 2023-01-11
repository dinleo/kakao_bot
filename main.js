import AWS from 'aws-sdk';
import {config} from 'dotenv';

config()

const AWS_S3_ACCESS_POINT_ARN = process.env.AWS_S3_ACCESS_POINT_ARN
const AWS_S3_ACCESS_ID = process.env.AWS_S3_ACCESS_ID
const AWS_S3_ACCESS_SECRET = process.env.AWS_S3_ACCESS_SECRET

AWS.config.update({region: 'ap-northeast-2'});
AWS.config.update({
    credentials: new AWS.Credentials(AWS_S3_ACCESS_ID, AWS_S3_ACCESS_SECRET)
});

const s3 = new AWS.S3({params: {AccessPointArn: AWS_S3_ACCESS_POINT_ARN}});

export const handler = async (event) => {
    let json = await readJSON()

    // json['a'] = event['a']
    let json2 = {
        'a' : 123
    }
    console.log('타입:' + typeof json2)
    const response = {
        statusCode: 200,
        body: json,
    };
    return response;
};

const readJSON = () => {
    return new Promise((resolve, reject) => {
        s3.getObject({
            Bucket: 'kakaobot',
            Key: 'JSON/room/shortcut.json'
        }, function (err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(JSON.parse(data.Body.toString()))
            }
        });
    })
}

// s3.putObject({
//     Bucket: 'kakaobot',
//     Key: 'JSON/dict/words.json',
//     Body: JSON.stringify(a)
// }, function(err) {
//     if (err) {
//         console.error(err);
//     } else {
//         console.log('Successfully wrote file to S3 bucket');
//     }
// });