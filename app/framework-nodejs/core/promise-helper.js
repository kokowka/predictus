
module.exports = {
    callAsPromise,
    promisify,
};

function callAsPromise(func, ...params) {
    return new Promise((resolve, reject) => {
        func(...params, (err, result, ...other_args) => {
            if (err) reject(err);

            if ( other_args.length ) {
                result = [ result ].concat(other_args);
            }
            resolve(result);
        });
    });
}

function promisify(func) {
    return function(...params) {
        return callAsPromise(func, ...params);
    };
}
