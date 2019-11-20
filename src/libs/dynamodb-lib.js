import config from '../config/config';
import AWS from 'aws-sdk';

export function call(action, params) {
  const dynamoDb = new AWS.DynamoDB.DocumentClient({ ...config.AWS.dynamoDb });

  return dynamoDb[action](params).promise();
}