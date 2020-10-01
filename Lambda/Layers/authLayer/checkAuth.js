const jwt = require('jsonwebtoken');
const secrets = require('./secrets');

const checkAuth = token => {
    try {
        const decoded = jwt.verify(token, secrets.secret_key);
        return decoded;
    } catch (err) {
        return false;
    }
}

module.exports = checkAuth;
