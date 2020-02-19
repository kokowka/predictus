const Logger = require('../framework-nodejs/core/Logger/Logger');
const {status} = require('../constants/session');

function sessionModelControllerProvider(Session, config) {
    return new SessionModelController(Session, config);
}
sessionModelControllerProvider.$inject = ['Session', 'config'];

class SessionModelController {
    constructor(Session, config) {
        this._Session = Session;
        this._log = new Logger('Session Model-Controller', config.logger);
    }

    async find(data = {}){
        return this._Session.findOne({
            where: data
        })
    }

    async create(data = {}) {
        const session = await this._Session.create(data);
        this._log.info(`Session with id <${session.get('id')}> was created`);
        return session;
    }

    async cleanTokens(user_id) {
        const sessions = await this._Session.findAll({where : {user_id: user_id, status: status.ACTIVE}});
        for(const session of sessions) {
            await session.update({status: status.INACTIVE})
        }
    }
}

module.exports = sessionModelControllerProvider;
