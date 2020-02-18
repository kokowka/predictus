const Logger = require('../../framework-nodejs/core/Logger/Logger');
const smsHelper = require('../../helpers/smsHelper');
const status_codes = require('../../constants/status_codes');

function authControllerProvider(UserMC, Validator, config) {
    return new AuthController(UserMC, Validator, config);
}
authControllerProvider.$inject = ['UserMC', 'Validator', 'config'];

class AuthController {

    /**
     * @description Auth REST Controller constructor
     *
     * @param {UserMC} UserMC User Model-Controller
     * @param {Validator} Validator Validator instance
     * @param {Object} config Service configuration object
     *
     * @author Nazar Z.
     */

    constructor(UserMC, Validator, config){
        this._CONTROLLER_NAME = 'Auth';
        this._config = config;

        this._Validator = Validator;
        this._UserMC = UserMC;

        this._log = new Logger('Auth Controller', config.logger);
    }

    get sendSms() {
        return this._sendSms.bind(this);
    }

    get signPhone() {
       return this._signPhone.bind(this);
    }

    /**
     * @description Method for POST /auth/sendSms endpoint.
     *
     * @param {String} body.phone_number User phone number
     *
     * @throws {VALIDATION_ERROR} 400 if client provided unvalid request params
     * @returns {200<OK>} { status: Boolean }
     */

    async _sendSms(req, res, next) {
        try {
            const {phone_number} = this._Validator[this._CONTROLLER_NAME].sendSms.run(req.body);

            let now_ms = new Date().valueOf();

            const otp = smsHelper.generateSmsCode();
            const otp_expired_at = new Date(now_ms + this._config.sms.expired_time).valueOf();

            const user = await this._UserMC.find({phone_number});
            if(!user) {
                await this._UserMC.create({phone_number, otp, otp_expired_at});
            } else {
                await this._UserMC.update({otp, otp_expired_at}, user.get('id'));
            }

            res.send({status: true});
            next();
        } catch (err) {
            next(err);
        }
    }

    async _signPhone(req, res, next) {

    }
}

module.exports = authControllerProvider;
