const yj = require('yieldable-json');
const promise_helper = require('../promise-helper');

module.exports = {
    stringify,
    parse,
};

/**
 * Performs JSON-like stringify asyncroniously
 * @param {*} data_to_stringify data to be stringified
 */
function stringify(data_to_stringify) {
    return promise_helper.callAsPromise(yj.stringifyAsync, data_to_stringify);
}

/**
 * Performs JSON-like parsing asyncroniously
 * @param {String} data_to_parse data to be parsed
 */
function parse(data_to_parse) {
    return promise_helper.callAsPromise(yj.parseAsync, data_to_parse);
}
