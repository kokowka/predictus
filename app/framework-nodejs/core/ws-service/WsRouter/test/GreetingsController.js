'use strict';

class GreetingsController {
    constructor() {
        this.$name = 'GreetingsController';
    }

    sayHello() {
        return 'hello';
    }

    sayGoodbye() {
        return 'goodbye';
    }
}

module.exports = GreetingsController;

