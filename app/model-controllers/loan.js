const Logger = require('../framework-nodejs/core/Logger/Logger');

function loanModelControllerProvider(Loan, config) {
    return new LoanModelController(Loan, config);
}

loanModelControllerProvider.$inject = ['Loan', 'config'];

class LoanModelController {
    constructor(Loan, config) {
        this._log = new Logger('Loan Model-Controller', config.logger);
        this._Loan = Loan;
    }

    async create(data = {}) {

        const loan = await this._Loan.create(data);
        this._log.info(`Loan with id <${loan.get('id')}> was created`);

        return loan;
    }

    async find(data = {}) {
        return await this._Loan.findOne({
            where: data,
        });
    }
}

module.exports = loanModelControllerProvider;
