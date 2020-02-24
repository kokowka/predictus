const Logger = require('../framework-nodejs/core/Logger/Logger');

function loanPaymentModelControllerProvider(LoanPayment, config) {
    return new LoanPaymentModelController(LoanPayment, config);
}

loanPaymentModelControllerProvider.$inject = ['LoanPayment', 'config'];

class LoanPaymentModelController {
    constructor(LoanPayment, config) {
        this._log = new Logger('Loan Payment Model-Controller', config.logger);
        this._LoanPayment = LoanPayment;
    }

    async create(data = {}) {

        const loanPayment = await this._LoanPayment.create(data);
        this._log.info(`Loan Payment with id <${loanPayment.get('id')}> was created`);

        return loanPayment;
    }

    async find(data = {}) {
        return await this._LoanPayment.findOne({
            where: data,
        });
    }
}

module.exports = loanPaymentModelControllerProvider;
