'use strict';

require('should');
const WsRouter = require('../WsRouter');
const GreetingsController = require('./GreetingsController');

describe('WsRouter Abstract Class', () => {
    let testInstance;
    class TestClass extends WsRouter {
        constructor(WsControllers) {
            super(WsControllers, { errors: {} });
        }

        testApi() {

            this.addRoute('hello', 'GreetingsController.sayHello')
                .addRoute('goodbye', 'GreetingsController.sayGoodbye');

            return this;
        }
    }

    afterEach(() => {
        testInstance = null;
    });

    it('should invoke method handler', async () => {
        testInstance = new TestClass([ new GreetingsController() ]).testApi();

        const result = await testInstance.process({
            method: 'hello',
        });

        result.should.be.String();
    });

});
