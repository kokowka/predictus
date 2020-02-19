// WARNING!!!!! This module should not be imported directly
const path = require('path');
const Logger = require('../Logger/Logger');
const {trackRequest} = require('../../../middlewares');
const bodyParser = require('body-parser');
const response = require('../../../helpers/response');

class RestCore {
    constructor() {
        this._routes = [];

        this._log = new Logger('REST_CORE');
        this._log.level = 'all';
    }

    get server() {
        return this._server;
    }

    initApp(options) {
        if ( options.REST ) {
            const rest_options = options.REST;
            if ( !rest_options.hasOwnProperty('cors') ) {
                rest_options.cors = true;
            }
            const { express, helmet } = this._requireOptPackages('express', 'helmet');
            let cors;
            if ( rest_options.cors ) {
                cors = this._requireOptPackages('cors').cors;
            }
            this._app = express();

            this._initMiddleware(express, cors, helmet);
            this._app.use(trackRequest);
            if ( this._restCustomizer ) {
                this._restCustomizer(this._app);
            }
            this._initRoutes();
            this._app.use((err, req, res, next) => {
                delete err.stack;
                this._log.error(err);
                res.status(err.status).send(response.sendError(err.status, err.message));
                next(err);
            });
            
            this._restPort = rest_options.hasOwnProperty('port') ? rest_options.port : this._DEFAULT_PORT;
            this._restHost = rest_options.hasOwnProperty('host') ? rest_options.host : this._DEFAULT_HOST;
            this._server = this._app.listen(this._restPort, this._restHost, () => {
                this._log.trace(`Application started listening on port ${this._restPort}`);
            });
        } else {
            throw new Error('Provide rest options first');
        }
    }

    addRestCustomizer(customizerFunc) {
        this._restCustomizer = customizerFunc;
    }

    addRoutes(url, router) {
        this._routes.push({ url, router });
    }

    _initMiddleware(express, cors, helmet) {
        if ( cors ) {
            this._app.use(cors());
        }

        this._app.use(bodyParser.json());
        this._app.use(helmet());
        this._app.use(express.urlencoded({extended: true}));
        this._app.use(express.json({limit: '5mb'}));
        this._app.use(express.static(path.join(__dirname, 'public')));
    }

    _initRoutes() {
        this._routes.forEach(route => {
            this._app.use(route.url, route.router);
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

module.exports = RestCore;
