/*
  This function uses
  - authLayer to verify token and get user_id from decoded token.
  - nodeModulesLayer to get all the necessary packages
*/

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid'); // To generate supplier_id

const checkAuth = require('/opt/checkAuth');

const docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

exports.handler = (event, context, callback) => {
  const decodedToken = checkAuth(event.token);
  if (decodedToken === false) {
    callback({ error: 'Something went wrong' }, null);
  } else {
    try {

      const item = {
        supplier_id: uuidv4(),
        user_id: decodedToken.user_id,
        supplier_name: event.supplier_name,
        supplier_email: event.supplier_email,
        phone_number: parseInt(event.phone_number, 10),
        product: event.product
      };

      const params = {
        Item: item,
        TableName: 'suppliers'
      };

      docClient.put(params, (err, data) => {
        if (err) {
          callback('Please enter values properly', null);
        } else {
          callback(null, 'Supplier created successfully');
        }
      });

    } catch (err) {
      callback('Supplier not created', null);
    }

  }
};
