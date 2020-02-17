module.exports = {
    apps : [
        {
            name: 'predictus_server',
            script: 'index.js',
            instances: 1,
            autorestart: true,
            watch: false,
        },
        {
            name: 'notification_worker',
            script: 'workers/notification_workers',
            instances: 1,
            autorestart: true,
            watch: false,
        },
    ],
};
