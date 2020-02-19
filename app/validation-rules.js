const {Rule, RuleContainer} = require('../../framework-nodejs/core/Validator');

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

    }
}

module.exports = validationRulesProvider;
