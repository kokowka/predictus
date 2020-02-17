'use strict';

require('should');
const sinon = require('sinon');
const fs = require('fs-extra');
const path = require('path');

describe('Logger module', () => {
    const Logger = require('./Logger');
    const sandbox = sinon.createSandbox();

    afterEach(() => {
        sandbox.restore();
        const logs_path = path.join(process.cwd(), 'logs');
        if ( fs.existsSync(logs_path) ) { // eslint-disable-line no-sync
            fs.removeSync(logs_path); // eslint-disable-line no-sync
        }
    });

    /**
     * @test {Logger#level}
     */
    it('Should log all', () => {
        sandbox.stub(console, 'log');
        const log = new Logger('TEST');
        log.level = 'all';

        log.info('asdf');
        log.warn('asdf');
        log.trace('adfasdf');
        log.fatal('adsf');
        log.debug('asdfa');
        log.error('asdfsa');

        sinon.assert.callCount(console.log, 6); // eslint-disable-line no-magic-numbers,no-console
    });

    /**
     * @test {Logger#level}
     */
    it('Should log if level mentioned in level option', () => {
        sandbox.stub(console, 'log');
        const log = new Logger('TEST');
        log.level = 'info';

        log.info('hello Kitty');
        log.trace('hello again');

        sinon.assert.calledOnce(console.log);// eslint-disable-line no-console
    });

    /**
     * @test {Logger#level}
     */
    it('Should log if level mentioned in array passed to level option', () => {
        sandbox.stub(console, 'log');
        const log = new Logger('TEST');
        log.level = ['trace', 'warn'];

        log.info('hello Kitty');
        log.trace('hello again');
        log.warn('helooooo');

        sinon.assert.calledTwice(console.log);// eslint-disable-line no-console
    });

    /**
     * @test {Logger#level}
     */
    it('Should log if level mentioned in object passed to level option', () => {
        sandbox.stub(console, 'log');
        const log = new Logger('TEST');
        log.level = {
            'info': { name: 'info' },
            'debug': { name: 'debug' },
        };

        log.info('hello Kitty');
        log.fatal('hello again');
        log.debug('helooooo');

        sinon.assert.calledTwice(console.log);// eslint-disable-line no-console
    });

    /**
     * @test {Logger#level}
     */
    it('Should write log to file if filename mentioned in level obj', () => {
        sandbox.stub(console, 'log');
        const log = new Logger('TEST');
        log.level = {
            'debug': { name: 'debug', filename: 'debug.logs' },
        };

        log.debug('Hey, Wazzup? )');

        sinon.assert.calledOnce(console.log);// eslint-disable-line no-console
        const logs_path = path.join(process.cwd(), 'logs');
        fs.existsSync(path.join(logs_path, 'debug.logs')).should.be.true(); // eslint-disable-line no-sync
    });

    /**
     * @test {Logger#filename}
     */
    it('Should log to log to file if global filename defined', () => {
        sandbox.stub(console, 'log');
        const log = new Logger('TEST');
        log.level = 'warn';
        log.filename = 'logs';

        log.warn('asdfasdf');

        sinon.assert.calledOnce(console.log);// eslint-disable-line no-console
        const logs_path = path.join(process.cwd(), 'logs');
        fs.existsSync(logs_path).should.be.true(); // eslint-disable-line no-sync
    });

    /**
     * @test {Logger#addLevel}
     */
    it('Should add additional log level', () => {
        sandbox.stub(console, 'log');
        const log = new Logger('TEST');
        log.level = 'warn';

        log.warn('asdfasdf');

        log.addLevel('info');

        log.warn('asdfasdf');
        log.info('asdfasdf');

        sinon.assert.calledThrice(console.log);// eslint-disable-line no-console
    });

    /**
     * @test {Logger#off}
     */
    it('Should mute all logs', () => {
        sandbox.stub(console, 'log');
        const log = new Logger('TEST');
        log.level = 'all';
        log.off = true;

        log.warn('adsfasdf');
        log.fatal('adsfasdf');
        log.info('adsfasdf');
        log.error('adsfasdf');

        sinon.assert.notCalled(console.log);// eslint-disable-line no-console
    });

    /**
     * @test {Logger#muteLevels}
     */
    it('Should mute specified logs', () => {
        sandbox.stub(console, 'log');
        const log = new Logger('TEST');
        log.level = 'all';

        log.warn('asdfasdf');
        log.fatal('dsfsdfa');
        log.debug('asdfasd');

        log.muteLevels('warn', 'fatal');

        log.warn('asdfasdf');
        log.fatal('dsfsdfa');
        log.debug('asdfasd');

        sinon.assert.callCount(console.log, 4);// eslint-disable-line no-console,no-magic-numbers
    });

    /**
     * @test {Logger#unmuteLevels}
     */
    it('Should unmute specified log levels', () => {
        sandbox.stub(console, 'log');
        const log = new Logger('TEST');
        log.level = 'all';

        log.muteLevels('warn', 'fatal');
        log.unmuteLevels('warn');

        log.warn('asdfasdf');
        log.fatal('asdfasdfas');

        sinon.assert.calledOnce(console.log); // eslint-disable-line no-console
    });
});
