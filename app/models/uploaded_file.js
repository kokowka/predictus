const Sequelize = require('sequelize');

module.exports = {
    model_name: 'UploadedFile',
    model_props: {

        id:             { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        url:            { type: Sequelize.STRING, allowNull: false },

    },
    associations: [
        { target: 'User', type: 'belongsTo', params: { foreignKey: 'user_id' } },
    ],
};
