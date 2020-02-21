const Logger = require('../Logger/Logger');

class NotificationWorker {

    constructor(RabbitMQ, rabbit_params, Notification) {
        this._RabbitMQ = RabbitMQ;
        this._rabbit_params = rabbit_params;
        this._Notification = Notification;

        this._log = new Logger('Notification Worker');
        
        this._MAX_TASKS = 5;
    }

    static setMaxTasks(value) {
        this._MAX_TASKS = value;
    }

    async init() {
        const conn = await this._RabbitMQ.connect();
        const ch = await this._RabbitMQ.createCh(conn);

        await this._RabbitMQ.assertQueue(ch, this._rabbit_params.NOTIFICATION_QUEUE, { durable: true });
        ch.prefetch(this._MAX_TASKS);
        ch.consume(this._rabbit_params.NOTIFICATION_QUEUE, handleNotificationRequest, { noAck: true });

        process.on('SIGINT', _handleProcessTermination);
        process.on('SIGTERM', _handleProcessTermination);

        async function handleNotificationRequest(message) {
            const msg = this._RabbitMQ.parseMessage(message);
    
            this._log.info(`Received notification message <${await JSON.stringify(msg)}>`);
    
            if (!msg) {
                ch.ack(message);
                return;
            }
    
            if (!msg.userId || !msg.notificationMessage || (!msg.notification_token && !msg.voip_token)) {
                this._log.warn('Invalid message format', msg);
                ch.ack(message);
                return;
            }
    
    
            try {
                await this._Notification.sendMessage(
                    msg.notificationMessage,
                    msg.userId,
                    msg.notification_token,
                    msg.voip_token,
                );
            } catch (err) {
                this._log.error('Error while tried to send push notification', err);
            }
    
            ch.ack(message);
        }

        function _handleProcessTermination() {
            ch.close();
            conn.close();
            process.exit(0); // eslint-disable-line no-magic-numbers
        }
    }
}

module.exports = NotificationWorker;
