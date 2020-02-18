const Sequelize = require('sequelize');
const user_constants = require('../constants/user');

module.exports = {
    model_name: 'User',
    model_props: {

        id:                     { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        phone_number:           { type: Sequelize.STRING, allowNull: false },
        last_name:              { type: Sequelize.STRING, allowNull: false },
        first_name:             { type: Sequelize.STRING, allowNull: false },
        gender:                 { type: Sequelize.STRING, allowNull: false },
        birthDate:              { type: Sequelize.BIGINT },
        country:                { type: Sequelize.STRING, allowNull: false },
        status:                 { type: Sequelize.INTEGER, defaultValue: user_constants.status.INACTIVE },
        last_permission_update: { type: Sequelize.BIGINT },
        permission_granted:     { type: Sequelize.INTEGER, defaultValue: user_constants.PERMISSION_DENIED },
        otp:                    { type: Sequelize.STRING, allowNull: false },
        otp_expired_at:         { type: Sequelize.BIGINT },

    },
};
