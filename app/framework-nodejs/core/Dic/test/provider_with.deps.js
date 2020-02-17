
function Hey(helloService) {
    return { hello: helloService };
}
Hey.$inject = ['helloService'];

module.exports = Hey;
