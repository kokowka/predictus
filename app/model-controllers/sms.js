const Logger = require('../framework-nodejs/core/Logger/Logger');

function smsModelControllerProvider(SMS, config) {
    return new SMSModelController(SMS, config);
}
smsModelControllerProvider.$inject = ['SMS', 'config'];

class SMSModelController {
    constructor(SMS, config) {
        this._SMS = SMS;
        this._log = new Logger('SMS Model-Controller', config.logger);
    }

    async create(data = {}) {

        const sms = await this._SMS.create(data);
        this._log.info(`SMS with id <${sms.get('id')}> was created`);

        return sms;
    }

    async find(data = {}) {
        return await this._SMS.findOne({
            where: data,
        });
    }
}

module.exports = smsModelControllerProvider;
