const config = require('../defaultConfig');

module.exports = {
    sendSuccess: (data, request_id) => {
        const respObj = {
            result: true,
            request_id: request_id,
            error: {
                msg: '',
                code: 0,
            },
            versions: {
                ios: config.app_data.ios,
                android: config.app_data.android,
            },
            data: data,

        };

        return respObj;
    },

    sendError: (error_code, error_msg) => {

        return {
            result: false,
            error: {
                msg: error_msg,
                code: error_code,
            },
            versions: {
                ios: config.app_data.ios,
                android: config.app_data.android,
            },
            data: {},
        };
    },
};
