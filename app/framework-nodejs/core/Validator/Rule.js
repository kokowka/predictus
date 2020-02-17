const RuleContainer = require('./RuleContainer');

class Rule {

    /**
     * Creates rule validator for value that should be string
     * @param {Object} options
     * @param {RegExp} options.regexp Optional. Used for string validation by specified RegExp
     * @param {Boolean} options.notEmpty Optional. Used for checking if string is not empty
     * @returns {Function} function which later will be used for string field validation
     */
    static isString(options = {}) {
        const self = this;
        const { regexp, oneOf, notEmpty } = options;
        if ( regexp && !(regexp instanceof RegExp) ) {
            throw new Error('Please provide a valid regexp option');
        }
        if ( oneOf && !(oneOf instanceof Array) && oneOf.some(val => typeof val !== 'string') ) {
            throw new Error('Please provide a valid oneOf option');
        }

        return function (key, value, errors) {
            errors.push(
                self._isTypeOf(key, value, 'string') 
                || ( regexp && self._isMatchRegexp(key, value, regexp) )
                || ( oneOf && self._isOneOf(key, value, oneOf) )
                || ( notEmpty && self._isNotEmpty(key, value) )
            );
        };
    }

    /**
     * Creates rule validator for value that should be number
     * @param {Object} options
     * @param {Array<Number>} options.range Optional. Option, used for checking if number is bigger than range[0] and smaller than range[1]
     * @param {Boolean} options.integer Optional. Option, which turns on integer check
     * @returns {Function} function which later will be used for number field validation
     */
    static isNumber(options = {}) {
        const self = this;
        const { range, integer, oneOf } = options;
        if ( 
            range
            && (
                !(range instanceof Array)
                || range.length !== 2 // eslint-disable-line no-magic-numbers
                || range.some(bound => typeof bound !== 'number')
                || range[0] > range[1] // eslint-disable-line no-magic-numbers
            )
        ) {
            throw new Error('Please provide valid range');
        
        } 
        if ( integer && typeof integer !== 'boolean' ) {
            throw new Error('integer option should be a boolean');
        }
        if ( oneOf && !(oneOf instanceof Array) && oneOf.some(val => typeof val !== 'number') ) {
            throw new Error('Please provider valid oneOf option');
        }

        return function (key, value, errors) {
            errors.push(
                self._isTypeOf(key, value, 'number')
                || ( integer && self._isInteger(key, value) )
                || ( range && self._inRange(key, value, range) )
                || ( oneOf && self._isOneOf(key, value, oneOf) )
            );
        };
    }

    /**
     * Creates rule validator for value that should be boolean
     * @returns {Function} function which later will be used for boolean field validation
     */
    static isBoolean() {
        const self = this;
        return function(key, value, errors) {
            errors.push( self._isTypeOf(key, value, 'boolean') );
        };
    }

    /**
     * Creates rule validator for value that should be array
     * @param {Object} options
     * @param {RuleContainer} options.each Optional. Validates each array element by specified rules
     * @returns {Function} function which later will be used for array field validation
     */
    static isArray(options = {}) {
        const self = this;
        const { each, throwOnEmpty } = options;
        if ( each && !(each instanceof RuleContainer) ) {
            throw new Error('Option each should be RuleContainer');
        } else if ( options.hasOwnProperty('throwOnEmpty') && typeof throwOnEmpty !== 'boolean' ) {
            throw new Error('Option throwOnEmpty should be a boolean');
        }

        return function(key, value, errors) {
            const error = self._isInstanceOf(key, value, Array);
            if (error) {
                return errors.push(error);
            }
            
            if ( throwOnEmpty && !value.length ) {
                return errors.push({ field: key, err: 'Array is empty' });
            }
            if (each) {
                const elem_errs = value.reduce((errs, elem, i) => {
                    const errs_chunk = each.run(elem, true);
                    errs_chunk.forEach(err => (err.field = `${key}[${i}].${err.field}`));
                    return errs.concat(errs_chunk);
                }, []);
                if (elem_errs.length) {
                    errors.push(...elem_errs);
                }
            }
        };
    }

    /**
     * Creates rule validator for value that should be object
     * @param {RuleContainer} child_rules Optional. rules for object inner props
     * @returns {Function} function which later will be used for object field validation
     */
    static isObject(child_rules) {
        const self = this;
        if ( child_rules && !(child_rules instanceof RuleContainer) ) {
            throw new Error('Child rules should be RuleContainer');
        }

        return function(key, value, errors) {
            const error = self._isInstanceOf(key, value, Object);
            if (error) {
                return errors.push(error);
            }

            if (child_rules) {
                errors.push(...child_rules.run(value, true));
            }
        };
    }

    /**
     * Creates rule validator for value that should be one of specified types
     * @param  {...String} types one of them should return true against typeof check with value
     * @returns {Function} function which later will be used for "one of type" field validation
     */
    static isOneOfType(...types) {
        const self = this;

        return function(key, value, errors) {
            if ( types.every(type => self._isTypeOf(key, value, type)) ) {
                errors.push({ field: key, err: `Field does not belong to any of types ${types.join(', ')}` });
            }
        };
    }

    static _isTypeOf(key, value, type) {
        if ( typeof value !== type ) {
            return { field: key, err: `Field is not of type ${type}` };
        }
    }

    static _isInstanceOf(key, value, Instance) {
        if ( !( value instanceof Instance ) ) {
            return { field: key, err: `Field is not instance of ${Instance.name}` };
        }
    }

    static _isMatchRegexp(key, value, regexp) {
        if ( !regexp.test(value) ) {
            return { field: key, err: 'Field does not match regexp' };
        }
    }

    static _inRange(key, value, range) {
        if ( !(value >= range[0] && value <= range[1]) ) { // eslint-disable-line no-magic-numbers
            return { field: key, err: `Field is out of range [${range}]` };
        }
    }

    static _isInteger(key, value) {
        if ( (Math.floor(value) - value) !== 0 ) { // eslint-disable-line no-magic-numbers
            return { field: key, err: `Value ${value} is not integer` };
        }
    }

    static _isOneOf(key, value, oneOf) {
        if ( oneOf.every(val => val !== value) ) {
            return { field: key, err: `Value ${value} is not one of ${oneOf.join(', ')}` };
        }
    }

    static _isNotEmpty(key, value) {
        if ( value === '' ) {
            return { field: key, err: `${key} should not be empty` };
        }
    }

}

module.exports = Rule;
