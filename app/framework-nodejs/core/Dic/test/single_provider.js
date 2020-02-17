

function hello() {
    return {
        sayHello: () => 'hello',
    };
}
hello.$inject = [];

module.exports = hello;
