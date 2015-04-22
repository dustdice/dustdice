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
    var chatHost = CHAT_URI || window.document.location.host.replace(/:3001$/, ':4000');

    var WebApi = function() {
        console.assert(Engine.gameState !== 'OFFLINE');
        _.extend(this, Events);
        var self = this;

        self.conStatus = 'DISCONNECTED'; // DISCONNECTED || CONNECTED || LOGGED || JOINED || ERROR
        self.error = false;
        self.history = [];
        self.cid = null;
        self.numUsers = null;

        self.ws = io(chatHost, { multiplex: false });

        self.ws.on('connect', self.onConnect.bind(this));
        self.ws.on('disconnect', self.onDisconnect.bind(this));
        self.ws.on('channel_info', self.onChannelInfo.bind(this));
        self.ws.on('message', self.onMessage.bind(this));
        self.ws.on('err', self.onError.bind(this)); //Error events from the server
        self.ws.on('error', self.onError.bind(this)); //Socket io errors
    };

    WebApi.prototype.onConnect = function() {
        var self = this;

        var hash = SHA256.hash(Engine.accessToken);
        self.ws.emit('auth', hash, function(err, info) {
            if(err) {
                self.conStatus = 'ERROR';
                self.trigger('error');
                return;
            }

            self.ws.emit('join_channel', { aid: 1, chan: 'general' }, function(err, info) {
                if (err) {
                    console.error(err);
                    return
                }

                self.cid = info.cid;
                self.history = info.history;
                self.numUsers = info.num_users;
                self.conStatus = 'JOINED';
                self.trigger('joined');
            });
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
        this.history.push(msg);
        this.trigger('message');
    };

    WebApi.prototype.onChannelInfo = function(info) {
        //console.log('[info]', info);
        //this.cid = info.cid;
        //this.conStatus = 'JOINED';
        //this.trigger('joined');
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