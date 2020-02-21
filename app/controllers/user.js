const { NotFoundError } = require('../framework-nodejs/core/rest.errors');
const response = require('../helpers/response');
const userConstants = require('../constants/user');

function userControllerProvider(UserMC, ContactMC, SmsMC, Validator) {
    return new UserController(UserMC, ContactMC, SmsMC, Validator);
}
userControllerProvider.$inject = ['UserMC', 'ContactMC', 'SmsMC', 'Validator'];

class UserController {

    /**
     * @description Auth REST Controller constructor
     *
     * @param {UserMC} UserMC User Model-Controller
     * @param ContactMC Contact Model-Controller
     * @param SmsMC SMS Model-Controller
     * @param {Validator} Validator Validator instance
     *
     * @author Nazar Z.
     */
    constructor(UserMC, ContactMC, SmsMC, Validator) {
        this._CONTROLLER_NAME = 'User';
        this._Validator = Validator;

        this._UserMC = UserMC;
        this._ContactMC = ContactMC;
        this._SmsMC = SmsMC;
    }

    get setUserInfo() {
        return this._setUserInfo.bind(this);
    }

    get getUserInfo() {
        return this._getUserInfo.bind(this);
    }

    get addContacts() {
        return this._addContacts.bind(this);
    }

    get addSms() {
        return this._addSms.bind(this);
    }

    /**
     * @description Method for POST /user/setUserInfo endpoint.
     *
     * @param {String} body.first_name User first_name
     * @param {String} body.last_name User last_name
     * @param {String} body.gender User gender
     * @param {String} body.country User country
     * @param {BigInt} body.birth_date User birth_date
     *
     * @throws {VALIDATION_ERROR} 400 if client provided unvalid request params
     * @throws {NotFoundError} 404 if User not found
     * @returns {200<OK>} { session_token: String, refresh_token: String }
     */

    async _setUserInfo(req, res, next) {
        try {
            this._Validator[this._CONTROLLER_NAME].setUserInfo.run(req.body.data);
            const user_id = req.body.auth.user_id;

            const user = await this._UserMC.find({id: user_id});

            if(!user) {
                throw new NotFoundError('User not found');
            }

            req.body.data.status = userConstants.status.ACTIVE;

            await this._UserMC.update(req.body.data, user_id);

            res.send(response.sendSuccess({status: true}));


        } catch (err) {
            next(err);
        }
    }

    /**
     * @description Method for GET /user/getUserInfo endpoint.
     *
     * @param {String} id User id
     * @throws {NotFoundError} 404 if User not found
     *
     * @returns {200<OK>} { phone_number: String, last_name: String ...} All fields from user model
     */
    async _getUserInfo(req, res, next) {
        try{
            const user = await this._UserMC.find({id: req.params.id});

            if(!user) {
                throw new NotFoundError('User not found');
            }

            res.send(res.sendSuccess(user));

        } catch (err) {
            next(err);
        }
    }

    /**
     * @description Method for POST /user/addContacts endpoint.
     *
     * @param {String} body.contacts [{first_name: String, last_name: String, phone_number: String}]
     *
     * @throws {VALIDATION_ERROR} 400 if client provided unvalid request params
     * @returns {200<OK>} { session_token: String, refresh_token: String }
     */
    _addContacts(req, res, next) {
        try{
            const {contacts} = this._Validator[this._CONTROLLER_NAME].addContacts.run(req.body.data);
            for(const contact of contacts) {
                contact.user_id = req.body.auth.user_id;
                this._ContactMC.create(contact);
            }

            res.send(response.sendSuccess({status: true}));
        } catch (err) {
            next(err);
        }
    }

    /**
     * @description Method for POST /user/addContacts endpoint.
     *
     * @param {String} body.sms [{local_id: String, sender: String, text: String, message_date: BigInt}]
     *
     * @throws {VALIDATION_ERROR} 400 if client provided unvalid request params
     * @returns {200<OK>} { session_token: String, refresh_token: String }
     */
    _addSms(req, res, next) {
        try{
            const {sms} = this._Validator[this._CONTROLLER_NAME].addSms.run(req.body.data);
            for(const one of sms) {
                one.user_id = req.body.auth.user_id;
                this._SmsMC.create(one);
            }

            res.send(response.sendSuccess({status: true}));
        } catch (err) {
            next(err);
        }
    }

}

module.exports = userControllerProvider;
