const Logger = require('../framework-nodejs/core/Logger/Logger');
const config = require('../defaultConfig');

const log = new Logger('Predictus Request Info', config.logger);

function trackRequest(req, res, next) {
    log.info(`[${req.method}]`,req.originalUrl, JSON.stringify(req.body));
    req.body.data = req.body.data ? req.body.data : {};
    next();
}

module.exports = {
    trackRequest,
};
