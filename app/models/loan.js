const Sequelize = require('sequelize');
const loanConstants = require('../constants/loan');

module.exports = {
    model_name: 'Loan',
    model_props: {

        id:                     { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        amount:                 { type: Sequelize.FLOAT },
        status:                 { type: Sequelize.SMALLINT, defaultValue: loanConstants.NEW },

    },
    associations: [
        { target: 'User', type: 'belongsTo', params: { foreignKey: 'user_id' } },
        { target: 'LoanSettings', type: 'belongsTo', params: { foreignKey: 'loan_settings_id' } },
    ],
};
