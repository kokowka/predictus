const Logger = require('../framework-nodejs/core/Logger/Logger');

function loanFinePaymentModelControllerProvider(LoanFinePayment, config) {
    return new LoanFinePaymentModelController(LoanFinePayment, config);
}

loanFinePaymentModelControllerProvider.$inject = ['LoanFinePayment', 'config'];

class LoanFinePaymentModelController {
    constructor(LoanFinePayment, config) {
        this._log = new Logger('Loan Installment Payment Model-Controller', config.logger);
        this._LoanFinePayment = LoanFinePayment;
    }

    async create(data = {}) {

        const loanFinePayment = await this._LoanInstallmentPayment.create(data);
        this._log.info(`Loan Fine Payment with id <${loanFinePayment.get('id')}> was created`);

        return loanFinePayment;
    }

    async find(data = {}) {
        return await this._LoanFinePayment.findOne({
            where: data,
        });
    }
}

module.exports = loanFinePaymentModelControllerProvider;
