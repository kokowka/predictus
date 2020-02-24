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
            .withRequired('country_id', Rule.isNumber())
            .withRequired('birth_date', Rule.isNumber());
        this.User.getUserInfo = new RuleContainer()
            .withRequired('user_id', Rule.isNumber());
        this.User.addContacts = new RuleContainer()
            .withRequired('contacts', Rule.isArray());
        this.User.addSms = new RuleContainer()
            .withRequired('sms', Rule.isArray());
        this.User.addInstalledApplications = new RuleContainer()
            .withRequired('apps', Rule.isArray());
        this.User.updateLocation = new RuleContainer()
            .withRequired('lat', Rule.isNumber())
            .withRequired('lng', Rule.isNumber())
            .withRequired('alt', Rule.isNumber());

        this.Loan = {};
        this.Loan.createLoan = new RuleContainer()
            .withRequired('amount', Rule.isNumber())
            .withRequired('loan_settings_id', Rule.isNumber());
        this.Loan.getLoanSettings = new RuleContainer()
            .withRequired('loan_settings_id', Rule.isNumber());
        this.Loan.getUserLoan = new RuleContainer()
            .withRequired('loan_id', Rule.isNumber());

    }
}

module.exports = validationRulesProvider;
