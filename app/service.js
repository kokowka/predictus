const Application = require('./framework-nodejs/core');
const Logger = require('./framework-nodejs/core/Logger/Logger');

const Validator = require('./validation-rules');

const AuthController = require('./controllers/auth');
const UserController = require('./controllers/user');

const UserMC = require('./model-controllers/user');
const SessionMC = require('./model-controllers/session');
const ContactMC = require('./model-controllers/contact');
const SmsMC = require('./model-controllers/sms');

const User = require('./models/user');
const ApplicationAnswer = require('./models/application_answer');
const ApplicationGeolocations = require('./models/application_geolocations');
const ApplicationQuestion = require('./models/application_question');
const Contact = require('./models/contact');
const FinePayment = require('./models/fine_payment');
const InstalledApp = require('./models/installed_app');
const Loan = require('./models/loan');
const LoanInstallment = require('./models/loan_installment');
const LoanInstallmentPayment = require('./models/loan_installment_payment');
const LoanPayment = require('./models/loan_payment');
const LoanSettings = require('./models/loan_settings');
const SMS = require('./models/sms');
const UploadedFile = require('./models/uploaded_file');
const Migrations = require('./models/migrations');
const Session = require('./models/session');
const Admin = require('./models/admin');

const AuthRouter = require('./routes/auth.router');
const UserRouter = require('./routes/user.router');

const MigrationWorkerProvider = require('../workers/migration_worker');
const config = require('./defaultConfig');
const {NOTIFICATION_QUEUE} = require('../app/constants/rabbit');

const {trackRequest, checkIsAuth, checkIsExistRoute} = require('./middlewares');

class PredictusHttpServer extends Application {
    constructor(config) {
        super();

        this._config = config;
        this._log = new Logger('Predictus Http Service Core', config.logger);
    }

    async start(opts = {}) {

        const options = this._config.options || {};

        this.initDependencies(opts);
        await this.initService(this._config, options);

        this.initContainer();
        this.addModelToRequest('Session', this._container.get('Session'));
        this.addMiddleware(trackRequest);
        this.addMiddleware(checkIsExistRoute);
        this.addMiddleware(checkIsAuth);
        this.mapRoutes();
        this.initRest(options);
        await this.initListeners();

        const migration_worker = MigrationWorkerProvider(this._container.get('Migrations'), config);
        await migration_worker.run(config.rel_db_version);

        return this;
    }

    initDependencies() {

        this.addDependency('config', this._config, {}, 'static');
        this.addDependency('Validator', Validator);

        // Routers
        this.addDependency('AuthRouter', AuthRouter);
        this.addDependency('UserRouter', UserRouter);

        // Controllers
        this.addDependency('AuthController', AuthController);
        this.addDependency('UserController', UserController);

        // Models
        this.addDependency('User', User, { groups: ['sequelize'] }, 'static');
        this.addDependency('ApplicationAnswer', ApplicationAnswer, { groups: ['sequelize'] }, 'static');
        this.addDependency('ApplicationGeolocations', ApplicationGeolocations, { groups: ['sequelize'] }, 'static');
        this.addDependency('ApplicationQuestion', ApplicationQuestion, { groups: ['sequelize'] }, 'static');
        this.addDependency('Contact', Contact, { groups: ['sequelize'] }, 'static');
        this.addDependency('FinePayment', FinePayment, { groups: ['sequelize'] }, 'static');
        this.addDependency('InstalledApp', InstalledApp, { groups: ['sequelize'] }, 'static');
        this.addDependency('Loan', Loan, { groups: ['sequelize'] }, 'static');
        this.addDependency('LoanInstallment', LoanInstallment, { groups: ['sequelize'] }, 'static');
        this.addDependency('LoanInstallmentPayment', LoanInstallmentPayment, { groups: ['sequelize'] }, 'static');
        this.addDependency('LoanPayment', LoanPayment, { groups: ['sequelize'] }, 'static');
        this.addDependency('LoanSettings', LoanSettings, { groups: ['sequelize'] }, 'static');
        this.addDependency('SMS', SMS, { groups: ['sequelize'] }, 'static');
        this.addDependency('UploadedFile', UploadedFile, { groups: ['sequelize'] }, 'static');
        this.addDependency('Migrations', Migrations, { groups: ['sequelize'] }, 'static');
        this.addDependency('Session', Session, { groups: ['sequelize'] }, 'static');
        this.addDependency('Admin', Admin, { groups: ['sequelize'] }, 'static');

        // Model-Controllers
        this.addDependency('UserMC', UserMC);
        this.addDependency('SessionMC', SessionMC);
        this.addDependency('ContactMC', ContactMC);
        this.addDependency('SmsMC', SmsMC);
    }

    mapRoutes(){
        this.addRoutes('/auth', this._container.get('AuthRouter').initRouter());
        this.addRoutes('/user', this._container.get('UserRouter').initRouter());
    }

    async initListeners() {
        await this.addRabbitChannel(NOTIFICATION_QUEUE);
        this.RabbitMQ.RabbitChannels[NOTIFICATION_QUEUE].prefetch(5);
    }
}

module.exports = PredictusHttpServer;
