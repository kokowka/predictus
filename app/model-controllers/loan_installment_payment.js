const Logger = require('../framework-nodejs/core/Logger/Logger');

function loanInstallmentPaymentModelControllerProvider(LoanInstallmentPayment, config) {
    return new LoanInstallmentPaymentModelController(LoanInstallmentPayment, config);
}

loanInstallmentPaymentModelControllerProvider.$inject = ['LoanInstallmentPayment', 'config'];

class LoanInstallmentPaymentModelController {
    constructor(LoanInstallmentPayment, config) {
        this._log = new Logger('Loan Installment Payment Model-Controller', config.logger);
        this._LoanInstallmentPayment = LoanInstallmentPayment;
    }

    async create(data = {}) {

        const loanInstallmentPayment = await this._LoanInstallmentPayment.create(data);
        this._log.info(`Loan Installment Payment with id <${loanInstallmentPayment.get('id')}> was created`);

        return loanInstallmentPayment;
    }

    async find(data = {}) {
        return await this._LoanInstallmentPayment.findOne({
            where: data,
        });
    }
}

module.exports = loanInstallmentPaymentModelControllerProvider;
