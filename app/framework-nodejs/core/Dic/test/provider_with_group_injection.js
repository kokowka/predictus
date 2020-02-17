
function Hey(testGroup) {
    return { testGroup };
}
Hey.$inject = ['$g.testGroup'];

module.exports = Hey;
