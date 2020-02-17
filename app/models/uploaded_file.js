const Sequelize = require('sequelize');

module.exports = {
    model_name: 'UploadedFile',
    model_props: {

        id:             { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        url:            { type: Sequelize.STRING, allowNull: false },
        date_created:   { type: Sequelize.BIGINT },
        date_updated:   { type: Sequelize.BIGINT },

    },
    associations: [
        { target: 'User', type: 'belongsTo', params: { foreignKey: 'user_id' } },
    ],
};
