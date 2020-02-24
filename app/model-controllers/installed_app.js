const Logger = require('../framework-nodejs/core/Logger/Logger');

function installedAppModelControllerProvider(InstalledApp, config) {
    return new InstalledAppModelController(InstalledApp, config);
}
installedAppModelControllerProvider.$inject = ['InstalledApp', 'config'];

class InstalledAppModelController {
    constructor(InstalledApp, config) {
        this._InstalledApp = InstalledApp;
        this._log = new Logger('Installed App Model-Controller', config.logger);
    }

    async create(data = {}) {

        const app = await this._InstalledApp.create(data);
        this._log.info(`Installed App with id <${app.get('id')}> was created`);

        return app;
    }

    async find(data = {}) {
        return await this._InstalledApp.findOne({
            where: data,
        });
    }
}

module.exports = installedAppModelControllerProvider;
