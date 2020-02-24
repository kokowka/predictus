const { NotFoundError } = require('../framework-nodejs/core/rest.errors');
const response = require('../helpers/response');

function loanControllerProvider(LoanMC, LoanSettingsMC, Validator) {
    return new LoanController(LoanMC, LoanSettingsMC, Validator);
}

loanControllerProvider.$inject = ['LoanMC', 'LoanSettingsMC', 'Validator'];

class LoanController {
    /**
     * @description Loan REST Controller constructor
     *
     * @param {LoanMC} LoanMC Loan Model-Controller
     * @param {LoanSettingsMC} LoanSettingsMC Loan Settings Model-Controller
     * @param {Validator} Validator Validator instance
     *
     * @author Nazar Z.
     */
    constructor(LoanMC, LoanSettingsMC, Validator) {
        this._CONTROLLER_NAME = 'Loan';

        this._LoanMC = LoanMC;
        this._LoanSettingsMC = LoanSettingsMC;
        this._Validator = Validator;
    }


    get createLoan() {
        return this._createLoan.bind(this);
    }

    get getLoanSetting() {
        return this._getLoanSetting.bind(this);
    }

    get payLoan() {
        return this._payLoan.bind(this);
    }

    get getUserLoans() {
        return this._getUserLoans.bind(this);
    }

    get getUserLoan() {
        return this._getUserLoan.bind(this);
    }

    /**
     * @description Method for POST /loan/createLoan endpoint.
     *
     * @param {String} body.data.amount Loan amount
     * @param {Number} body.data.loan_settings_id Loan id
     *
     * @throws {VALIDATION_ERROR} 400 if client provided unvalid request params
     * @returns {200<OK>} { status: Boolean }
     */

    async _createLoan(req, res, next){
        try {
            const {amount, loan_settings_id} = this._Validator[this._CONTROLLER_NAME].createLoan.run(req.body.data);

            await this._LoanMC.create({amount, loan_settings_id, user_id: req.body.auth.user_id});

            // TODO: calculate installment and fine amounts payment, create all models



            res.send(response.sendSuccess({status: true}));

        } catch (err) {
            next(err);
        }
    }

    /**
     * @description Method for POST /loan/getLoanSettings endpoint.
     *
     * @param {Number} body.data.loan_settings_id LoanSettings id
     * @throws {NotFoundError} 404 if Loan Settings not found
     *
     * @returns {200<OK>} { amount_to: Float, amount_from: Float ...} All fields from LoanSettings model
     */
    async _getLoanSetting(req, res, next){
        try{
            const {loan_settings_id} = this._Validator[this._CONTROLLER_NAME].getLoanSettings.run(req.body.data);
            const loanSettings = await this._LoanSettingsMC.find({id: loan_settings_id});

            if(!loanSettings) {
                throw new NotFoundError('Loan Settings not found');
            }

            res.send(response.sendSuccess(loanSettings));
        } catch (err) {
            next(err);
        }
    }

    /**
     * @description Method for POST /loan/payLoan endpoint.
     *
     * @param {Number} body.data.amount Loan amount
     *
     * @returns {200<OK>} { status: boolean } status of Transaction
     */
    async _payLoan(req, res, next){
        try{
            // TODO: make all transactions and update all payment models
            res.send(response.sendSuccess({status: true}));
        } catch (err) {
            next(err);
        }
    }

    /**
     * @description Method for POST /loan/getUserLoans endpoint.
     *
     * @returns {200<OK>} [{ id: Number, status: Number, amount: Number }]
     */
    async _getUserLoans(req, res, next){
        try{
            const loans = await this._LoanMC.find({user_id : req.body.auth.user_id});
            res.send(response.sendSuccess({loans : loans ? loans : []}));
        } catch (err) {
            next(err);
        }
    }


    /**
     * @description Method for POST /loan/getUserLoan endpoint.
     *
     * @param {Number} body.data.loan_id Loan id
     * @throws {NotFoundError} 404 if Loan not found
     *
     * @returns {200<OK>} { id: Number, status: Number, amount: Number }
     */
    async _getUserLoan(req, res, next){
        try{
            const {loan_id} = this._Validator[this._CONTROLLER_NAME].getUserLoan.run(req.body.data);
            const loan = await this._LoanMC.find({user_id : req.body.auth.user_id, id: loan_id});
            if(!loan) {
                throw new NotFoundError('Loan not found');
            }
            res.send(response.sendSuccess(loan));
        } catch (err) {
            next(err);
        }
    }
}

module.exports = loanControllerProvider;
