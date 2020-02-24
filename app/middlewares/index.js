const Logger = require('../framework-nodejs/core/Logger/Logger');
const config = require('../defaultConfig');

const log = new Logger('Predictus Request Info', config.logger);

const {auth_required, routes} = require('../params');
const sessionConstants = require('../constants/session');
const {UnauthorizedError, NotFoundError} = require('../framework-nodejs/core/rest.errors');


function trackRequest(req, res, next) {
    log.info(`[${req.method}]`, req.originalUrl, req.method !== 'GET' ? JSON.stringify(req.body) : '');
    req.body.data = req.body.data ? req.body.data : {};
    req.body.auth = req.body.auth ? req.body.auth : {};
    next();
}



async function checkIsAuth(req, res, next) {

    if(auth_required.includes(req.originalUrl)) {

        const session = await req.Session.findOne({where: req.body.auth});

        if(!session || session.get('status') === sessionConstants.status.INACTIVE || (new Date().valueOf()) >= session.get('expires_at')) {
            next(new UnauthorizedError('Not authorize'));
        }
    }
    next();
}

function checkIsExistRoute(req, res, next) {
    if(!routes.includes(req.originalUrl)) {
        next(new NotFoundError('Route not found'));
    }
    next();
}

module.exports = {
    checkIsExistRoute,
    trackRequest,
    checkIsAuth,
};
