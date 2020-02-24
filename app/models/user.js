const Sequelize = require('sequelize');
const user_constants = require('../constants/user');

module.exports = {
    model_name: 'User',
    model_props: {

        id:                     { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        phone_number:           { type: Sequelize.STRING, allowNull: false },
        last_name:              { type: Sequelize.STRING },
        first_name:             { type: Sequelize.STRING },
        gender:                 { type: Sequelize.STRING },
        birth_date:             { type: Sequelize.BIGINT },
        status:                 { type: Sequelize.INTEGER, defaultValue: user_constants.status.INACTIVE },
        last_permission_update: { type: Sequelize.BIGINT },
        permission_granted:     { type: Sequelize.INTEGER, defaultValue: user_constants.PERMISSION_DENIED },
        last_contact_update:    { type: Sequelize.BIGINT },
        last_sms_update:        { type: Sequelize.BIGINT },
        last_application_update:{ type: Sequelize.BIGINT },
        last_location_update:   { type: Sequelize.BIGINT },
        otp:                    { type: Sequelize.STRING, allowNull: false },
        otp_expired_at:         { type: Sequelize.BIGINT },

    },

    associations: [
        { target: 'Country', type: 'belongsTo', params: { foreignKey: 'country_id' } },
    ],
};
