'use strict';
const RAB = require('../response-async-builder/response-async-builder');

class WsRouter {
    constructor(wsControllersGroup, params = { errors: {} }) {
        if (wsControllersGroup) {
            this.WSC = {};
            wsControllersGroup.forEach(contr => {
                this.WSC[ contr.$name ] = contr;
            });
        }
        this._rab = new RAB(params);

        this._routes = {};
    }


    addRoute(method, handler) {
        // method - string
        // handlerName - string (name of dependency in container)
        if (this._routes.method) {
            // should I try to handle multiple routes handling?
            // should I implement something like middleware for sockets?
        }

        // for now let's keep up with "one route - one handler"
        if (this.WSC) {
            this._routes[method] = this._getHandler(handler);
        } else {
            this._routes[method] = handler;
        }

        return this;
    }

    async process(message, auth, socket) { // eslint-disable-line require-await
        const { data, request_id, metadata, method } = message;
        const handler = this._routes[method];
        const ip = socket;

        if ( !handler ) {
            throw new Error(`Method name "${method}" does not have handler`);
        }
        // for now let's keep up with "one route - one handler"
        const res = await handler(data, auth, { metadata, ip, socket });
        const { err } = res;

        if ( err ) {
            return this._rab.createError(err.code, err.msg, request_id, method);
        }

        return this._rab.createSuccess(res, request_id, method);
    }

    _getHandler(handlerName) {
        const propArr = handlerName.split('.');

        let handler = propArr.reduce( ( acc, propName ) => {
            const currProp = acc[propName];
            if ( !currProp ) {
                throw new Error(`${propArr[0]} does not have property ${propArr.slice(1, propArr.length)}`); // eslint-disable-line no-magic-numbers
            }

            return currProp;
        }, this.WSC);

        return handler;
    }
}

module.exports = WsRouter;
