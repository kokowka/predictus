const Sequelize = require('sequelize');

module.exports = {
    model_name: 'ApplicationGeolocation',
    model_props: {

        id:             { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        lat:            { type: Sequelize.FLOAT },
        lng:            { type: Sequelize.FLOAT },
        alt:            { type: Sequelize.FLOAT },
        last_update:    { type: Sequelize.BIGINT },

    },
    associations: [
        { target: 'User', type: 'belongsTo', params: { foreignKey: 'user_id' } },
    ],
};
