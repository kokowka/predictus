const { Rule, RuleContainer } = require('../index');
const assert = require('assert');

describe('RuleContainer', () => {
    let container;

    beforeEach(() => {
        container = new RuleContainer();
    });

    /**
     * @test {RuleContainer}
     */
    it('Should not throw error if there are no rules for some fields', () => {
        const val_target = { int: 5, str: 'asdf' };

        container
            .withRequired('int', Rule.isNumber());

        container.run(val_target);
    });

    /**
     * @test {RuleContainer}
     */
    it('Should throw error if there are no rules for some fields with strict flag', () => {
        const val_target = { int: 5, str: 'asdf' };

        const strict_container = new RuleContainer({ strict: true });
        strict_container
            .withRequired('int', Rule.isString());

        assert.throws(() => strict_container.run(val_target));
    });

    /**
     * @test {RuleContainer#run}
     */
    it('Should return validated object in case of success', () => {
        const val_target = {};

        const res = container.run(val_target);

        assert.equal(res, val_target);
    });

    /**
     * @test {RuleContainer#run}
     */
    it('Should support chaining', () => {
        const val_target = { int: 5, str: 'asdf', bool: true, arr: [] };

        container
            .withRequired('int', Rule.isNumber())
            .withRequired('str', Rule.isString())
            .withRequired('bool', Rule.isBoolean());

        container.run(val_target);
    });

    /**
     * @test {RuleContainer#withOptional}
     */
    it('Should not throw if optional value is not present', () => {
        const val_target = {};

        container
            .withOptional('int', Rule.isNumber());

        container.run(val_target);
    });

    /**
     * @test {RuleContainer#withOptional}
     */
    it('Should throw if optional value is not of specified type', () => {
        const val_target = { int: 'not int' };

        container
            .withOptional('int', Rule.isNumber());

        assert.throws(() => container.run(val_target));
    });

    /**
     * @test {RuleContainer#withOptional}
     */
    it('Should return default value if optional value is not present', () => {
        const val_target = {};
        const expectedDefaultValue = 1;

        container
            .withOptional('int', Rule.isNumber(), { defaultValue: expectedDefaultValue });

        const data = container.run(val_target);
        assert.equal(data.int, expectedDefaultValue);
    });

    /**
     * @test {RuleContainer#withRequired}
     */
    it('Should return converted value', () => {
        const val_target = { str_int: '1.5' };
        const expectedConvertedValue = 1.5;

        container
            .withOptional('str_int', Rule.isString(), { converter: Number });

        const data = container.run(val_target);
        assert.equal(data.str_int, expectedConvertedValue);
    });

    /**
     * @test {RuleContainer#withRequired}
     */
    it('Should validate on afterConvert hook', () => {
        const val_target = { json: JSON.stringify({ int: 1 }) };

        container
            .withRequired(
                'json',
                Rule.isString(),
                {
                    converter: JSON.parse,
                    hooks: {
                        afterConvert: new RuleContainer().withRequired('int', Rule.isNumber()),
                    },
                }
            );

        container.run(val_target);
    });

    /**
     * @test {RuleContainer#withRequired}
     */
    it('Should throw on afterConvert hook', () => {
        const val_target = { json: JSON.stringify({ int: '1.5' }) };
        
        container
            .withRequired(
                'json',
                Rule.isString(),
                {
                    converter: JSON.parse,
                    hooks: {
                        afterConvert: new RuleContainer().withRequired('int', Rule.isNumber()),
                    },
                }
            )
        ;

        assert.throws(() => container.run(val_target));
    });

    /**
     * @test {RuleContainer#withRequired}
     */
    it('Should throw on custom validator condition', () => {
        const val_target = { name: 'Long Name' };
        const customValidator = (value) => {
            if ( value.length > 5 ) {
                throw new Error('name should be under 5 symbols');
            }
        };

        container
            .withRequired('name', Rule.isString(), { customValidator })
        ;

        assert.throws(() => container.run(val_target));
    });

    /**
     * @test {Rule#isString}
     */
    it('Should validate object with strings', () => {
        const val_target = { hello: 'Kitty' };

        container
            .withRequired('hello', Rule.isString());

        container.run(val_target);
    });

    /**
     * @test {Rule#isString}
     */
    it('Should validate if string match regexp', () => {
        const val_target = { hello: 'Kitty' };

        container
            .withRequired('hello', Rule.isString({ regexp: /kit/i }));

        container.run(val_target);
    });

    /**
     * @test {Rule#isString}
     */
    it('Should validate if string is one of specified values', () => {
        const val_target = { hello: 'there' };

        container
            .withRequired('hello', Rule.isString({ oneOf: [ 'hello', 'there' ] }));

        container.run(val_target);
    });

    /**
     * @test {Rule#isString}
     */
    it('Should validate string', () => {
        const val_target = 'str';

        container
            .withRequired(null, Rule.isString());

        container.run(val_target);
    });

    /**
     * @test {Rule#isString}
     */
    it('Should throw error if value is not string', () => {
        const val_target = 1234;

        container
            .withRequired(null, Rule.isString());

        assert.throws(() => container.run(val_target));
    });

    /**
     * @test {Rule#isString}
     */
    it('Should throw error if string does not match regexp', () => {
        const val_target = { hey: 'hop' };

        container
            .withRequired('hey', Rule.isString({regexp: /hello/}));

        assert.throws(() => container.run(val_target));
    });

    /**
     * @test {Rule#isString}
     */
    it('Should throw error if string is not one of specified values', () => {
        const val_target = { hey: 'some_weird' };

        container
            .withRequired('hey', Rule.isString({ oneOf: [ 'hello', 'there' ] }));

        assert.throws(() => container.run(val_target));
    });

    /**
     * @test {Rule#isNumber}
     */
    it('Should validate object with numbers', () => {
        const val_target = { int: 5 };

        container
            .withRequired('int', Rule.isNumber());

        container.run(val_target);
    });

    /**
     * @test {Rule#isNumber}
     */
    it('Should validate if number is integer', () => {
        const val_target = { int: 10 };

        container
            .withRequired('int', Rule.isNumber({ integer: true }));

        container.run(val_target);
    });

    /**
     * @test {Rule#isNumber}
     */
    it('Should validate if number within specified range', () => {
        const val_target = { int: 10 };

        container
            .withRequired('int', Rule.isNumber({ range: [1, 11] })); // eslint-disable-line no-magic-numbers

        container.run(val_target);
    });

    /**
     * @test {Rule#isNumber}
     */
    it('Should validate if number is not one of specified values', () => {
        const val_target = { int: 5 };

        container
            .withRequired('int', Rule.isNumber({ oneOf: [ 1, 2, 3, 4, 5 ] })); // eslint-disable-line no-magic-numbers
        
        container.run(val_target);
    });

    /**
     * @test {Rule#isNumber}
     */
    it('Should throw if value is not number', () => {
        const val_target = { int: 'this is not number' };

        container
            .withRequired('int', Rule.isNumber());

        assert.throws(() => container.run(val_target));
    });

    /**
     * @test {Rule#isNumber}
     */
    it('Should throw error if number is not integer', () => {
        const val_target = { float: 1.3 };

        container
            .withRequired('float', Rule.isNumber({ integer: true }));

        assert.throws(() => container.run(val_target));
    });

    /**
     * @test {Rule#isNumber}
     */
    it('Should throw error if number is not within specified range', () => {
        const val_target = { int: 10 };

        container
            .withRequired('int', Rule.isNumber({ range: [1, 9] })); // eslint-disable-line no-magic-numbers

        assert.throws(() => container.run(val_target));
    });

    /**
     * @test {Rule#isNumber}
     */
    it('Should throw error if number is not one of specified values', () => {
        const val_target = { int: 666 };

        container
            .withRequired('int', Rule.isNumber({ oneOf: [ 1, 2, 3 ] })); // eslint-disable-line no-magic-numbers

        assert.throws(() => container.run(val_target));
    });

    /**
     * @test {Rule#isBoolean}
     */
    it('Should validate objects with boolean', () => {
        const val_target = { bool: true };

        container
            .withRequired('bool', Rule.isBoolean());

        container.run(val_target);
    });

    /**
     * @test {RuleContainer#withRequired}
     */
    it('Should validate nested fields', () => {
        const val_target = { hey: { here: { val: 'Hello' } } };

        container
            .withRequired('hey.here.val', Rule.isString());

        container.run(val_target);
    });

    /**
     * @test {RuleContainer#withRequired}
     */
    it('Should throw for nested fields', () => {
        const val_target = { hey: { here: { val: 'Hello' } } };

        container
            .withRequired('hey.here', Rule.isString());

        assert.throws(() => container.run(val_target));
    });

    /**
     * @test {RuleContainer#withRequired}
     */
    it('Should throw if received not validation function', () => {

        assert.throws(() => 
            container.withOptional('hey', 'what the hell?')
        );
    });

    /**
     * @test {RuleContainer#isArray}
     */
    it('Should validate array', () => {
        const val_target = { arr: [] };

        container
            .withRequired('arr', Rule.isArray());

        container.run(val_target);
    });

    /**
     * @test {RuleContainer#isArray}
     */
    it('Should validate each array elem', () => {
        const val_target = { arr: [ { num: 1 }, { num: 2 }, { num: 3 } ] };
        
        const elem_rules = new RuleContainer().withRequired('num', Rule.isNumber());

        container
            .withRequired('arr', Rule.isArray({ each: elem_rules }));

        container.run(val_target);
    });

    /**
     * @test {RuleContainer#isArray}
     */
    it('Should throw for some of array elem', () => {
        const val_target = { arr: [ { num: 1 }, { num: 2 }, { num: 'Oops' } ] };

        const elem_rules = new RuleContainer().withRequired('num', Rule.isNumber());

        container
            .withRequired('arr', Rule.isArray({ each: elem_rules }));

        assert.throws(() => container.run(val_target));
    });

    /**
     * @test {RuleContainer#isArray}
     */
    it('Should throw if target is not array', () => {
        const val_target = { arr: 'Oops, not array' };

        container
            .withRequired('arr', Rule.isArray());

        assert.throws(() => container.run(val_target));
    });

    /**
     * @test {RuleContainer#isArray}
     */
    it('Should throw if array is empty', () => {
        const val_target = { arr: [] };

        container
            .withRequired('arr', Rule.isArray({ throwOnEmpty: true }));

        assert.throws(() => container.run(val_target));
    });

    /**
     * @test {RuleContainer#isObject}
     */
    it('Should validate object', () => {
        const val_target = { obj: {} };

        container
            .withRequired('obj', Rule.isObject());

        container.run(val_target);
    });

    /**
     * @test {RuleContainer#isObject}
     */
    it('Should validate child props of object', () => {
        const val_target = { obj: { num: 1, str: '1', bool: true } };

        container
            .withRequired('obj', Rule.isObject(new RuleContainer()
                .withRequired('num', Rule.isNumber())
                .withRequired('str', Rule.isString())
                .withRequired('bool', Rule.isBoolean())
            ));

        container.run(val_target);
    });

    /**
     * @test {RuleContainer#isObject}
     */
    it('Should throw if target is not obj', () => {
        const val_target = { obj: 'Not obj' };

        container
            .withRequired('obj', Rule.isObject());

        assert.throws(() => container.run(val_target));
    });

    /**
     * @test {RuleContainer#isObject}
     */
    it('Should throw if child props are wrong', () => {
        const val_target = { obj: { num: 'Ooops, not num', str: '1', bool: true } };

        container
            .withRequired('obj', Rule.isObject(new RuleContainer()
                .withRequired('num', Rule.isNumber())
                .withRequired('str', Rule.isString())
                .withRequired('bool', Rule.isBoolean())
            ));

        assert.throws(() => container.run(val_target));
    });
});
