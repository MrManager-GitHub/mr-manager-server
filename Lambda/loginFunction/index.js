/*
  This function uses
  - authLayer to generate token after user authentication.
  - nodeModulesLayer to get all the necessary packages
*/

const AWS = require('aws-sdk');
const bcrypt = require('bcrypt');

const generateToken = require('/opt/generateToken');

const docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

exports.handler = (event, context, callback) => {

	console.log(event);

	try {

		const getItemParams = {
			TableName: 'users',
			Key: {
				user_email: event.email
			}
		};
		docClient.get(getItemParams, (getItemError, getItemData) => {

			if (getItemError) {
				callback('Internal Error', null);
			} else if (getItemData.Item !== undefined) {

				// Email exist, match password
				bcrypt.compare(event.password, getItemData.Item.user_password, (error, result) => {
					if (result === true) {
						callback(null, {
							token: generateToken(
								getItemData.Item.user_id,
								getItemData.Item.first_name,
								getItemData.Item.last_name,
								getItemData.Item.user_email,
								getItemData.Item.subscription_plan
							)
						});
					} else {
						callback('Incorrect username or password', null);
					}
				});

			}

		});

	} catch (err) {
		callback({ error: 'Something went wrong' }, null);
	}
};
