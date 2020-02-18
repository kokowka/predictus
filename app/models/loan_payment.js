const Sequelize = require('sequelize');

module.exports = {
    model_name: 'LoanPayment',
    model_props: {

        id:                     { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        amount:                 { type: Sequelize.FLOAT },

    },
    associations: [
        { target: 'User', type: 'belongsTo', params: { foreignKey: 'user_id' } },
        { target: 'Loan', type: 'belongsTo', params: { foreignKey: 'loan_id' } },
    ],
};
