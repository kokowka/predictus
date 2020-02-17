'use strict';

const StagingDependency = require('./staging_dependency');
const readyService = require('./ready_service');
const { Rule, RuleContainer } = require('../Validator/index');

class Container {

    constructor() {
        this._ready_container = {};
        this._pre_container = {};
        this._is_init_called = false;

        this._allowed_inject_opts = {
            groups: Array,
        };
    }

    /**
     * Inject service provider into Pre Container
     * @param {String} name service provider name
     * @param {Function} provider service provider function
     * @param {Object} options Optional parameter
     * @param {String} options.groups service groups
     */
    provider(name, provider, options) {
        this._throwInited();

        new RuleContainer()
            .withRequired('name', Rule.isString())
            .withRequired('provider', Rule.isOneOfType('function', 'object'))
            .withOptional('groups', Rule.isArray({ each: new RuleContainer().withRequired('', Rule.isString()) }))
            .run(Object.assign({}, options, { name, provider }));

        this._pre_container[name] = new StagingDependency(name, provider, options);
    }

    /**
     * Inject static service directly into Ready Container
     * @param {String} name service name
     * @param {Object|Function} service static service
     * @param {Object} options Optional parameter
     * @param {String} options.groups service groups
     */
    static(name, service, options) {
        this._throwInited();
        
        new RuleContainer()
            .withRequired('name', Rule.isString())
            .withRequired('service', Rule.isOneOfType('function', 'object'))
            .withOptional('groups', Rule.isArray({ each: new RuleContainer().withRequired('', Rule.isString()) }))
            .run(Object.assign({}, options, { name, service }));

        this._ready_container[name] = readyService(name, service, options);
    }

    /**
     * Gets service from Ready Container by it's name
     * @param {String} name service name
     * @param {Boolean} system_call Optional. Used for deps retreival before init
     */
    get(name, system_call) {
        this._throwUninited(system_call);
        
        new RuleContainer()
            .withRequired('', Rule.isString())
            .run(name);

        const service = this._ready_container[name];
        this._throwEmpty(name, service);
        return service;
    }

    /**
     * Gets services by group identifier
     * @param {String} group_name group name
     * @param {Boolean} system_call Optional. Used for deps retreival before init
     * @returns {Array<Service>} array of group services
     */
    getByGroup(group_name, system_call) {
        this._throwUninited(system_call);
        
        new RuleContainer()
            .withRequired('', Rule.isString())
            .run(group_name);

        return Object.values(this._ready_container)
            .filter(service =>
                service.$groups && service.$groups.some( grp => grp === group_name )
            );
    }

    _getStagingByGroup(group_name) {
        return Object.values(this._pre_container)
            .filter( staging_dep =>
                staging_dep.$groups.some( grp => grp === group_name )
            );
    }

    /**
     * Initialize Pre Container providers and puts resulting
     *  services to Ready Container.
     */
    init() {
        this._unwindGroups();

        this._is_init_called = true;
        Object.values(this._pre_container)
            .forEach(staging_dependency => this._initProvider(staging_dependency));
    }

    /**
     * Clears container
     */
    clear() {
        this._is_init_called = false;
        this._pre_container = {};
        this._ready_container = {};
    }

    _initProvider(staging_dep) {
        const { $name, dependencies } = staging_dep;
        const isReady = this._ready_container[$name];

        if (isReady) {
            return;
        }

        const unwinded_deps = dependencies.reduce((unw, dep) => unw.concat(dep), []);

      // recursively init non-ready dependencies
        unwinded_deps
            .filter( dep_name => !this._ready_container[dep_name] )
            .forEach( dep_name => {
                if (!this._isDependencyExist(dep_name)) {
                    throw new Error(`Dependency ${dep_name} was not injected`);
                }
                this._initProvider(this._pre_container[dep_name]);
            });

        const isDependenciesInited = this._isDepsInited(unwinded_deps);
        if (isDependenciesInited) {
            const required_deps = dependencies
                .map(injectMap.bind(this));

            this._ready_container[$name] = readyService(staging_dep, required_deps);
            return this._ready_container[$name];
        }

        throw new Error('Something unexpected happened');

        function injectMap(dep_name) {
            if (dep_name instanceof Array) {
                return dep_name.map(injectMap.bind(this));
            }

            return this._ready_container[dep_name];
        }
    }

    _isDepsInited(dependencies) {
        if ( !dependencies.length ) {
            return true;
        }

        return dependencies.reduce((isInited, dependency_name) => {
            return Boolean(this._ready_container[dependency_name]) && isInited;
        }, true);
    }

    _throwInited() {
        if ( this._is_init_called ) {
            throw new Error('Can\'t inject because "init" was already called');
        }
    }

    _throwUninited(system_call) {
        if ( !this._is_init_called && !system_call ) {
            throw new Error('Can\'t get because "init" was not called');
        }
    }

    _throwEmpty(name, services) {
        if ( services === undefined ) {
            throw new Error(`Service ${name} was not injected`);
        }
    }

    _isDependencyExist(name) {
        const pre_container = Object.keys(this._pre_container);
        const ready_services = Object.keys(this._ready_container);

        if ( !pre_container.concat(ready_services).find(contName => contName === name) ) {
            return false;
        }
        return true;
    }

    _unwindGroups() {
        const staging_deps = Object.values(this._pre_container);
        const ready_deps = Object.values(this._ready_container);

        const groups_dict = staging_deps.concat(ready_deps)
            .reduce( (groups, curr_dep) => {
                const { $groups, $name } = curr_dep;
                
                if (!$groups) {
                    return groups;
                }

                $groups.forEach(group => {
                    if (!groups[group]) {
                        groups[group] = [$name];
                    } else {
                        groups[group].push($name);
                    }
                });

                return groups;
            }, {});
        
        staging_deps.forEach(dep => {
            const injects = dep.dependencies;
            const unwinded_injects = injects.reduce( (unw_inj, curr_inj) => {
                const inject_elem = curr_inj.startsWith('$g.') ? groups_dict[curr_inj.replace(/^\$g./, '')] : curr_inj;

                unw_inj.push(inject_elem);
                return unw_inj;
            }, []);

            dep.dependencies = unwinded_injects;
        });
    }
}

module.exports = Container;
