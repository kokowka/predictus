const Sequelize = require('sequelize');
Promise = require('bluebird');
const fs = require('fs');
const path = require('path');

const promise_helper = require('../../app/framework-nodejs/core/promise-helper');
const MigrationTaskManager = require('./MigrationTaskManager');
const init_models = require('../../app/helpers/init_models');
const Logger = require('../../app/framework-nodejs/core/Logger/Logger');

function MigrationWorkerProvider(Migrations, config) {
    return new MigrationWorker(Migrations, config);
}
MigrationWorkerProvider.$inject = ['Migrations', 'config'];

class MigrationWorker {
    constructor(Migrations, config) {

        this._log = new Logger('Migration worker', config.logger);
        this._Migrations = Migrations;
        this._target_db_conf = config.db.rel;
        this._target_db = new Sequelize( this._target_db_conf );

        const path_to_root = process.cwd();
        this._migrations_path = path.join(path_to_root, config.migrations_path);
    }

    async run(target_version) {
        await this._Migrations.sync({ force: false });

        if(target_version < 0) {
            return;
        }

        const last_migration = (await this._target_db.query(`SELECT * FROM "Migrations" WHERE version = ${target_version}`))[0][0];
        if ( !last_migration ) {
            await this._Migrations.create({
               version: target_version,
            });

            const migrations = await this._getMigrations();

            const migrations_to_apply = migrations
                .filter(migration => {
                    return target_version === migration.version;
                });

            await this._applyMigrations(migrations_to_apply);

            this._log.info('Migrations table was empty. Creating new migration record.');
            return;
        }

        const current_version = parseInt(last_migration.version, 10);
        if ( current_version <= target_version ) {
            this._log.info(`Target version ${target_version} is already applied`);
        }
    }

    async _clearDb(db) {
        const table_names = await db
            .query('SELECT table_name FROM information_schema.tables WHERE table_schema <> \'information_schema\'')
            .filter( ([ table_name ]) => !/pg_/i.test(table_name))
            .map( ([ table_name ]) => `"${table_name}"` );
        if ( !table_names.length ) {
            return;
        }

        await db.query('TRUNCATE TABLE ' + table_names.join(', '));
    }

    async _getMigrations() {
        const migration_file_names = await promise_helper.callAsPromise(fs.readdir, this._migrations_path);
        if ( !migration_file_names.length ) {
            return null;
        }

        return migration_file_names.map(file_name => {
            return require( path.join(this._migrations_path, file_name) );
        });
    }

    async _applyMigrations(migrations) {
        let curr_migration_index;

        try {
            await Promise.each(migrations, async (migration, ind) => {
                this._log.info(`Implementing migration to version ${migration.version}`);

                curr_migration_index = ind;
                const migration_tasks = migration.up(new MigrationTaskManager());
                await this._processMigration(migration_tasks.getTasks());
            });
        } catch(err) {
            this._migration_failure = true;
            this._log.error('Error during migration processing', err);
            await this._fallbackMigrations( migrations.slice(0, curr_migration_index).reverse() );
        }
    }

    async _processMigration(tasks) { // eslint-disable-line require-await
        return Promise.each(tasks, (task) => this._target_db.query(task.query));
    }

    async _fallbackMigrations(migrations) {
        try {
            await Promise.each( migrations, (migration) => {
                const fallback_tasks = migration.down(new MigrationTaskManager());
                return this._processMigration(fallback_tasks.getTasks());
            });
        } catch(err) {
            this._log.error('Error during migrations fallback', err);
        }

        this._migration_failure = true;
    }
}


module.exports = MigrationWorkerProvider;
