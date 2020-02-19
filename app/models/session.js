const Sequelize = require('sequelize');
const session_constants = require('../constants/session');

module.exports = {
    model_name: 'Session',
    model_props: {
        id:                     { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        session_token:          { type: Sequelize.STRING, allowNull: false },
        refresh_token:          { type: Sequelize.STRING, allowNull: false },
        status:                 { type: Sequelize.SMALLINT, allowNull: false, defaultValue: session_constants.status.ACTIVE },
        expires_at:             { type: Sequelize.BIGINT },
    },

    associations: [
        { target: 'User', type: 'belongsTo', params: { foreignKey: 'user_id' } },
    ],
};
