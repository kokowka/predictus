const Logger = require('../framework-nodejs/core/Logger/Logger');
const config = require('../defaultConfig');

const log = new Logger('Predictus Request Info', config.logger);

function trackRequest(req, res, next) {
    log.info(`[${req.method}]`,req.originalUrl, req.body);
    next();
}

module.exports = {
    trackRequest,
};
