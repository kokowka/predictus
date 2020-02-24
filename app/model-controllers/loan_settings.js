function loanSettingsModelControllerProvider(LoanSettings) {
    return new LoanSettingsModelController(LoanSettings);
}

loanSettingsModelControllerProvider.$inject = ['LoanSettings'];

class LoanSettingsModelController {
    constructor(LoanSettings) {
        this._LoanSettings = LoanSettings;
    }

    async find(data = {}) {
        return await this._LoanSettings.findOne({
            where: data,
        });
    }
}

module.exports = loanSettingsModelControllerProvider;
