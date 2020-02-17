const Rab = require('./response-async-builder');
const assert = require('assert');

describe('RAB', () => {
    let rab;
    const ERROR_CODE_EXAMPLE = 123;

    beforeEach(() => {
        rab = new Rab({
            app_data: {
                ios: 1,
                android: 1,
            },
            errors: {
                [ERROR_CODE_EXAMPLE]: 'Error',
            },
        });
    });

    /**
     * @test {Rab}
     */
    it('Should throw if init params are not valid', () => {
        assert.throws(() => new Rab({ hello: 'oh, it\'s a trap'}));
    });

    /**
     * @test {Rab#buildSuccess}
     */
    it('Should build successfull result object', () => {
        const method = 'method';
        const request_id = 1;
        const test_data = { hello: 'world' };
        const result_obj = rab.buildSuccess(test_data, request_id, method);

        assert.deepStrictEqual(result_obj, {
            result: true,
            method,
            request_id,
            data: test_data,
            error: null,
            versions: rab._versions,
        });
    });

    /**
     * @test {Rab#buildError}
     */
    it('Should build error result object', () => {
        const request_id = 1;
        const method = 'method';
        const err_code = 123;
        const err_msg = rab._params.errors[err_code];

        const result_obj = rab.buildError(ERROR_CODE_EXAMPLE, null, request_id, method);

        assert.deepStrictEqual(result_obj, {
            result: false,
            method,
            request_id,
            data: {},
            error: {
                msg: err_msg,
                code: err_code,
            },
            versions: rab._versions,
        });
    });

    /**
     * @test {Rab#createSuccess}
     */
    it('Should create success result', async () => {
        const method = 'method';
        const request_id = 1;
        const test_data = { hello: 'world' };
        const expected_res = JSON.stringify({
            result: true,
            method,
            request_id,
            data: test_data,
            error: null,
            versions: rab._versions,
        });

        assert.equal(await rab.createSuccess(test_data, request_id, method), expected_res);
    });

    /**
     * @test {Rab#createError}
     */
    it('Should create error result', async () => {
        const request_id = 1;
        const method = 'method';
        const err_code = 123;
        const err_msg = rab._params.errors[err_code];
        const expected_res = JSON.stringify({
            result: false,
            method,
            request_id,
            data: {},
            error: {
                msg: err_msg,
                code: err_code,
            },
            versions: rab._versions,
        });

        assert.equal(await rab.createError(err_code, null, request_id, method), expected_res);
    });

});
