Promise = require('bluebird'); // eslint-disable-line no-global-assign
const Logger = require('../../Logger/Logger');

class AbstractWsController {

    constructor(sessionController, muteController, RabbitMQ, server_params, sessionContainer) {
        this._sessionController = sessionController;
        this._muteController = muteController;
        this._RabbitMQ = RabbitMQ;
        this._server_params = server_params;
        this._sessionContainer = sessionContainer;
        this._NOTIFICATION_QUEUE = 'NOTIFICATION_QUEUE';

        this._log = new Logger('AbstractWsController');
    }

    /**
     * Emits message to all active & online sessions of specified user
     * @param {String} user_id id of user to which this emit should be send
     * @param {String} message message that should be emitted
     * @param {Object} options
     * @param {String} options.chat_id chat_id, to which emit is related
     * @param {String} options.except_session user session to which emit should not be send
     * @returns {Promise<Boolean>} promise which will be resolved when emits will be send (Boolean shows if procedure was successfull or not)
     */
    async emit(user_id, message, options = {}) {
        let is_emit_send = false;
        
        if (!user_id) {
            return is_emit_send;
        }
        const { chat_id, except_session } = options;

        let active_sessions;
        try {
            active_sessions = await this._sessionController.getSessions(user_id);
        } catch(err) {
            return is_emit_send;
        }

        const sessions_to_send = active_sessions
            .filter(session_info => session_info.session_token !== except_session && session_info.queue_name);

        await Promise.each(
            sessions_to_send,
            async session_info => {
                const is_send = await this.emitToSession(user_id, session_info.session_token, message, chat_id, false);
                is_emit_send = is_emit_send || is_send;
            }
        );

        return is_emit_send;
    }

    /**
     * Emits message to specific active & online session of specified user
     * @param {String} user_id id of user to which this emit should be send
     * @param {String} session_token specific user session to which this emit should be send
     * @param {String} message message that should be emmited
     * @param {Object} options
     * @param {String} options.chat_id chat_id, to which emit is related
     * @param {String} options.send_on_error for internal use only. Flag which indicates if emit should be pushed to emit queue in case of ws error
     * @returns {Promise<Boolean>} promise which will be resolved when emit will be send (Boolean shows if procedure was successfull or not)
     */
    async emitToSession(user_id, session_token, message, options = {}) {
        let is_emit_send = false;
        const chat_id = options.chat_id;
        const send_on_error = options.hasOwnProperty('send_on_error') ? options.send_on_error : true;

        if (!user_id) {
            return is_emit_send;
        }

        const connected_sessions = this._sessionContainer[user_id];
        const socket = (connected_sessions || {})[session_token];
        if ( !socket ) {
            return this._sendEmitToQueue(session_token, message, null, chat_id);
        }

        try {
            await this._sendEmit(socket, message, chat_id, user_id);
            return (is_emit_send = true);
        
        } catch(err) {
            this._log.error('Socket send error', err.message);
            this._removeWs(user_id, session_token);
            
            if ( send_on_error ) {
                return this._sendEmitToQueue(session_token, message, null, chat_id);
            }

            return false;
        }
    }

    /**
     * Emits message or sends notification to all active user sessions
     * @param {String} user_id id of user to which this emit should be send
     * @param {String} message message that should be emmited
     * @param {String} notification_message message that should be used for notification
     * @param {Object} options
     * @param {String} options.chat_id chat_id, to which emit is related
     * @returns {Promise<Boolean>} promise which will be resolved when emits and notifications will be send (Boolean shows if emits were send or not)
     */
    async emitOrNotification(user_id, message, notification_message = null, options = {}) {
        let is_emit_send = false;
        const { chat_id } = options;

        if (!user_id) {
            return is_emit_send;
        }

        let active_sessions;
        try {
            active_sessions = await this._sessionController.getSessions(user_id);
        } catch(err) {
            return is_emit_send;
        }

        const emit_results = await Promise.map(active_sessions, async session_info => {
            const is_send = await this.emitToSession(user_id, session_info.session_token, message, chat_id, false)
                .catch(err => {
                    this._log.error('Emit message error', err);
                    return false;
                });
            
            is_emit_send = is_emit_send || is_send;
            return is_send;
        });

        const sessions_to_notify = active_sessions.filter((session_info, i) => {
            return !emit_results[i] || session_info.notification_token || session_info.device_type;
        });

        await Promise.each(sessions_to_notify, session_info => {
            return this._sendNotification(session_info, message, notification_message, chat_id)
                .catch(err => this._log.error('Notification message error', err));
        });

        return is_emit_send;
    }

