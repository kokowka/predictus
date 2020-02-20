const { Rule, RuleContainer } = require('../../Validator/index');

class ResponseAsyncBuilder {

    /**
     * Creates RAB service
     * @param {Object} params response params
     */
    constructor(params = {}) {
        this._params = params;

        new RuleContainer()
            .withOptional('mobile_app_data', Rule.isObject(new RuleContainer()
                .withRequired('ios', Rule.isNumber())
                .withRequired('android', Rule.isNumber()),
            ))
            .withRequired('errors', Rule.isObject())
            .run(params);

        const { mobile_app_data } = params;
        if ( mobile_app_data ) {
            this._versions = {
                ios: mobile_app_data.ios,
                android: mobile_app_data.android,
            };
        }
    }

    /**
     * Asyncroniously creates successfull response for ws request
     * @param {Object} data data to send
     * @param {String} request_id device request id
     * @param {String} method ws method
     * @returns {Promise} promise which will be resolved when successfull response will be created
     */
    createSuccess(data = {}, request_id, method) {
        return JSON.stringify( this.buildSuccess(data, request_id, method) );
    }

    /**
     * Asyncroniously creates error response for ws request
     * @param {Number} error_code error code as for params
     * @param {String} error_msg error message
     * @param {String} request_id device request id
     * @param {String} method ws method
     * @returns {Promise} promise which will be resolved when error response will be created
     */
    createError(error_code, error_msg = null, request_id, method) {
        return JSON.stringify( this.buildError(error_code, error_msg, request_id, method) );
    }

    /**
     * Packs already built response message
     * @param {Object} response_message already builded response message
     * @returns {Promise} promise which will be resolved when response will be packed
     */
    packResponse(response_message) {
        return JSON.stringify(response_message);
    }

    /**
     * Syncroniously creates successfull response object
     * @param {Object} data data to send
     * @param {String} request_id device request id
     * @param {String} method ws method
     * @returns {Object} successfull response object
     */
    buildSuccess(data = {}, request_id, method) {
        return {
            result: true,
            method,
            request_id,
            data,
            error: null,
            versions: this._versions,
        };
    }
    
    /**
     * Syncroniously creates error response object
     * @param {Object} data data to send
     * @param {String} request_id device request id
     * @param {String} method ws method
     * @returns {Object} error response object
     */
    buildError(error_code, error_msg = null, request_id, method) {
        if ( error_msg === null ) {
            error_msg = this.getErrorMessage(error_code);
        }

        return {
            result: false,
            method,
            request_id,
            data: {},
            error: {
                msg: error_msg,
                code: error_code,
            },
            versions: this._versions,
        };
    }

    /**
     * Gets error message from params based on error code
     * @param {Number} error_code error code
     * @returns {String} error message
     */
    getErrorMessage(error_code) {
        const errors = this._params.errors;
        return errors[error_code] !== undefined ? errors[error_code] : 'Undefined error';
    }
}

module.exports = ResponseAsyncBuilder;
