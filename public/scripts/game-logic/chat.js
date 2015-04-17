define([
    'lib/socket.io',
    'lib/events',
    'lib/lodash',
    'lib/sha256',
    'game-logic/engine'
], function(
    io,
    Events,
    _,
    SHA256,
    Engine
) {
    var chatHost = window.document.location.host === 'www.dustdice.com' ?
        'http://chat.moneypot.com/' :
        window.document.location.host.replace(/:3001$/, ':4000');

    var WebApi = function() {
        console.assert(Engine.gameState !== 'OFFLINE');
        _.extend(this, Events);
        var self = this;

        self.conStatus = 'DISCONNECTED'; // DISCONNECTED || CONNECTED || LOGGED || JOINED || ERROR
        self.error = false;
        self.chatHistory = [];
        self.cid = null;


        self.ws = io(chatHost, { multiplex: false });

        self.ws.on('connect', self.onConnect.bind(this));
        self.ws.on('disconnect', self.onDisconnect.bind(this));
        self.ws.on('channel_info', self.onChannelInfo.bind(this));
        self.ws.on('message', self.onMessage.bind(this));
        self.ws.on('err', self.onError.bind(this)); //Error events from the server
        self.ws.on('error', self.onError.bind(this)); //Socket io errors

    };

    WebApi.prototype.onConnect = function() {
        console.log('[Chat] connection established');
        var self = this;

        var hash = SHA256.hash(Engine.accessToken);
        console.log('[auth] authenticating hash ', hash);
        self.ws.emit('auth', hash, function(err, info) {
            if(err) {
                self.conStatus = 'ERROR';
                self.trigger('error');
                return;
            }

            console.log('[auth] ' + JSON.stringify(info));

            self.ws.emit('join_channel', { app: 'dustdice', chan: 'general' });
            self.conStatus = 'CONNECTED';
            self.trigger('logged');

        });

        self.conStatus = 'CONNECTED';
        this.trigger('change');
    };

    WebApi.prototype.onDisconnect = function() {
        this.conStatus = 'DISCONNECTED';
        this.trigger('disconnected');
    };

    WebApi.prototype.onMessage = function(msg) {
        this.chatHistory.push(msg);
        this.trigger('message');
    };

    WebApi.prototype.onChannelInfo = function(info) {
        console.log('[info]', info);
        this.cid = info.cid;
        this.conStatus = 'JOINED';
        this.trigger('joined');
    };

    WebApi.prototype.onError = function(err) {
        console.error('[Chat error] ', err);
    };

    WebApi.prototype.disconnect = function() {
        this.ws.disconnect();
    };

    WebApi.prototype.sendMsg = function(msg) {
        this.ws.emit('message', { cid: this.cid, text: msg });
    };

    return WebApi;

});