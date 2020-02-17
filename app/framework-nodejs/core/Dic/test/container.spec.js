const Container = require('../container');
require('should');

describe('Container', () => { // eslint-disable-line max-lines-per-function
    const helloService = require('./single_provider');
    const heyService = require('./provider_with.deps');
    const staticHello = require('./static_service');
    const providerWrongDeps = require('./provider_require_nonexist');
    const providerWithGroupInject = require('./provider_with_group_injection');

    let container;
    before(() => {
        container = new Container();
    });

    afterEach(() => {
        container.clear();
    });

    /**
     * @test {Container#init}
     */
    it('should throw error if trying to get service before calling init method', (done) => {
        try {
            container.provider('helloService', helloService);
            container.get('helloService');

            done(new Error('This should throw'));
        } catch(err) {
            done();
        }
    });

    /**
     * @test {Container#init}
     */
    it('Should throw error if trying to inject after calling init method', (done) => {
        try {
            container.init();
            container.provider('sayHello', helloService);

            done(new Error('This should throw'));
        } catch(err) {
            done();
        }
    });


    /**
     * @test {Container#init}
     */
    it('Should throw error if trying to require non existent dependency from service', (done) => {
        try {
            container.provider('requireNonexistent', providerWrongDeps);
            container.init();

            done(new Error('This should throw'));
        } catch(err) {
            done();
        }
    });


    /**
     * @test {Container#init}
     */
    it('Should inject group dependencies if they are mentioned in $injects', () => {
        container.provider('helloService', helloService, { groups: ['testGroup'] });
        container.static('name', staticHello, { groups: ['testGroup'] });
        container.provider('hello', heyService, { groups: ['otherGroup'] });
        container.provider('ServiceWithGroups', providerWithGroupInject);

        container.init();

        const serviceWithGroups = container.get('ServiceWithGroups');
        const testGroupInjects = serviceWithGroups.testGroup;
        testGroupInjects.length.should.be.eql(2);
        testGroupInjects.some(inj => inj.$name === 'helloService').should.be.true();
    });

    /**
     * @test {Container#get}
     */
    it('Should throw error if trying to get non existent service', (done) => {
        try {
            container.provider('helloService', helloService);
            container.init();
            container.get('somethingNoninjected');

            done(new Error('This should throw'));
        } catch(err) {
            done();
        }
    });

    /**
     * @test {Container#get}
     */
    it('Should throw error if get method contract does not met', (done) => {
        try {
            container.init();
            container.get();
            done(new Error('This should throw'));
        } catch(err) {
            err.name.should.be.eql('ValidationError');
            done();
        }
    });

    /**
     * @test {Container#getByGroup}
     */
    it('Should throw error if getByGroup method contract does not met', (done) => {
        try {
            container.init();
            container.getByGroup(1);
            done(new Error('This should throw'));
        } catch(err) {
            err.name.should.be.eql('ValidationError');
            done();
        }
    });

    /**
     * @test {Container#static}
     */
    it('Should throw error if static method contract does not met', (done) => {
        try {
            container.static('name', 12345);
            done(new Error('This should throw'));
        } catch(err) {
            err.name.should.be.eql('ValidationError');
            done();
        }
    });

    /**
     * @test {Container#static}
     */
    it('Should init static service', () => {
        container.static('staticHello', staticHello);
        container.init();

        const hello = container.get('staticHello').sayHello();
        hello.should.be.type('string');
    });

    /**
     * @test {Container#provider}
     */
    it('Should init providers in container', () => {
        container.provider('helloService', helloService);
        container.init();

        const hello = container.get('helloService').sayHello();
        hello.should.be.type('string');
    });

    /**
     * @test {Container#provider}
     */
    it('Should init provider with dependency', () => {
        container.provider('heyService', heyService);
        container.provider('helloService', helloService);
        container.init();

        const hello = container.get('heyService').hello.sayHello();
        hello.should.be.type('string');
    });

    /**
     * @test {Container#provider}
     */
    it('Should inject with options', () => {
        container.provider('helloService', helloService, { groups: ['hey'] });
        container.init();
    });

    /**
     * @test {Container#provider}
     */
    it('Should throw error if inject options are not valid', (done) => {
        try {
            container.provider('helloService', helloService, { groups: 1, invalidOption: 'hello' });
            container.init();

            done(new Error('This should throw'));
        } catch(err) {
            err.name.should.be.eql('ValidationError');
            done();
        }
    });

});
