const path = require('path');
const fs = require('fs');

const INFO = 'info';
const WARN = 'warn';
const ERROR = 'error';
const FATAL = 'fatal';
const TRACE = 'trace';
const DEBUG = 'debug';

class Logger {

    constructor(name, options) {
        this._name = name;

        this._available_levels = {
            [INFO]:     '\x1b[32m',
            [WARN]:     '\x1b[33m',
            [ERROR]:    '\x1b[31m',
            [FATAL]:    '\x1b[35m',
            [TRACE]:    '\x1b[34m',
            [DEBUG]:    '\x1b[36m',
        };
        this._RESET_COLORS = '\x1b[0m';

        if (options) {
            if ( options.hasOwnProperty('filename') ) {
                this.filename = options.filename;
            }
            if ( options.hasOwnProperty('level') ) {
                this.level = options.level;
            }
            if ( options.hasOwnProperty('off') ) {
                this.off = options.off;
            }
        }

        this._default_log_path = path.join(process.cwd(), 'logs');
    }

    /**
     * Creates information log
     * @param  {...any} messages messages that should be concated and logged
     */
    info(...messages) {
        this._createLog(INFO, messages);
    }

    /**
     * Creates warning log
     * @param  {...any} messages messages that should be concated and logged
     */
    warn(...messages) {
        this._createLog(WARN, messages);
    }

    /**
     * Creates error log
     * @param  {...any} messages messages that should be concated and logged
     */
    error(...messages) {
        this._createLog(ERROR, messages);
    }

    /**
     * Creates fatal error log
     * @param  {...any} messages messages that should be concated and logged
     */
    fatal(...messages) {
        this._createLog(FATAL, messages);
    }

    /**
     * Creates trace log (should be used preferably for system deploying logs)
     * @param  {...any} messages Messages that should be concated and logged
     */
    trace(...messages) {
        this._createLog(TRACE, messages);
    }

    /**
     * Creates debug log
     * @param  {...any} messages messages that should be concated and logged
     */
    debug(...messages) {
        this._createLog(DEBUG, messages);
    }

    /**
     * Add additional log level
     * @param {String} level log level to add
     * @param {String} filename Optional. Filename to which this log should be recorded
     */
    addLevel(level, filename = false) {
        if ( !this._levels ) {
            this._levels = {};
        }
        if ( this._available_levels[level] ) {
            this._createLogFile(filename);
            this._levels[level] = { filename };
        } else {
            throw new Error(`Log level ${level} is not available`);
        }
    }

    /**
     * Add additional log levels
     * @param {Array<Object>} levels level object used to configure log level
     */
    addLevels(levels) {
        levels.forEach( lvl => this.addLevel(lvl.name, lvl.filename) );
    }

    /**
     * Mute configured log levels
     * @param {...String} levels level names that should be muted
     */
    muteLevels(...levels) {
        if ( !this._levels ) {
            throw new Error('Levels are not initialized');
        }
        
        levels.forEach( lvl => {
            if ( this._levels[lvl] ) {
                this._levels[lvl].disabled = true;
            }
        });
    }

    /**
     * Unmute configured log levels
     * @param {...String} levels level names that should be unmuted
     */
    unmuteLevels(...levels) {
        if ( !this._levels ) {
            throw new Error('Levels are not initialized');
        }

        levels.forEach( lvl => {
            if ( this._levels[lvl] ) {
                delete this._levels[lvl].disabled;
            }
        });
    }

    set level(levels) {
        const lvlValues = Object.values(levels);
        if ( levels === 'all' ) {
            this._levels = {};
            Object.keys(this._available_levels)
                .forEach(lvl => {
                    this._levels[lvl] = {};
                });
        
        } else if ( typeof levels === 'string' && this._available_levels[levels] ) {
            this._levels = { [levels]: {} };
        
        } else if ( (levels instanceof Array) && levels.every(lvl => this._available_levels[lvl]) ) {
            this._levels = {};
            levels.forEach( lvl => (this._levels[lvl] = {}) );
        
        } else if ( 
            (levels instanceof Object) 
            && lvlValues.every(lvl => this._available_levels[lvl.name]) 
        ) {
            this._levels = levels;
            if (!fs.existsSync(this._default_log_path)) { // eslint-disable-line no-sync
                fs.mkdirSync(this._default_log_path); // eslint-disable-line no-sync
            }
            if ( lvlValues.some(lvl => lvl.filename) ) {
                lvlValues.forEach(this._createLogFile.bind(this));
            }

        } else {
            throw new Error('Invalid log levels');
        }
    }
    
    set filename(fileName) {
        if ( typeof fileName === 'string' ) {
            this._createLogFile({filename: fileName});
            this._filename = fileName;
        }
    }

    set off(val) {
        this._off = val;
    }

    _createLog(level, messages) {
        if (
            this._off
            || !this._levels || !this._levels[level] || this._levels[level].disabled
        ) {
            return;
        }
        let logHeader = this._composeCurrDate() + ' [' + level.toUpperCase() + '] ' + this._name;

        console.log(this._available_levels[level], logHeader, this._RESET_COLORS, ...messages); // eslint-disable-line no-console
        
        const logPath = this._levels[level].filename 
            ? this._levels[level].filename 
            : this._filename;
        if (logPath) {
            fs.appendFile(logPath, logHeader + ' ' + messages.join(' ') + '\n', (err) => {
                if (err) throw new Error(err);
            });
        }
    }

    _createLogFile({ filename, name }) {
        if (!filename) {
            return;
        
        } else if ( typeof filename !== 'string' ) {
            throw new Error('Invalid filename format');
        }
        let file_path = filename;
        if ( name ) {
            file_path = path.join(this._default_log_path, filename);
            this._levels[name].filename = file_path;
        }
        if ( !fs.existsSync(file_path) ) { // eslint-disable-line no-sync
            fs.writeFileSync(file_path, ''); // eslint-disable-line no-sync
        }
    }

    _composeCurrDate() {
        const addZero = (val) => val.toString().length < 2 ? '0' + val : val;
        const now = new Date();

        const date = now.getFullYear() + '-' + addZero(now.getMonth() + 1) + '-' + addZero(now.getDate());
        const time = addZero(now.getHours()) + ':' + addZero(now.getMinutes()) +
            ':' + addZero(now.getSeconds()) + '.' + now.getMilliseconds();

        return '[' + date + ' ' + time + ']';
    }
}

module.exports = Logger;
