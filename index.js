const Service = require('./app/service');
const config = require('./app/config');

new Service(config).start();
