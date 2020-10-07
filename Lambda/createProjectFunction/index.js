/*
  This function uses
  - authLayer to generate token after user authentication.
  - nodeModulesLayer to get all the necessary packages
*/

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid'); // To generate project_id

const checkAuth = require('/opt/checkAuth');

const docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

exports.handler = (event, context, callback) => {
  const decodedToken = checkAuth(event.token);
  if (decodedToken === false) {
    callback({ error: 'Something went wrong' }, null);
  } else {
    try {

      const item = {
        project_id: uuidv4(),
        user_id: decodedToken.user_id,
        project_name: event.project_name,
        address: event.address,
        city: event.city,
        project_valuation: parseInt(event.project_valuation, 10),
        area: parseInt(event.area, 10),
        workers: 0,
        start_date: event.start_date,
        end_date: event.end_date
      };
      if (event.house) item.house = 0;
      if (event.plot) item.plot = 0;
      if (event.shop) item.shop = 0;
      if (event.flat) item.flat = 0;

      const params = {
        Item: item,
        TableName: 'projects'
      };
      docClient.put(params, (err, data) => {
        if (err) {
          callback('Please enter values properly', null);
        } else {
          callback(null, 'Project created successfully');
        }
      });

    } catch (err) {
      callback('Project not created', null);
    }

  }
};
