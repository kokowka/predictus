const express = require('express');

function loanRouterProvider(LoanController) {
    return new LoanRouter(LoanController);
}

loanRouterProvider.$inject = ['LoanController'];

class LoanRouter {

    constructor(LoanController){
        this._LoanController = LoanController;
    }

    initRouter() {
        const router = express.Router();

        router.post(
            '/createLoan',
            this._LoanController.createLoan,
        );
        router.post(
            '/getLoanSettings',
            this._LoanController.getLoanSetting,
        );
        router.post(
            '/payLoan',
            this._LoanController.payLoan,
        );
        router.post(
            '/getUserLoans',
            this._LoanController.getUserLoans,
        );
        router.post(
            '/getUserLoan',
            this._LoanController.getUserLoan,
        );

        return router;
    }

}

module.exports = loanRouterProvider;
