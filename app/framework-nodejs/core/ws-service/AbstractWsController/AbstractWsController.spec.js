require('should');
const sinon = require('sinon');

describe('Abstract WS Controller', () => {
    let sandbox, abstractWsController;
    const connected_user_id1 = 'connected_user_id1',
          connected_user_id2 = 'connected_user_id2';
    const session_token1_cuid1 = 'session_token1_cuid1',
          session_token2_cuid1 = 'session_token2_cuid1',
          session_token1_cuid2 = 'session_token1_cuid2',
          session_token2_cuid2 = 'session_token2_cuid2';

    // mocks
    const muteControllerMock = { shouldMute: () => null };
    const sessionControllerMock = { getSessions: () => null, getSession: () => null };
    const RabbitMQMock = { createMessage: () => null };
    const server_params_mock = {
        MY_CLUSTER_ID: 'current_cluster_id',
        rabbit_channels: {
            WS_QUEUE_CHANNEL: { sendToQueue: () => null },
            NOTIFICATION_CHANNEL: { sendToQueue: () => null },
        },
    };
    const socketMock = { send: () => null };
    const sessionContainerMock = {
        'connected_user_id1': { 'session_token1_cuid1': socketMock, 'session_token2_cuid1': socketMock },
        'connected_user_id2': { 'session_token1_cuid2': socketMock, 'session_token2_cuid2': socketMock },
    };

    before(() => {
        sandbox = sinon.createSandbox();
        const AbstractWsController = require('./AbstractWsController');
        
        abstractWsController = new AbstractWsController(
            sessionControllerMock,
            muteControllerMock,
            RabbitMQMock,
            server_params_mock,
            sessionContainerMock
        );
    });

    afterEach(() => {
        sandbox.restore();
    });

    /**
     * @test {AbstractWsController#emitToSession}
     */
    it('Should emit to connected user session', async () => {
        sandbox.stub(socketMock, 'send');
        
        const emit_message = 'Some emit message';
        const is_emmited = await abstractWsController.emitToSession(connected_user_id1, session_token1_cuid1, emit_message);

        sinon.assert.calledOnce(socketMock.send);
        sinon.assert.calledWith(socketMock.send, emit_message);
        is_emmited.should.be.true();
    });

    /**
     * @test {AbstractWsController#emitToSession}
     */
    it('Should send emit to queue if there if user online but connected to different cluster', async () => {
        const rabbit_message = 'composed rabbitMQ message';
        const session_props = { user_id: connected_user_id1, queue_name: 'some_cluster_id', session_token_hash: 'current_session_token_hash' };
        sandbox.stub(sessionControllerMock, 'getSession').returns({ property(prop_name) {
            return session_props[prop_name];
        }});
        sandbox.stub(RabbitMQMock, 'createMessage').returns(rabbit_message);
        sandbox.stub(server_params_mock.rabbit_channels.WS_QUEUE_CHANNEL, 'sendToQueue');

        const is_emmited = await abstractWsController.emitToSession(connected_user_id1, 'session_token_which_connected_to_other_cluster', 'some emit message');

        sinon.assert.calledOnce(server_params_mock.rabbit_channels.WS_QUEUE_CHANNEL.sendToQueue);
        sinon.assert.calledWith(
            server_params_mock.rabbit_channels.WS_QUEUE_CHANNEL.sendToQueue,
            session_props.queue_name,
            rabbit_message
        );
        is_emmited.should.be.true();
    });

    /**
     * @test {AbstractWsController#emitToSession}
     */
    it('Should do nothing if user is not connected to any of the clusters', async () => {
        const rabbit_message = 'composed rabbitMQ message';
        sandbox.stub(sessionControllerMock, 'getSession').returns(null);
        sandbox.stub(RabbitMQMock, 'createMessage').returns(rabbit_message);
        sandbox.stub(socketMock, 'send');
        sandbox.stub(server_params_mock.rabbit_channels.WS_QUEUE_CHANNEL, 'sendToQueue');

        const is_emmited = await abstractWsController.emitToSession(connected_user_id1, 'session_token_which_is_not_connected_to_other_cluster', 'some emit message');

        sinon.assert.notCalled(socketMock.send);
        sinon.assert.notCalled(server_params_mock.rabbit_channels.WS_QUEUE_CHANNEL.sendToQueue);
        is_emmited.should.be.false();
    });

    /**
     * @test {AbstractWsController#emit}
     */
    it('Should send emits to all connected user sessions', async () => {
        const emit_message = 'Some emit message';
        sandbox.stub(socketMock, 'send');
        sandbox.stub(sessionControllerMock, 'getSessions').returns([
            { session_token: session_token1_cuid2, queue_name: 'some_cluster_id' },
            { session_token: session_token2_cuid2, queue_name: 'some_cluster_id' },
        ]);

        const is_emmited = await abstractWsController.emit(connected_user_id2, emit_message);

        sinon.assert.calledTwice(socketMock.send);
        sinon.assert.calledWith(socketMock.send, emit_message);
        is_emmited.should.be.true();
    });

    /**
     * @test {AbstractWsController#emit}
     */
    it('Should send emits to user sessions except session specified in options', async () => {
        const emit_message = 'Some emit message';
        sandbox.stub(socketMock, 'send');
        sandbox.stub(sessionControllerMock, 'getSessions').returns([
            { session_token: session_token1_cuid2, queue_name: 'some_cluster_id' },
            { session_token: session_token2_cuid2, queue_name: 'some_cluster_id' },
        ]);

        const is_emmited = await abstractWsController.emit(connected_user_id2, emit_message, { except_session: session_token1_cuid2 });

        sinon.assert.calledOnce(socketMock.send);
        sinon.assert.calledWith(socketMock.send, emit_message);
        is_emmited.should.be.true();
    });

    /**
     * @test {AbstractWsController#emit}
     */
    it('Should send emits to users which connected to other clusters', async () => {
        const rabbit_message = 'composed rabbitMQ message';
        const session_props = { user_id: 'user_connected_to_other_cluster', queue_name: 'some_cluster_id', session_token_hash: 'current_session_token_hash' };
        sandbox.stub(sessionControllerMock, 'getSession').returns({ property(prop_name) {
            return session_props[prop_name];
        }});
        sandbox.stub(sessionControllerMock, 'getSessions').returns([
            { session_token: 'other_cluster_session1', queue_name: 'some_cluster_id' },
            { session_token: 'other_cluster_session2', queue_name: 'some_cluster_id' },
        ]);
        sandbox.stub(RabbitMQMock, 'createMessage').returns(rabbit_message);
        sandbox.stub(server_params_mock.rabbit_channels.WS_QUEUE_CHANNEL, 'sendToQueue');

        const is_emmited = await abstractWsController.emit(connected_user_id2, 'some emit message');

        sinon.assert.calledTwice(server_params_mock.rabbit_channels.WS_QUEUE_CHANNEL.sendToQueue);
        sinon.assert.calledWith(
            server_params_mock.rabbit_channels.WS_QUEUE_CHANNEL.sendToQueue,
            session_props.queue_name,
            rabbit_message
        );
        is_emmited.should.be.true();
    });

    /**
     * @test {AbstractWsController#emit}
     */
    it('Should do nothing if user is not connected to any of the clusters', async () => {
        const rabbit_message = 'composed rabbitMQ message';
        sandbox.stub(sessionControllerMock, 'getSessions').returns([
            { session_token: session_token1_cuid1, queue_name: '' },
            { session_token: session_token2_cuid1, queue_name: '' },
        ]);
        sandbox.stub(RabbitMQMock, 'createMessage').returns(rabbit_message);
        sandbox.stub(socketMock, 'send');
        sandbox.stub(server_params_mock.rabbit_channels.WS_QUEUE_CHANNEL, 'sendToQueue');

        const is_emmited = await abstractWsController.emitToSession(
            connected_user_id1,
            'session_token_which_is_not_connected_to_other_cluster',
            'some emit message'
        );

        sinon.assert.notCalled(socketMock.send);
        sinon.assert.notCalled(server_params_mock.rabbit_channels.WS_QUEUE_CHANNEL.sendToQueue);
        is_emmited.should.be.false();
    });

    /**
     * @test {AbstractWsController#emitOrNotification}
     */
    it('Should emit to online user sessions and send notification to offline user sessions', async () => {
        const emit_message = 'Some emit message';
        const rabbit_message = 'composed rabbitMQ message';
        sandbox.stub(socketMock, 'send');
        sandbox.stub(sessionControllerMock, 'getSessions').returns([
            { session_token: 'offline_session_token1', queue_name: '', notification_token: 'some_notification_token', device_type: 'some_device_type' },
            { session_token: session_token2_cuid1, queue_name: 'current_cluster_name' },
        ]);
        sandbox.stub(server_params_mock.rabbit_channels.NOTIFICATION_CHANNEL, 'sendToQueue');
        sandbox.stub(RabbitMQMock, 'createMessage').returns(rabbit_message);

        const is_emmited = await abstractWsController.emitOrNotification(connected_user_id1, emit_message);

        sinon.assert.calledOnce(socketMock.send);
        sinon.assert.calledOnce(server_params_mock.rabbit_channels.NOTIFICATION_CHANNEL.sendToQueue);
        sinon.assert.calledWith(socketMock.send, emit_message);
        sinon.assert.calledWith(
            server_params_mock.rabbit_channels.NOTIFICATION_CHANNEL.sendToQueue,
            abstractWsController._NOTIFICATION_QUEUE,
            rabbit_message
        );
        
        is_emmited.should.be.true();
    });

    /**
     * @test {AbstractWsController#emitAndNotification}
     */
    it('Should both send notification and emit for all online user sessions and just send notification for offline user sessions', async () => {
        const emit_message = 'Some emit message';
        const rabbit_message = 'composed rabbitMQ message';
        sandbox.stub(socketMock, 'send');
        sandbox.stub(sessionControllerMock, 'getSessions').returns([
            {
                session_token: 'offline_session_token1',
                queue_name: '',
                notification_token: 'some_notification_token',
                device_type: 'some_device_type',
            },
            {
                session_token: session_token2_cuid1,
                queue_name: 'current_cluster_name',
                notification_token: 'some_notification_token',
                device_type: 'some_device_type',
            },
        ]);
        sandbox.stub(server_params_mock.rabbit_channels.NOTIFICATION_CHANNEL, 'sendToQueue');
        sandbox.stub(RabbitMQMock, 'createMessage').returns(rabbit_message);

        const is_emmited = await abstractWsController.emitAndNotification(connected_user_id1, emit_message);

        sinon.assert.calledOnce(socketMock.send);
        sinon.assert.calledTwice(server_params_mock.rabbit_channels.NOTIFICATION_CHANNEL.sendToQueue);
        sinon.assert.calledWith(socketMock.send, emit_message);
        sinon.assert.calledWith(
            server_params_mock.rabbit_channels.NOTIFICATION_CHANNEL.sendToQueue,
            abstractWsController._NOTIFICATION_QUEUE,
            rabbit_message
        );
        
        is_emmited.should.be.true();
    });

    /**
     * @test {AbstractWsController#emitOrNotificationToSession}
     */
    it('Should emit to connected user session', async () => {
        sandbox.stub(socketMock, 'send');
        
        const emit_message = 'Some emit message';
        const is_emmited = await abstractWsController.emitOrNotificationToSession(connected_user_id1, session_token1_cuid1, emit_message);

        sinon.assert.calledOnce(socketMock.send);
        sinon.assert.calledWith(socketMock.send, emit_message);
        is_emmited.should.be.true();
    });

    /**
     * @test {AbstractWsController#emitOrNotificationToSession}
     */
    it('Should send emit to queue if there if user online but connected to different cluster', async () => {
        const rabbit_message = 'composed rabbitMQ message';
        const session_props = { user_id: connected_user_id1, queue_name: 'some_cluster_id', session_token_hash: 'current_session_token_hash' };
        sandbox.stub(sessionControllerMock, 'getSession').returns({ property(prop_name) {
            return session_props[prop_name];
        }});
        sandbox.stub(RabbitMQMock, 'createMessage').returns(rabbit_message);
        sandbox.stub(server_params_mock.rabbit_channels.WS_QUEUE_CHANNEL, 'sendToQueue');

        const is_emmited = await abstractWsController.emitOrNotificationToSession(
            connected_user_id1,
            'session_token_which_connected_to_other_cluster',
            'some emit message'
        );

        sinon.assert.calledOnce(server_params_mock.rabbit_channels.WS_QUEUE_CHANNEL.sendToQueue);
        sinon.assert.calledWith(
            server_params_mock.rabbit_channels.WS_QUEUE_CHANNEL.sendToQueue,
            session_props.queue_name,
            rabbit_message
        );
        is_emmited.should.be.true();
    });

    /**
     * @test {AbstractWsController#emitOrNotificationToSession}
     */
    it('Should do send notification if user is not connected to any of the clusters', async () => {
        const rabbit_message = 'composed rabbitMQ message';
        sandbox.stub(sessionControllerMock, 'getSession').returns({
            session_token: 'offline_session_token1',
            queue_name: '',
            notification_token: 'some_notification_token',
            device_type: 'some_device_type',
            property(prop_name) {
                return this[prop_name];
            },
        });
        sandbox.stub(RabbitMQMock, 'createMessage').returns(rabbit_message);
        sandbox.stub(socketMock, 'send');
        sandbox.stub(server_params_mock.rabbit_channels.NOTIFICATION_CHANNEL, 'sendToQueue');

        const is_emmited = await abstractWsController.emitOrNotificationToSession(
            connected_user_id1,
            'session_token_which_is_not_connected_to_other_cluster',
            'some emit message'
        );

        sinon.assert.notCalled(socketMock.send);
        sinon.assert.calledOnce(server_params_mock.rabbit_channels.NOTIFICATION_CHANNEL.sendToQueue);
        sinon.assert.calledWith(
            server_params_mock.rabbit_channels.NOTIFICATION_CHANNEL.sendToQueue,
            abstractWsController._NOTIFICATION_QUEUE,
            rabbit_message
        );

        is_emmited.should.be.false();
    });
});
