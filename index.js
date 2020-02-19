const Service = require('./app/service');
const config = require('./app/defaultConfig');

new Service(config).start();
