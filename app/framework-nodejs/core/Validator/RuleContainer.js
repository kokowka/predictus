const { ValidationError } = require('../rest.errors');


class RuleContainer {

    /**
     * 
     * @param {Object} opts 
     * @param {Boolean} opts.strict Default false. Tells if validator should throw error if no rule for field in validation target.
     */
    constructor(opts = {}) {
        this._strict = opts.strict || false;
        this._ruleReceiver = Object.create(null);
    }

    /**
     * Creates validation rule for required value located under specified key
     * @param {String} key key of value that should be validated
     * @param {Function} validator function that should validate value (Recommended to use predefined Rule class methods for that)
     * @param {Object} opts
     * @param {Any} opts.converter converter which should be used to specified value
     * @returns {RuleContainer} current rule container instance
     */
    withRequired(key, validator, opts = {}) {
        this._createRule(key, validator, false, opts);
        return this;
    }

    /**
     * Creates validation rule for optional value located under specified key
     * @param {String} key key of value that should be validated
     * @param {Function} validator function that should validate value (Recommended to use predefined Rule class methods for that)
     * @param {Object} opts
     * @param {Any} opts.defaultValue default value which would be settled instead of optional value if it's not present
     * @param {Any} opts.converter converter which should be used to specified value
     * @returns {RuleContainer} current rule container instance
     */
    withOptional(key, validator, opts = {}) {
        this._createRule(key, validator, true, opts);
        return this;
    }

    /**
     * Runs current validation rules against specified target
     * @param {any} validation_target validation target. Can be anything js data type
     * @param {Boolean} isElement Optional system parameter. If true, method returns errors array
     * @returns {Array|any} validation_target or errors array (depending on isElement option)
     */
    run(validation_target, isElement) {
        let errors = [];

        if ( this._strict && typeof validation_target === 'object' ) {
            const hasPropWithoutRule = Object.keys(validation_target).some( prop => {
                return !this._ruleReceiver[prop] && !( validation_target instanceof Array );
            });
            if ( hasPropWithoutRule ) {
                throw new ValidationError('Fields are not matching required contract');
            }
        }

        Object.entries(this._ruleReceiver)
            .forEach( ([ prop, { validator, optional, defaultValue, converter, customValidator, hooks } ]) => {
                const val = this._getValue(validation_target, prop);
                if ( optional && val.value === undefined && defaultValue !== undefined ) {
                    validation_target[prop] = defaultValue;
                }
                if (val.err) {
                    return !optional && errors.push(val);
                }

                validator(prop, val.value, errors);

                if ( customValidator && typeof customValidator === 'function' ) {
                    try {
                        customValidator(val.value);
                    } catch(err) {
                        errors.push({ field: prop, err: err.message });
                    }
                }

                if ( converter ) {
                    validation_target[prop] = converter(val.value);
                }
                if ( hooks && hooks.afterConvert && hooks.afterConvert instanceof RuleContainer ) {
                    errors.push(...hooks.afterConvert.run(validation_target[prop], true));
                }
            });

        errors = errors.filter(e => e);

        if ( errors.length && !isElement ) {
            throw new ValidationError(
                JSON.stringify(errors).replace(/"/g, '\'') // eslint-disable-line no-magic-numbers
            );
        } else if ( isElement ) {
            return errors;
        }

        return validation_target;
    }

    _createRule(key, validator, optional, opts = {}) {
        key = key || '';

        if (this._ruleReceiver[key]) {
            throw new Error(`Rule for key ${key} was already defined`);
        } else if ( typeof validator !== 'function' ) {
            throw new Error('Rule should receive validation function as the second argument');
        }

        this._ruleReceiver[key] = Object.assign({}, opts, { validator, optional });
    }

    _getValue(target, key) {

        const key_chunks = key.split('.');
        let currVal = target;
        if ( !key_chunks[0] ) { // eslint-disable-line no-magic-numbers
            return { value: currVal };
        }
        for ( let i = 0; i < key_chunks.length; i++ ) {
            
            if ( !currVal.hasOwnProperty(key_chunks[i]) ) {
                const field = key_chunks.slice(0, i+1).join('.'); // eslint-disable-line no-magic-numbers
                return { field, err: `Field ${field} does not exist` };
            }

            currVal = currVal[ key_chunks[i] ];
        }

        return { value: currVal,  };
    }
}

module.exports = RuleContainer;
