module.exports = {
    apps : [
        {
            name: 'predictus_server',
            script: 'index.js',
            instances: 1,
            autorestart: true,
            watch: false,
        },
    ],
};
