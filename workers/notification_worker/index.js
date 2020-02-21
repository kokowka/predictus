const Notification = require('../../app/framework-nodejs/core/Notification/Notification');
const NotificationWorker = require('../../app/framework-nodejs/core/Notification/Notification-Worker');
const RabbitMQ = require('../../app/framework-nodejs/core/RabbitMQ/RabbitMQ');

const rabbitConstants = require('../../app/constants/rabbit');

const {options} = require('../../app/defaultConfig');

function init() {
    const notification = new Notification(options.notifications);
    const rabbitMQ = new RabbitMQ(options.rabbit);

    const notificationWorker = new NotificationWorker(rabbitMQ, rabbitConstants, notification);

    return notificationWorker.init();
}

init();

