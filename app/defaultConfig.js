const config = require('./config');

const MESSAGE = 'message';
const NEW_CHAT = 'new_chat';
const RECEIVE_CALL = 'receive_call';

module.exports = {
    rel_db_version: config.rel_db_version !== undefined ? config.rel_db_version: -1,
    migrations_path: config.migrations_path !== undefined ? config.migrations_path: 'app/migrations',

    db: {
        rel: {
            host: config.db && config.db.rel && config.db.rel.host !== undefined ? config.db.rel.host: 'localhost',
            port: config.db && config.db.rel && config.db.rel.port !== undefined ? config.db.rel.port: '5432',
            username: config.db && config.db.rel && config.db.rel.username !== undefined ? config.db.rel.username: 'predictus',
            password: config.db && config.db.rel && config.db.rel.password !== undefined ? config.db.rel.password: 'predictus',
            database: config.db && config.db.rel && config.db.rel.database !== undefined ? config.db.rel.database: 'predictus',
            dialect: config.db && config.db.rel && config.db.rel.dialect !== undefined ? config.db.rel.dialect: 'postgres',
            logging: config.db && config.db.rel && config.db.rel.logging !== undefined ? config.db.rel.logging: false,
            define: { freezeTableName: config.db && config.db.rel && config.db.rel.define && config.db.rel.define.freezeTableName !== undefined ? config.db.rel.define.freezeTableName: true }, // disable table names pluralization
        },
    },

    logger: {
        level: config.logger && config.logger.level !== undefined ? config.logger.level : 'all',
        off: config.logger && config.logger.off !== undefined ? config.logger.off : false,
    },

    options: {
        REST : {
            host : config.options && config.options.REST && config.options.REST.host !== undefined ? config.options.REST.host : 'localhost',
            port : config.options && config.options.REST && config.options.REST.port !== undefined ? config.options.REST.port : 3000,
        },
        rabbit: {
            connect_url: config.options && config.options.REST && config.options.REST.rabbit !== undefined ? config.options.REST.rabbit : 'amqp://localhost',
        },
        notifications: {
            data_types: {
                MESSAGE,
                NEW_CHAT,
                RECEIVE_CALL,
            },
            fcm: {
                url: 'https://fcm.googleapis.com/fcm/send',
                server_key: config.options && config.options.notifications && config.options.notifications.fcm && config.options.notifications.fcm.server_key !== undefined ? config.options.notifications.fcm.server_key : '',
            },
        },
    },
    sms: {
        is_test: config.sms && config.sms.is_test !== undefined ? config.sms.is_test: true,
        SMS_LENGTH: config.sms && config.sms.SMS_LENGTH !== undefined ? config.sms.SMS_LENGTH: 5,
        expired_time: config.sms && config.sms.expired_time !== undefined ? config.sms.expired_time: 3 * 60 * 1000,
    },

    app_data: {
        ios: config.app_data && config.app_data.ios !== undefined ? config.app_data.ios: '0.0.1',
        android: config.app_data && config.app_data.android !== undefined ? config.app_data.android:'0.0.1',
    },
};
