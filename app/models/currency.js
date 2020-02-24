const Sequelize = require('sequelize');

module.exports = {
    model_name: 'Currency',
    model_props: {

        id:                     { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        name:                   { type: Sequelize.STRING, allowNull: false },

    },
};
