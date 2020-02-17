const Logger = require('../Logger/Logger');
const amqp = require('amqplib');

class RabbitMQ {
    constructor(params) {
        this._params = params;

        this._log = new Logger('RabbitMQ');
        this._log.level = 'all';

        this.Queues = {};
        this.RabbitChannels = {};

        this.Channel = require('amqplib/lib/channel_model').Channel;
    }

    addQueue(queue_name) {
        this.Queues[queue_name] = queue_name;
    }

    createMessage(msg_obj) {
        const json = JSON.stringify(msg_obj);
        return Buffer.from(json);
    }

    parseMessage(msg_bfr) {
        if (!msg_bfr || !msg_bfr.content) {
            return null;
        }
        return JSON.parse(msg_bfr.content.toString());
    }

    async connect() { // eslint-disable-line require-await
        const connect_url = this._params.connect_url;

        return amqp.connect()
            .then( conn => {
                this._log.trace(`Successfully connected to rabbitMQ server ${connect_url}`);
                return conn;
            })
            .catch( err => this._log.error('RabbitMQ connection error ' + err) );
    }

    async createCh(conn) { // eslint-disable-line require-await
        return conn.createChannel()
            .then( ch => {
                this._log.trace('Successfully created rabbitMQ channel');
                return ch;
            })
            .catch(err => this._log.error('Error while tried to create queue', err));
    }

    async assertQueue(ch, queue_name, options) { // eslint-disable-line require-await
        return ch.assertQueue(queue_name, options)
            .then( () => this._log.trace(`Successfully created queue ${queue_name}`) )
            .catch( (err) => this._log.error('Error while tried to create queue', err) );
    }

    async deleteQueue(ch, queue_name, options = {}) { // eslint-disable-line require-await
    
        return ch.deleteQueue(queue_name, options)
            .then(() => this._log.trace(`Queue name ${queue_name} was successfully deleted`))
            .catch(err => this._log.error('Error occured while tried to delete queue', err));
    }
}

module.exports = RabbitMQ;
