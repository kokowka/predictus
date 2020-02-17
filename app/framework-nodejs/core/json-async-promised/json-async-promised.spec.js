require('should');
const jap = require('./json-async-promised');

describe('Json Async Promised (JAP) Tests', () => {

    /**
     * @test {JAP#stringify}
     */
    it('Should stringify js object', async () => {
        const testObject = {a: 1, b: 'hello', c: null, k: true};
        const testStr = JSON.stringify(testObject);

        const res = await jap.stringify(testObject);
        res.should.be.eql(testStr);
    });

    /**
     * @test {JAP#parse}
     */
    it('Should parse json to js object', async () => {
        const testObject = {a: 1, b: 'hello', c: null, k: true};
        const testStr = JSON.stringify(testObject);

        const res = await jap.parse(testStr);
        res.should.be.deepEqual(testObject);
    });

    it('Should throw error with invalid input', done => {
        const invalidStr = 'asdf{"a":1,"b":asdfadsf}';

        jap.parse(invalidStr)
            .then(() => done(new Error('Should throw')))
            .catch(() => done());
    });
});
