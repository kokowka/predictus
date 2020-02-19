module.exports = {

    rel_db_version: 1,
    migrations_path: 'app/migrations',

    db: {
        rel: {
            host: 'localhost',
            port: '5432',
            username: 'username',
            password: 'password',
            database: 'predictus',
            dialect: 'postgres',
            logging: false,
            define: { freezeTableName: true }, // disable table names pluralization
        },
    },

    logger: {
        level: 'all',
        off: false,
    },

    options: {
        REST : {
            host : 'localhost' ,
            port : 3000 ,
        } ,
    },
    sms: {
        is_test: true,
        SMS_LENGTH: 5,
        expired_time: 3 * 60 * 1000,
    },
    app_data: {
        ios: '0.0.1',
        android: '0.0.1'
    }
};
