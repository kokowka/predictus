const Sequelize = require('sequelize');

module.exports = {
    model_name: 'ApplicationAnswer',
    model_props: {

        id:             { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        user_id:        { type: Sequelize.BIGINT },
        text:           { type: Sequelize.STRING, allowNull: false },
        date_created:   { type: Sequelize.BIGINT },
        date_updated:   { type: Sequelize.BIGINT },

    },
    associations: [
        { target: 'ApplicationQuestion', type: 'belongsTo', params: { foreignKey: 'question_id' } },
        { target: 'User', type: 'belongsTo', params: { foreignKey: 'user_id' } },
    ],
};
