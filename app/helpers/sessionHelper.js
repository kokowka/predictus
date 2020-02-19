const {TOKEN_LENGTH} = require('../constants/session');
const randomString = require('random-string');

function getToken(user_id) {
    return `${user_id}-${randomString({length: TOKEN_LENGTH})}`;
}

module.exports = {
    getToken,
};
