const Logger = require('../framework-nodejs/core/Logger/Logger');

function applicationGeolocationsModelControllerProvider(ApplicationGeolocations, config) {
    return new ApplicationGeolocationsModelController(ApplicationGeolocations, config);
}

applicationGeolocationsModelControllerProvider.$inject = ['ApplicationGeolocations', 'config'];

class ApplicationGeolocationsModelController {
    constructor(ApplicationGeolocations, config) {
        this._log = new Logger('Application Geolocations Model-Controller', config.logger);
        this._ApplicationGeolocations = ApplicationGeolocations;
    }

    async create(data = {}) {

        const geolocation = await this._ApplicationGeolocations.create(data);
        this._log.info(`Application Geolocations with id <${geolocation.get('id')}> was created`);

        return geolocation;
    }

    async find(data = {}) {
        return await this._ApplicationGeolocations.findOne({
            where: data,
        });
    }
}


module.exports = applicationGeolocationsModelControllerProvider;
