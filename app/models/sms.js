const Sequelize = require('sequelize');

module.exports = {
    model_name: 'SMS',
    model_props: {

        id:             { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        local_id:       { type: Sequelize.STRING, allowNull: false },
        sender:         { type: Sequelize.STRING, allowNull: false },
        text:           { type: Sequelize.STRING, allowNull: false },
        message_date:   { type: Sequelize.BIGINT },
        date_created:   { type: Sequelize.BIGINT },
        date_updated:   { type: Sequelize.BIGINT },

    },
    associations: [
        { target: 'User', type: 'belongsTo', params: { foreignKey: 'user_id' } },
    ],
};
