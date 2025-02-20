/*
  This function uses
  - authLayer to verify token and get user_id from decoded token.
*/

const AWS = require('aws-sdk');

const checkAuth = require('/opt/checkAuth');

const docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

exports.handler = (event, context, callback) => {
  const decodedToken = checkAuth(event.token);
  if (decodedToken === false) {
    callback({ error: 'Something went wrong' }, null);
  } else {
    try {

      const getSuppliersParams = {
        TableName: 'suppliers',
        KeyConditionExpression: "user_id = :uid",
        ExpressionAttributeValues: {
          ":uid": decodedToken.user_id
        }
      };
      docClient.query(getSuppliersParams, (err, data) => {
        if (err) {
          callback('Couldn\'t fetch suppliers', null);
        } else {
          callback(null, data);
        }
      });

    } catch (err) {
      callback('Suppliers not fetched', null);
    }

  }
};
