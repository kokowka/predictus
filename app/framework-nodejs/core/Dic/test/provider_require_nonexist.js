
function Hey(somethingNonexistent) {
    return { somethingNonexistent };
}
Hey.$inject = ['somethingNonexistent'];

module.exports = Hey;
