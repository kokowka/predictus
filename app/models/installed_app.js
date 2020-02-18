const Sequelize = require('sequelize');

module.exports = {
    model_name: 'InstalledApp',
    model_props: {

        id:             { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        package_name:   { type: Sequelize.STRING, allowNull: false },

    },
    associations: [
        { target: 'User', type: 'belongsTo', params: { foreignKey: 'user_id' } },
    ],
};
