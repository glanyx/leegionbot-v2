import config from '../config/config';
import AWS from 'aws-sdk';

/**
 * 
 * @param {string} action 
 * @param {Object} params 
 */
export function call(action, params) {
  const dynamoDb = new AWS.DynamoDB.DocumentClient({ ...config.AWS.dynamoDb });

  return dynamoDb[action](params).promise();
}
