'use strict';

class StagingDependency {
    constructor(name, provider, options) {
        this._name = name;
        this._provider = provider;
        this._dependencies = this._provider.$inject;
        this._groups = options && options.groups;
    }

    initService(required_deps) {
        const service = this._provider(...required_deps);
        service.$groups = this._groups;
        service.$name = this._name;

        return service;
    }

    get $name() {
        return this._name;
    }

    get $groups() {
        return this._groups;
    }

    get dependencies() {
        return this._dependencies;
    }

    set dependencies(deps) {
        this._dependencies = deps;
    }
}

module.exports = StagingDependency;
