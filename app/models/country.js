const Sequelize = require('sequelize');

module.exports = {
    model_name: 'Country',
    model_props: {

        id:                     { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        name:                   { type: Sequelize.STRING, allowNull: false },

    },
    associations: [
        { target: 'Currency', type: 'belongsTo', params: { foreignKey: 'currency_id' } },
    ],
};
