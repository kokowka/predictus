const config = require('../defaultConfig');

module.exports = {
    sendSuccess: (data) => {
        const respObj = {
            result: true,
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
