// WARNING!!!!! This module should not be imported directly
const promise_helper = require('../promise-helper');
const Logger = require('../Logger/Logger');

class Notification {
    constructor(notification_config) {
        this._notification_config = notification_config;
        this._request_promise = promise_helper.promisify(this._request);
        this._log = new Logger('Notifications');

        const data_types = this._notification_config.data_types;
        this.MESSAGE = data_types.MESSAGE;
        this.NEW_CHAT = data_types.NEW_CHAT;
        this.RECEIVE_CALL = data_types.RECEIVE_CALL;
    }

    static _injectLibs(libs = {}) {
        for (let lib_name in libs) {
            this['_' + lib_name] = libs[lib_name];
        }
    }

    async sendMessage(data, user_id, user_token, voip_token) {


        return this._sendMessageFcm( await this._createFcmMessage(data, user_id, user_token) )
            .then((response, body) => {
                if ( response.statusCode >= 400 ) { // eslint-disable-line no-magic-numbers
                    this._log.error(response, body);
                    return Promise.reject(new Error(`Received ${response.statusCode} status ` + JSON.stringify(response)));
                }

                return body;
            })
            .catch(err => {
                this._log.error('Notification sending error', err);
                return Promise.reject(err);
            });


    }

    createChatData(chat_id, sender_id, chat_type, picture, chat_name, status_sender = 0, status_my = 0) { // eslint-disable-line no-magic-numbers
        const data = {
            chat_id,
            sender_id,
            chat_type,
            picture,
            chat_name,
            sender_name: chat_name,
            status_sender,
            status_my,
        };

        return this._createNotifMsg(data, this.NEW_CHAT);
    }

    createMessageData(chat_id, sender_id, chat_type, picture, chat_name, sender_name, text, files = null) {
        const data = {
            chat_id,
            sender_id,
            chat_type,
            picture,
            chat_name,
            sender_name,
            text,
            files,
        };

        return this._createNotifMsg(data, this.MESSAGE);
    }

    createReceiveCallData(call, user_data) {
        const data = { call, user_data };
        return this._createNotifMsg(data, this.RECEIVE_CALL);
    }

    _sendMessageFcm(message) {
        return this._request_promise({
            url: this._notification_config.fcm.url,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'key=' + this._notification_config.fcm.server_key,
            },
            body: message,
        });
    }

    _createFcmMessage(data, user_id, user_token) {

        let ntf = {
            to: user_token,
    
            data: {
                'data': JSON.stringify(data.data),
                'type': data.type,
                'user_id': user_id,
            },
            webpush: {
                'headers': {
                    'Urgency': 'high',
                },
            },
            android: {
                'priority': 'high',
            },
    
            priority: 10,
        };
    
        if (data.type === this.RECEIVE_CALL) {
            ntf.android.ttl = '10s';
        }
    
        return JSON.stringify(ntf);
    }

    _createNotifMsg(data, type) {
        return { data, type };
    }
}

module.exports = Notification;
