const Sequelize = require('sequelize');

module.exports = {
    model_name: 'Migrations',
    model_props: {
        id:                     { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        version:                { type: Sequelize.INTEGER },
    }
};
