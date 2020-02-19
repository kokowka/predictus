const config = require('./config');

module.exports = {
    rel_db_version: config.rel_db_version !== undefined ? config.rel_db_version: -1,
    migrations_path: config.migrations_path !== undefined ? config.migrations_path: 'app/migrations',

    db: {
        rel: {
            host: config.db.rel.host !== undefined ? config.db.rel.host: 'localhost',
            port: config.db.rel.port !== undefined ? config.db.rel.port: '5432',
            username: config.db.rel.username !== undefined ? config.db.rel.username: 'predictus',
            password: config.db.rel.password !== undefined ? config.db.rel.password: 'predictus',
            database: config.db.rel.database !== undefined ? config.db.rel.database: 'predictus',
            dialect: config.db.rel.dialect !== undefined ? config.db.rel.dialect: 'postgres',
            logging: config.db.rel.logging !== undefined ? config.db.rel.logging: false,
            define: { freezeTableName: config.db.rel.define.freezeTableName !== undefined ? config.db.rel.define.freezeTableName: true }, // disable table names pluralization
        },
    },

    logger: {
        level: config.logger.level !== undefined ? config.logger.level : 'all',
        off: config.logger.off !== undefined ?  config.logger.off : false,
    },

    options: {
        REST : {
            host : config.options.REST.host !== undefined ? config.options.REST.host : 'localhost' ,
            port : config.options.REST.port !== undefined ? config.options.REST.port : 3000 ,
        } ,
    },
    sms: {
        is_test: config.sms.is_test !== undefined ? config.sms.is_test: true,
        SMS_LENGTH: config.sms.SMS_LENGTH !== undefined ? config.sms.SMS_LENGTH: 5,
        expired_time: config.sms.expired_time !== undefined ? config.sms.expired_time: 3 * 60 * 1000,
    },

    app_data: {
        ios: config.app_data.ios !== undefined ? config.app_data.ios: '0.0.1',
        android: config.app_data.android !== undefined ? config.app_data.android:'0.0.1'
    }
};
