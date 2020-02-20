const { NotFoundError } = require('../framework-nodejs/core/rest.errors');
const response = require('../helpers/response');
const userConstants = require('../constants/user');

function userControllerProvider(UserMC, Validator) {
    return new UserController(UserMC, Validator);
}
userControllerProvider.$inject = ['UserMC', 'Validator'];

class UserController {

    /**
     * @description Auth REST Controller constructor
     *
     * @param {UserMC} UserMC User Model-Controller
     * @param {Validator} Validator Validator instance
     *
     * @author Nazar Z.
     */
    constructor(UserMC, Validator) {
        this._CONTROLLER_NAME = 'User';
        this._Validator = Validator;

        this._UserMC = UserMC;
    }

    get setUserInfo() {
        return this._setUserInfo.bind(this);
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

}

module.exports = userControllerProvider;
