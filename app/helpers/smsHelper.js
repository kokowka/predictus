const SMS = require('../defaultConfig').sms;

module.exports = {
    generateSmsCode,
};

function generateSmsCode() {
    let smsCode = '';

    for (let i = 0; i < SMS.SMS_LENGTH; i++) {
        smsCode += Math.floor(Math.random() * 10);
    }

    return smsCode;
}
