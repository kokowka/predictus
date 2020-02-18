const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const REL_DB_SETTINGS = require('../config').db.rel;

async function init( settings = REL_DB_SETTINGS ) {
    const sequelize = new Sequelize(settings);
    const BASENAME = path.basename(__filename);

    const database = fs.readdirSync(__dirname)// eslint-disable-line no-sync
        .filter(filename => {
            return filename.indexOf('.') !== 0
                && filename !== BASENAME
                && filename.slice(-3) === '.js'
                ;
        })
        .reduce( (db, filename) => {
            const {
                model_name,
                model_attributes,
            } = require( path.join(__dirname, filename) );

            db[model_name] = sequelize.define(model_name, model_attributes );
            return db;
        }, {});

    await sequelize.sync({ force: false });

    return { database, sequelize };
}

module.exports = init;
