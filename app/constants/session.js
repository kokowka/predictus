
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

module.exports = {
    expiry_time: WEEK_IN_MS,

    status: {
        ACTIVE: 1,
        INACTIVE: 0,
    },

    TOKEN_LENGTH: 20,
};
