module.exports = {
    apps : [
        {
            name: 'predictus_server',
            script: 'auth.js.js',
            instances: 1,
            autorestart: true,
            watch: false,
        },
    ],
};
