const { NotFoundError } = require('../framework-nodejs/core/rest.errors');
const response = require('../helpers/response');
const userConstants = require('../constants/user');

function userControllerProvider(UserMC, ContactMC, SmsMC, InstalledAppMC, ApplicationGeolocationsMC, Validator) {
    return new UserController(UserMC, ContactMC, SmsMC, InstalledAppMC, ApplicationGeolocationsMC, Validator);
}
userControllerProvider.$inject = ['UserMC', 'ContactMC', 'SmsMC', 'InstalledAppMC', 'ApplicationGeolocationsMC', 'Validator'];

class UserController {

    /**
     * @description User REST Controller constructor
     *
     * @param {UserMC} UserMC User Model-Controller
     * @param ContactMC Contact Model-Controller
     * @param SmsMC SMS Model-Controller
     * @param InstalledAppMC InstalledApp Model-Controller
     * @param ApplicationGeolocationsMC ApplicationGeolocations Model-Controller
     * @param {Validator} Validator Validator instance
     *
     * @author Nazar Z.
     */
    constructor(UserMC, ContactMC, SmsMC, InstalledAppMC, ApplicationGeolocationsMC, Validator) {
        this._CONTROLLER_NAME = 'User';
        this._Validator = Validator;

        this._UserMC = UserMC;
        this._ContactMC = ContactMC;
        this._SmsMC = SmsMC;
        this._InstalledAppMC = InstalledAppMC;
        this._ApplicationGeolocationsMC = ApplicationGeolocationsMC;
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

    get addInstalledApplications() {
        return this._addInstalledApplications.bind(this);
    }

    get updateLocation() {
        return this._updateLocation.bind(this);
    }

    /**
     * @description Method for POST /user/setUserInfo endpoint.
     *
     * @param {String} body.data.first_name User first_name
     * @param {String} body.data.last_name User last_name
     * @param {String} body.data.gender User gender
     * @param {String} body.data.country_id country_id from table Country
     * @param {BigInt} body.data.birth_date User birth_date
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
     * @description Method for POST /user/getUserInfo endpoint.
     *
     * @param {String} body.data.user_id User id
     * @throws {NotFoundError} 404 if User not found
     *
     * @returns {200<OK>} { phone_number: String, last_name: String ...} All fields from user model
     */
    async _getUserInfo(req, res, next) {
        try{
            this._Validator[this._CONTROLLER_NAME].getUserInfo.run(req.body.data);
            const user = await this._UserMC.find({id: req.body.data.user_id});

            if(!user) {
                throw new NotFoundError('User not found');
            }

            res.send(response.sendSuccess(user));

        } catch (err) {
            next(err);
        }
    }

    /**
     * @description Method for POST /user/addContacts endpoint.
     *
     * @param {String} body.data.contacts [{first_name: String, last_name: String, phone_number: String}]
     *
     * @throws {VALIDATION_ERROR} 400 if client provided unvalid request params
     * @returns {200<OK>} { status: Boolean }
     */
    _addContacts(req, res, next) {
        try{
            const {contacts} = this._Validator[this._CONTROLLER_NAME].addContacts.run(req.body.data);
            const now_ms = new Date().valueOf();

            this._UserMC.update({last_contact_update: now_ms}, req.body.auth.user_id);

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
     * @description Method for POST /user/addSms endpoint.
     *
     * @param {String} body.data.sms [{local_id: String, sender: String, text: String, message_date: BigInt}]
     *
     * @throws {VALIDATION_ERROR} 400 if client provided unvalid request params
     * @returns {200<OK>} { status: Boolean }
     */
    _addSms(req, res, next) {
        try{
            const {sms} = this._Validator[this._CONTROLLER_NAME].addSms.run(req.body.data);
            const now_ms = new Date().valueOf();

            this._UserMC.update({last_sms_update: now_ms}, req.body.auth.user_id);

            for(const one of sms) {
                one.user_id = req.body.auth.user_id;
                this._SmsMC.create(one);
            }

            res.send(response.sendSuccess({status: true}));
        } catch (err) {
            next(err);
        }
    }

    /**
     * @description Method for POST /user/addInstalledApplications endpoint.
     *
     * @param {String} body.data.apps [{package_name: String}]
     *
     * @throws {VALIDATION_ERROR} 400 if client provided unvalid request params
     * @returns {200<OK>} { status: Boolean }
     */
    _addInstalledApplications(req, res, next) {
        try {
            const {apps} = this._Validator[this._CONTROLLER_NAME].addInstalledApplications.run(req.body.data);
            const now_ms = new Date().valueOf();

            this._UserMC.update({last_application_update: now_ms}, req.body.auth.user_id);

            for(const app of apps) {
                app.user_id = req.body.auth.user_id;
                this._InstalledAppMC.create(app);
            }

            res.send(response.sendSuccess({status: true}));
        } catch (err) {
            next(err);
        }
    }

    /**
     * @description Method for POST /user/updateLocation endpoint.
     *
     * @param {Number} body.data.lat
     * @param {Number} body.data.lng
     * @param {Number} body.data.alt
     *
     * @throws {VALIDATION_ERROR} 400 if client provided unvalid request params
     * @returns {200<OK>} { status: Boolean }
     */
    _updateLocation(req, res, next) {
        try {
            const {lat, lng, alt} = this._Validator[this._CONTROLLER_NAME].updateLocation.run(req.body.data);
            const now_ms = new Date().valueOf();

            this._UserMC.update({last_location_update: now_ms}, req.body.auth.user_id);

            this._ApplicationGeolocationsMC.create({lat, lng, alt, last_update: now_ms});
            res.send(response.sendSuccess({status: true}));
        } catch (err) {
            next(err);
        }
    }

}

module.exports = userControllerProvider;
