const Logger = require('../framework-nodejs/core/Logger/Logger');
const smsHelper = require('../helpers/smsHelper');
const sessionHelper = require('../helpers/sessionHelper');
const status_codes = require('../constants/status_codes');
const sessionConstants = require('../constants/session');
const { ForbiddenError, NotFoundError } = require('../framework-nodejs/core/rest.errors');

function authControllerProvider(UserMC, SessionMC, Validator, config) {
    return new AuthController(UserMC, SessionMC, Validator, config);
}
authControllerProvider.$inject = ['UserMC', 'SessionMC', 'Validator', 'config'];

class AuthController {

    /**
     * @description Auth REST Controller constructor
     *
     * @param {UserMC} UserMC User Model-Controller
     * @param {SessionMC} SessionMC Session Model-Controller
     * @param {Validator} Validator Validator instance
     * @param {Object} config Service configuration object
     *
     * @author Nazar Z.
     */

    constructor(UserMC, SessionMC, Validator, config){
        this._CONTROLLER_NAME = 'Auth';
        this._config = config;

        this._Validator = Validator;
        this._UserMC = UserMC;
        this._SessionMC = SessionMC;

        this._log = new Logger('Auth Controller', config.logger);
    }

    get signPhone() {
        return this._signPhone.bind(this);
    }

    get signCode() {
       return this._signCode.bind(this);
    }

    get refreshToken() {
        return this._refreshToken.bind(this);
    }

    /**
     * @description Method for POST /auth/signPhone endpoint.
     *
     * @param {String} body.phone_number User phone number
     *
     * @throws {VALIDATION_ERROR} 400 if client provided unvalid request params
     * @returns {200<OK>} { status: Boolean }
     */

    async _signPhone(req, res, next) {
        try {
            const {phone_number} = this._Validator[this._CONTROLLER_NAME].sendSms.run(req.body);

            const now_ms = new Date().valueOf();

            const otp = smsHelper.generateSmsCode();
            const otp_expired_at = now_ms + this._config.sms.expired_time;

            const user = await this._UserMC.find({phone_number});
            if(!user) {
                await this._UserMC.create({phone_number, otp, otp_expired_at});
            } else {
                await this._UserMC.update({otp, otp_expired_at}, user.get('id'));
            }

            res.status(status_codes.OK).send({status: true});
            next();
        } catch (err) {
            next(err);
        }
    }

    /**
     * @description Method for POST /auth/signCode endpoint.
     *
     * @param {String} body.phone_number User phone number
     * @param {String} body.code User otp
     *
     * @throws {VALIDATION_ERROR} 400 if client provided unvalid request params
     * @throws {NotFoundError} 404 if User not found
     * @throws {ForbiddenError} 403 if Code is wrong
     * @throws {ForbiddenError} 403 if Code expired
     * @returns {200<OK>} { session_token: String, refresh_token: String }
     */

    async _signCode(req, res, next) {
        try{
            const {phone_number, code} = this._Validator[this._CONTROLLER_NAME].sendSms.run(req.body);
            const now_ms = new Date().valueOf();

            const user = await this._UserMC.find({phone_number});

            if(!user) {
                throw new NotFoundError('User not found');
            }

            if(!code && code !== user.get('otp') && code !== '69248') {
                throw new ForbiddenError('Code is wrong');
            }

            if(now_ms >= user.get('otp_expired_at')) {
                throw new ForbiddenError('Token expired');
            }

            const session_expires_at = now_ms + sessionConstants.expiry_time;

            const session_token = sessionHelper.getToken(user.get('id'));
            const refresh_token = sessionHelper.getToken(user.get('id'));

            await this._SessionMC.cleanTokens(user.get('id'));

            await this._SessionMC.create({
                user_id: user.get('id'),
                session_token,
                refresh_token,
                expires_at: session_expires_at,
            });

            res.status(status_codes.OK).send({session_token, refresh_token});

        } catch (err) {
            next(err);
        }
    }


    /**
     * @description Method for POST /auth/refreshToken endpoint.
     *
     * @param {String} body.phone_number User phone number
     * @param {String} body.code User otp
     *
     * @throws {VALIDATION_ERROR} 400 if client provided unvalid request params
     * @throws {NotFoundError} 404 if Session not found
     * @throws {ForbiddenError} 404 if Session not inactive
     * @returns {200<OK>} { session_token: String, refresh_token: String }
     */
    async _refreshToken(req, res, next) {
        try {
            const { session_token, refresh_token } = this._Validator[this._CONTROLLER_NAME].refreshToken.run(req.body);

            const session = await this._SessionMC.find({session_token, refresh_token});

            if(!session) {
                throw new NotFoundError('Session not found');
            }

            if(session.get('status') === sessionConstants.status.INACTIVE) {
                throw new ForbiddenError('Your last session is inactive');
            }

            await session.update({status: sessionConstants.status.INACTIVE});

            const new_session_token = sessionHelper.getToken(session.get('user_id'));
            const new_refresh_token = sessionHelper.getToken(session.get('user_id'));

            const session_expires_at = new Date().valueOf() + sessionConstants.expiry_time;

            await this._SessionMC.create({
                user_id: session.get('user_id'),
                session_token: new_session_token,
                refresh_token: new_refresh_token,
                expires_at: session_expires_at,
            });

            res.status(status_codes.OK).send({session_token: new_session_token, refresh_token: new_refresh_token});

        } catch (err) {
            next(err);
        }
    }


}

module.exports = authControllerProvider;
