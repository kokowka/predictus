'use strict';

const path = require('path');

const promise_helper = require('./promise-helper');
const { Container } = require('./Dic/index');
const Logger = require('./Logger/Logger');
const RestCore = require('./rest/RestCore.class');
const DatabaseCore = require('./database/DatabaseCore.class');
Promise = require('bluebird'); // eslint-disable-line no-global-assign

module.exports = class Application {

    constructor() {
        this._routes = [];
        this._jobs = [];
        this._container = new Container();
        this._restCore = new RestCore();
        this._databaseCore = new DatabaseCore();
        
        this._log = new Logger('CORE');
        this._log.level = 'all';

        this._DEFAULT_PORT = 3000;
        this._DEFAULT_HOST = 'localhost';
    }

    /**
     * Initialize REST API
     * @param {Object} config REST API configuration object
     */
    async initService(config, options = {}) {
        if ( options.job ) {
            const { scheduler } = this._requireOptPackages('node-schedule');
            this._initJobs(scheduler);
        }
        if ( options.rabbit ) {
            this._requireOptPackages('amqplib');
            const RabbitMQ = require('./RabbitMQ/RabbitMQ');
            
            const RabbitMQInst = new RabbitMQ(options.rabbit);
            this.RabbitMQ = RabbitMQInst;
            this.addDependency('RabbitMQ', RabbitMQInst, {}, 'static');
        }
        if ( options.notifications ) {

            const { request, apn } = this._requireOptPackages('request', 'apn');
            const Notification = require('./Notification/Notification');
            Notification._injectLibs({ request, apn });
            this.Notification = Notification;

            this.NotificationWorker = require('./Notification/Notification-Worker');
        }
        if ( options.mailer ) {
            const { nodemailer } = this._requireOptPackages('nodemailer');
            const Mailer = require('./Mailer/Mailer');
            
            this.addDependency('Mailer', new Mailer(nodemailer, options.mailer), {}, 'static');
        }

        if ( !options.initDBSeparately ) {
            await this._databaseCore.initDatabase(config, this._container);
        }
    }

    get server() {
        return this._restCore.server;
    }

    get addRestCustomizer() {
        return this._restCore.addRestCustomizer.bind(this._restCore);
    }

    get addRoutes() {
        return this._restCore.addRoutes.bind(this._restCore);
    }

    get clearDb() {
        return this._databaseCore.clearDb.bind(this._databaseCore);
    }

    initRest(options) {
        this._restCore.initApp(options);
    }

    initContainer() {
        this._container.init();
    }

    /**
     * Add reccurent or one-time job
     * @param {String} name job name. Should be unique.
     * @param {String|Object|Date} schedule Job schedule, could be cron time string, date object or 
     *    object of specific format
     * @param {Function} jobFunc job function
     */
    addJob(name, schedule, jobFunc) {
        this._jobs.push({ name, schedule, jobFunc }); 
    }

    /**
     * Add dependencies to Bottle container
     * @param {String} name dependency name. Should be unique
     * @param {Class} dependency dependency class
     */
    addDependency(name, dependency, options, type='provider') {
        if ( !this._container[type] ) {
            throw new Error(`Dependency type ${type} is not supported`);
        }
        this._container[type](name, dependency, options);
    }

    /**
     * Adds RabbitMQ Queue Listener
     * @param {Channel} channel channel instance to which queue belongs
     * @param {String} queue_name target queue name
     * @param {Function} listener target queue listener
     */
    async addRabbitQueueListener(channel, queue_name, listener) {
        try {
            this._container.get('RabbitMQ');
        } catch(err) {
            throw new Error('Dependency container not inited or RabbitMQ was not injected');
        }
        if ( !(channel instanceof this.RabbitMQ.Channel) ) {
            throw new Error('Pass channel instance as the first argument');
        }
        if ( !this.RabbitMQ.Queues[queue_name] ) {
            throw new Error('Please refer to queue names through RabbitMQ dependency');
        }

        await this.RabbitMQ.assertQueue(channel, queue_name);

        channel.consume(queue_name, async message => {
            const msg = await this.RabbitMQ.parseMessage(message);
            listener(channel, msg, { rawMessage: message });
        });
    }

    /**
     * Adds RabbitMQ channel
     * @param {String} channel_name channel name
     */
    async addRabbitChannel(channel_name) {
        try {
            this._container.get('RabbitMQ');
        } catch(err) {
            throw new Error('Dependency container not inited or RabbitMQ was not injected');
        }
        if ( !this.RabbitMQConnection ) {
            this.RabbitMQConnection = await this.RabbitMQ.connect();
        }

        this.RabbitMQ.RabbitChannels[channel_name] = await this.RabbitMQ.createCh(this.RabbitMQConnection);
    }

    /**
     * Initialize periodic or one-time jobs
     * @param {Scheduler} scheduler node-schedule module
     */
    _initJobs( scheduler ) {
        this._jobs.forEach(job => {
            const scheduledJob = scheduler.scheduleJob(job.schedule, job.jobFunc(this._container));
            job.ref = scheduledJob;
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

};
