const Sequelize = require('sequelize');

module.exports = {
    model_name: 'InstalledApp',
    model_props: {

        id:             { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        package_name:   { type: Sequelize.STRING, allowNull: false },
        date_created:   { type: Sequelize.BIGINT },
        date_updated:   { type: Sequelize.BIGINT },

    },
    associations: [
        { target: 'User', type: 'belongsTo', params: { foreignKey: 'user_id' } },
    ],
};
