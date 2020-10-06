/*
  This function uses 
  - authLayer to generate token after user registers his/her account.
  - nodeModulesLayer to get all the necessary packages
*/

const AWS = require('aws-sdk');
const bcrypt = require('bcrypt');   // Used to convert normal password into hash form
const { v4: uuidv4 } = require('uuid'); // To generate user_id

const generateToken = require('/opt/generateToken');
const getTodayDate = require('./todayDate');

const docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

exports.handler = (event, context, callback) => {

  console.log(event);

  try {

    // Check if entered email exist or not
    const getItemParams = {
      TableName: 'users',
      Key: {
        user_email: event.user_email
      }
    };
    docClient.get(getItemParams, (getItemError, getItemData) => {

      if (getItemError) {

        callback('Internal Error', null);

      } else if (getItemData.Item !== undefined) {

        // User with given email already exist
        callback('Something went wrong', null);

      } else {

        // Generate hash form of password
        bcrypt.hash(event.user_password, 10, (bcryptError, hashedPassword) => {
          if (bcryptError) {
            callback({ error: bcryptError }, null);
          } else {

            let item = {
              user_id: uuidv4(),
              user_email: event.user_email,
              first_name: event.first_name,
              last_name: event.last_name,
              subscription_plan: 'free',
              user_password: hashedPassword,
              user_since: getTodayDate()
            };
            if (event.user_phone_number) {
              item.user_phone_number = event.user_phone_number;
            }
            if (event.user_address) {
              item.user_address = {
                country: event.user_address.country,
                state: event.user_address.state,
                city: event.user_address.city,
                area: event.user_address.a,
                house_flat_number: event.user_address.house_flat_number,
                PIN: event.user_address.PIN
              };
            }
            if (event.user_dob) {
              item.user_dob = event.user_dob;
            }
            if (event.company_name) {
              item.company_name = event.company_name;
            }
            if (event.company_turnover) {
              item.company_turnover = event.company_turnover;
            }

            const params = {
              Item: item,
              TableName: 'users'
            };

            docClient.put(params, (err, data) => {
              if (err) {
                callback({ error: err }, null);
              } else {
                callback(
                  null,
                  {
                    token: generateToken(
                      params.Item.user_id,
                      params.Item.first_name,
                      params.Item.last_name,
                      params.Item.user_email,
                      params.Item.subscription
                    )
                  }
                );
              }
            });

          }
        });
      }

    });

  } catch (err) {
    callback({ error: 'User not created' }, null);
  }

};
