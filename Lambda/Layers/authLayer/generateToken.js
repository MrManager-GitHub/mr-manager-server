const jwt = require('jsonwebtoken');
const secrets = require('./secrets');

const generateToken = (user_id, first_name, last_name, user_email, subscription) => {
    const token = jwt.sign(
        {
            user_id: user_id,
            first_name: first_name,
            last_name: last_name,
            user_email: user_email,
            subscription: subscription
        },
        secrets.secret_key,
        {
            expiresIn: '1d'
        });

    return token;
}

module.exports = generateToken;
