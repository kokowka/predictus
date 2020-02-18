const Sequelize = require('sequelize');

module.exports = {
    model_name: 'LoanInstallment',
    model_props: {

        id:                     { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        amount:                 { type: Sequelize.FLOAT },

    },
    associations: [
        { target: 'User', type: 'belongsTo', params: { foreignKey: 'user_id' } },
        { target: 'LoanSettings', type: 'belongsTo', params: { foreignKey: 'loan_id' } },
    ],
};
