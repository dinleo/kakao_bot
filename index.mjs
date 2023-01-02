import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config()

const ACCESS_POINT_ARN = process.env.ACCESS_POINT_ARN
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY

AWS.config.update({region: 'ap-northeast-2'});
AWS.config.update({
    credentials: new AWS.Credentials(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
});

const s3 = new AWS.S3({ params: { AccessPointArn: ACCESS_POINT_ARN } });


// const readJSON = () => {
//     let json;
//     s3.getObject({
//         Bucket: 'kakaobot',
//         Key: 'JSON/dict/words.json'
//     }, function(err, data) {
//         if (err) {
//             console.error(err);
//         } else {
//             json = JSON.parse(data.Body.toString())
//         }
//     });
//
//     return json
// }

console.log('good!!!!!')



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

export const handler = async(event) => {
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('d'),
    };
    return response;
};