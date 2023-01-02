import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config()

const AWS_S3_ACCESS_POINT_ARN = process.env.AWS_S3_ACCESS_POINT_ARN
const AWS_S3_ACCESS_ID = process.env.AWS_S3_ACCESS_ID
const AWS_S3_ACCESS_SECRET = process.env.AWS_S3_ACCESS_SECRET

AWS.config.update({region: 'ap-northeast-2'});
AWS.config.update({
    credentials: new AWS.Credentials(AWS_S3_ACCESS_ID, AWS_S3_ACCESS_SECRET)
});

const s3 = new AWS.S3({params: {AccessPointArn: AWS_S3_ACCESS_POINT_ARN}});

export const handler = async (event) => {
    // TODO implement
    let json = await readJSON('JSON/room/shortcut.json')
    const response = {
        statusCode: 200,
        body: JSON.stringify(json),
    };
    return response;
};

const readJSON = (key) => {
    return new Promise((resolve, reject) => {
        s3.getObject({
            Bucket: 'kakaobot',
            Key: key
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