    /**
     * Emits message and sends notification to all active user sessions
     * @param {String} user_id id of user to which this emit should be send
     * @param {String} message message that should be emmited
     * @param {String} notification_message message that should be used for notification
     * @param {Object} options
     * @param {String} options.chat_id chat_id, to which emit is related
     * @returns {Promise<Boolean>} promise which will be resolved when emits and notifications will be send (Boolean shows if emits were send or not)
     */
    async emitAndNotification(user_id, message, notification_message = null, options = {}) {
        let is_emit_send = false;
        const { chat_id } = options;

        if (!user_id) {
            return is_emit_send;
        }

        let active_sessions;
        try {
            active_sessions = await this._sessionController.getSessions(user_id);
        } catch(err) {
            return is_emit_send;
        }

        await Promise.each(active_sessions, async session_info => {
            const is_send = await this.emitToSession(user_id, session_info.session_token, message, chat_id, false)
                .catch(err => this._log.error('Emit message error', err));
            
            is_emit_send = is_emit_send || is_send;
        });

        await Promise.each(active_sessions, session_info => {
            return this._sendNotification(session_info, message, notification_message, chat_id);
        });

        return is_emit_send;
    }

    /**
     * Emits message or sends notification to specific active user session
     * @param {String} user_id id of user to which this emit or notification should be send
     * @param {String} session_token specific user session to which this emit or notification should be send
     * @param {String} message message that should be emmited
     * @param {String} notification_message message that should be used for notification
     * @param {Object} options
     * @param {String} options.chat_id chat_id, to which emit is related
     * @returns {Promise<Boolean>} promise which will be resolved when emit or notification will be send (Boolean shows if emits were send or not)
     */
    async emitOrNotificationToSession(user_id, session_token, message, notification_message = null, options = {}) {
        let is_emit_send = false;
        const { chat_id } = options;
        
        if (!user_id || !session_token) {
            return false;
        }

        let active_session;
        try {
            active_session = await this._sessionController.getSession(user_id);
        } catch (e) {
            this._log.error('User sessions retreival error', e);
            return false;
        }

        is_emit_send = await this.emitToSession(user_id, session_token, message, { chat_id, send_on_error: false });

        if ( !is_emit_send ) {
            await this._sendNotification(active_session, message, notification_message, chat_id);
        }

        return is_emit_send;
    }

    async _sendNotification(session_info, message, notification_message, chat_id) {
        let is_notification_send = false;
    
        if (!session_info.notification_token || !session_info.device_type) {
            return is_notification_send;
        }
    
        if (chat_id && await this._muteController.shouldMute(chat_id, session_info.user_id)) {
            return is_notification_send;
        }
    
        if (typeof message !== 'string') {
            message = JSON.stringify(message);
        }
    
        try {
            const rabbitMsg = this._RabbitMQ.createMessage({
                userId: session_info.user_id,
                notification_message: !notification_message ? message : notification_message,
                notification_token: session_info.notification_token,
                device_type: session_info.device_type,
                voip_token: session_info.voip_token,
            });
    
            this._server_params.rabbit_channels.NOTIFICATION_CHANNEL.sendToQueue(this._NOTIFICATION_QUEUE, rabbitMsg, {persistent: true});

            return (is_notification_send = true);
        } catch (err) {
            this._log.error('Notification sending error', err);
            return is_notification_send;
        }
    }

    async _sendEmitToQueue(session_token, message, notificationMessage, chat_id) {
        let is_emit_send = false;
        const session = await this._sessionController.getSession(session_token);
        if (!session) {
            return is_emit_send;
        }
    
        if (typeof message === 'object' && message.data) {
            if (chat_id && await this._muteController.shouldMute(chat_id, session.property('user_id'))) {
                message.data.muted = true;
            } else {
                message.data.muted = false;
            }
        }
    
        const queue_name = session.property('queue_name');
    
        if (queue_name === this._server_params.MY_CLUSTER_ID) {
            return is_emit_send;
        }
    
        let msg = typeof message === 'object' ? JSON.stringify(message) : message;
    
        if (queue_name) {
            const emitMessage = this._RabbitMQ.createMessage({
                message: msg,
                notificationMessage,
                session_token_hash: session.property('session_token_hash'),
                chat_id,
            });
            this._server_params.rabbit_channels.WS_QUEUE_CHANNEL.sendToQueue(queue_name, emitMessage, {persistent: false});
    
            return (is_emit_send = true);
        }
    
        return is_emit_send;
    }

    async _sendEmit(socket, message, chat_id, user_id) {

        if (typeof message === 'object' && message.data) {
            if (chat_id && await this._muteController.shouldMute(chat_id, user_id)) {
                message.data.muted = true;
            } else {
                message.data.muted = false;
            }
        }
    
        if (typeof message === 'object') {
            message = JSON.stringify(message);
        }
    
        return socket.send(message);
    }

    _removeWs(user_id, token) {
        let is_ws_removed = false;
        if (!user_id || !token) {
            return is_ws_removed;
        }
    
        let sessions = this._sessionContainer[user_id];
    
        if (!sessions) {
            return is_ws_removed;
        }
    
        if (token in sessions) {
            let session = sessions[token];
            session.user_id = null;
            session.session_token = null;
    
            delete sessions[token];
    
            if (Object.keys(sessions).length === 0) { // eslint-disable-line no-magic-numbers
                delete this._sessionContainer[user_id];
            }
    
            this._log.info('userId: ' + user_id + '; session : ' + token + ' logout.');
    
            return (is_ws_removed = true);
        }
    
        return is_ws_removed;
    }
}

module.exports = AbstractWsController;
