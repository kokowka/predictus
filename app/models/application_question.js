const Sequelize = require('sequelize');
const question_constants = require('../constants/application_question');

module.exports = {
    model_name: 'ApplicationQuestion',
    model_props: {

        id:                     { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        literal:                { type: Sequelize.STRING },
        status:                 { type: Sequelize.INTEGER, defaultValue: question_constants.status.NO_ANSWER },
        country:                { type: Sequelize.STRING },
        type:                   { type: Sequelize.STRING, defaultValue: question_constants.type.DEFAULT},
        answer:                 { type: Sequelize.JSON, defaultValue: {} },

    },
};
