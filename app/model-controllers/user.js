const Logger = require('../framework-nodejs/core/Logger/Logger');

function userModelControllerProvider(User, config) {
    return new UserModelController(User, config);
}
userModelControllerProvider.$inject = ['User', 'config'];

class UserModelController {

    constructor(User, config) {
        this._User = User;

        this._log = new Logger('User Model-Controller', config.logger);
    }

    async find(data = {}){
        return await this._User.findOne({
            where: data,
        });
    }

    async create(data = {}){
        const user = await this._User.create(data);
        this._log.info(`User with id <${user.get('id')}> was created`);
        return user;
    }

    async update(data, user_id) {
        const user = await this._User.update(data, {
            where: { id: user_id },
        });
        this._log.info(`User with id <${user_id}> was updated`);
        return user;
    }

}

module.exports = userModelControllerProvider;
