import config from '../config/config';
import AWS from 'aws-sdk';

export async function getFile(filename) {
  const s3 = new AWS.S3({ ...config.AWS.dynamoDb });
  const params = {
    Bucket: config.AWS.s3.BUCKET,
    Key: filename
  }

  let url = null;
  url = await s3.getSignedUrlPromise('getObject', params)
    .then(result => {
      return result;
    })
    .catch(e => console.log(e));

  return url;
}