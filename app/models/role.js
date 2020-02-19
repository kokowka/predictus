const Sequelize = require('sequelize');

module.exports = {
    model_name: 'Role',
    model_props: {

        id:         { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        role:       { type: Sequelize.STRING, allowNull: false }

    },

    associations: [
        { target: 'Admin', type: 'belongsTo', params: { foreignKey: 'admin_id' } },
    ],
};
