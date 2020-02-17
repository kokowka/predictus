const Sequelize = require('sequelize');

module.exports = {
    model_name: 'LoanSettings',
    model_props: {

        id:                     { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        name:                   { type: Sequelize.STRING },
        duration:               { type: Sequelize.BIGINT },
        amount_from:            { type: Sequelize.FLOAT },
        amount_to:              { type: Sequelize.FLOAT },
        interest_rate:          { type: Sequelize.FLOAT },
        fine:                   { type: Sequelize.FLOAT },
        date_created:           { type: Sequelize.BIGINT },
        date_updated:           { type: Sequelize.BIGINT },

    },
};
