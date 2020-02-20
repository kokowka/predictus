// WARNING!!!!! This module should not be imported directly
const Logger = require('../Logger/Logger');
const promise_helper = require('../promise-helper');
Promise = require('bluebird');

class DatabaseCore {
    constructor() {
        this._log = new Logger('DATABASE_CORE');
        this._log.level = 'all';
    }

    async clearDb() {
        await this._clearMongoDb();
        await this._clearRedisDb();
        await this._clearRelDb();
    }

    async initDatabase(config, container) {
        const dbConfig = config.db || {};
        let db_connected = false;

        if ( dbConfig.mongodb ) {
            db_connected = true;
            await this._initMongoDB(dbConfig);
        }
        if ( dbConfig.redis ) {
            db_connected = true;
            await this._initRedisDB(dbConfig);
        }
        if ( dbConfig.rel ) {
            db_connected = true;
            await this._initRelDB(dbConfig, container);
        }
        
        if ( !db_connected ) {
            this._log.warn('Service was not connected to any database');
        }
    }

    _clearMongoDb() {
        if ( !this._mongoose ) {
            return;
        }

        return Promise.resolve(Object.values(this._mongoose.connection.collections))
            .mapSeries(collection => this._mongoose.connection.collections[collection.name].drop())
            .then(() => this._log.trace('Cleared up database'))
            .catch(err => this._log.error('Error occured when tried to clear MongoDB', err));
    }

    _clearRedisDb() {
        if ( !this._Nohm ) {
            return;
        }
        
        const modelCache = this._Nohm.modelCache;
        const modelNames = Object.keys(modelCache);
        
        return Promise.each(modelNames, async model_name => {
            const records = await modelCache[model_name].findAndLoad();
            return Promise.all( records.map(rec => rec.remove()) );
        });
    }

    async _clearRelDb() {
        if ( !this._sequelizeDatabases ) {
            return;
        }

        await Promise.each(this._sequelizeDatabases, async db => {
            const table_names = await db
                .query('SELECT table_name FROM information_schema.tables WHERE table_schema <> \'information_schema\'')
                .filter( ([ table_name ]) => !/pg_/i.test(table_name))
                .map( ([ table_name ]) => `"${table_name}"` );

            await db.query('TRUNCATE TABLE ' + table_names.join(', '));
        });
    }

    async _initMongoDB(dbConfig) {
        const url = dbConfig.mongodb.url;
        const packages = this._requireOptPackages('mongoose', 'mongoose-auto-increment');
        const mongoose = packages.mongoose;
        const autoIncrement = packages['mongoose-auto-increment'];
        this._mongoose = mongoose;
        
        try {
            const connection = await promise_helper.callAsPromise(mongoose.createConnection.bind(mongoose), dbConfig.mongodb.url);
            autoIncrement.initialize(connection);
            await promise_helper.callAsPromise(mongoose.connect.bind(mongoose), dbConfig.mongodb.url);
            this._log.trace(`Successfully connected to mongodb url ${url}`);
        } catch(err) {
            this._log.error(`Failed to connect to mongodb url ${url}`, err);
        }
    }

    async _initRedisDB(dbConfig) {
        const { nohm, redis } = this._requireOptPackages('nohm', 'redis');
        const Nohm = nohm.Nohm;
        this._Nohm = Nohm;

        const redisClient = redis.createClient();
            
        try {
            await promise_helper.callAsPromise(redisClient.on, 'connect');
            this._log.trace('Successfully connected to redis');
        } catch(err) {
            this._log.error('Failed to connect to redis', err);
        }

        try {
            const db = dbConfig.redis.db;
            await promise_helper.callAsPromise(redisClient.select, db);
            this._log.trace(`Successfully connected to redis DB ${db}`);
        } catch(err) {
            this._log.error('Failed to connect to redis DB', err);
        }

        Nohm.setClient(redisClient);
    }

    async _initRelDB(dbConfig, container) {
        const Sequelize = this._requireOptPackages('sequelize').sequelize;
        
        let rel_config = dbConfig.rel;
        if ( !(rel_config instanceof Array) ) {
            rel_config = [ rel_config ];
        }
        const many_dbs = rel_config.length > 1;
        this._sequelizeDatabases = [];

        await Promise.each(rel_config, async conf => {
            this._requirePackagesForRelationalDatabase(conf.dialect);

            if ( many_dbs && (!conf.$group || !conf.$dependencyName) ) {
                throw new Error('Options $group and $dependencyName are required for multiple relational databases');
            }

            const db_instance = new Sequelize(conf);
            this._sequelizeDatabases.push(db_instance);
            const group_name = conf.$group || 'sequelize';
            const dependency_name = conf.$dependencyName || 'sequelize';

            const models = container.getByGroup(group_name, true);

            this._makeRelationalDatabaseAssotiations(models, db_instance, container);

            container.static(dependency_name, db_instance);

            await db_instance.sync({ force: false });
            const db_name = conf.database;

            try {
                await db_instance.authenticate();
                this._log.trace(`Successfully connected to Relational DB ${db_name}`);
            } catch(err) {
                this._log.error(`Failed to connect to Relational DB ${db_name}`, err);
            }
        });
    }

    _requirePackagesForRelationalDatabase(dialect) {
        switch(dialect) {
            case 'mysql':
                this._requireOptPackages('mysql2');
                break;
            case 'postgres':
                this._requireOptPackages('pg', 'pg-hstore');
                break;
            case 'mariadb':
                this._requireOptPackages('mariadb');
                break;
            case 'mssql':
                this._requireOptPackages('tedious');
                break;
            case 'sqlite':
                break;
            default:
                this._log.error('Unsupported relational db dialect', dialect);
                throw new Error();
        }
    }

    _makeRelationalDatabaseAssotiations(models, db_instance, container) {
        const models_to_associate = models.reduce((insts, model) => {
            const { model_name, model_props, model_options, associations } = model;
            const modelInstance = db_instance.define(model_name, model_props, model_options || {});
            container.static(model.$name, modelInstance, model.$groups);

            insts[model_name] = { instance: modelInstance, associations: associations };
            return insts;
        }, {});

        Object.entries(models_to_associate).forEach( ([model]) => {
            const associations = model.associations;
            if ( !associations ) {
                return;
            }

            const modelInstance = model.instance;

            associations.forEach(association => {
                const { target, type, params } = association;
                
                if ( !models_to_associate[target] ) {
                    throw new Error(`Association model ${target} does not exist`);
                }
                const target_instance = models_to_associate[target].instance;
                
                modelInstance[type](target_instance, params);
            });
        });
    }

    _requireOptPackages(...packages) {
        const packageObj = {};
        
        packages.forEach(pack => {
            try {
                packageObj[pack] = require(pack);
            } catch(err) {
                throw new Error(`${pack} package is not installed`);
            }
        });

        return packageObj;
    }
}

module.exports = DatabaseCore;
