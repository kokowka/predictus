'use strict';

module.exports = function readyService (...args) {
    if (args.length === 2) {
        const [ staging_dependency, required_dependencies ] = args;

        const service = staging_dependency.initService(required_dependencies);
        return service;

    } else if (args.length === 3) {
        const [ name, service, options ] = args;

        const serviceInst = service;

        serviceInst.$name = name;
        serviceInst.$groups = options && (options.groups || []);
        return serviceInst;

    }

    throw new Error('Unexpected amount of arguments received');
};
