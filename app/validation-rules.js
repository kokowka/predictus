const {Rule, RuleContainer} = require('./framework-nodejs/core/Validator');

function validationRulesProvider() {
    return new ValidationRules();
}

validationRulesProvider.$inject = [];

class ValidationRules {
    constructor() {

        this.Auth = {};
        this.Auth.sendSms = new RuleContainer()
            .withRequired('phone_number', Rule.isString());
        this.Auth.singPhone = new RuleContainer()
            .withRequired('phone_number', Rule.isString())
            .withRequired('code', Rule.isString());
        this.Auth.refreshToken = new RuleContainer()
            .withRequired('refresh_token', Rule.isString())
            .withRequired('session_token', Rule.isString());

        this.User = {};
        this.User.setUserInfo = new RuleContainer()
            .withRequired('first_name', Rule.isString())
            .withRequired('last_name', Rule.isString())
            .withRequired('gender', Rule.isString())
            .withRequired('country', Rule.isString())
            .withRequired('birth_date', Rule.isNumber());
        this.User.addContacts = new RuleContainer()
            .withRequired('contacts', Rule.isArray());
        this.User.addSms = new RuleContainer()
            .withRequired('sms', Rule.isArray());

    }
}

module.exports = validationRulesProvider;
