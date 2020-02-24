const Sequelize = require('sequelize');
const session_constants = require('../constants/session');

module.exports = {
    model_name: 'Admin',
    model_props: {

        id:                         { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        login:                      { type: Sequelize.STRING, required: true, unique: true },
        password_hash:              { type: Sequelize.STRING, required: false },
        password_salt:              { type: Sequelize.STRING, required: false },
        reset_password_token:       { type: Sequelize.STRING, required: false },
        reset_password_expires_at:  { type: Sequelize.BIGINT, required: false },
        role:                       { type: Sequelize.STRING, required: false },
        session_token:          { type: Sequelize.STRING },
        refresh_token:          { type: Sequelize.STRING },
        status:                 { type: Sequelize.SMALLINT, allowNull: false, defaultValue: session_constants.status.ACTIVE },
        expires_at:             { type: Sequelize.BIGINT },

    },

    associations: [
        { target: 'Country', type: 'belongsTo', params: { foreignKey: 'country_id' } },
    ],
};
