define([
    'lib/socket.io',
    'lib/events',
    'lib/lodash',
    'lib/sha256',
    'game-logic/clib'
], function(
    io,
    Events,
    _,
    SHA256,
    Clib
) {
    var chatHost = CHAT_URI || window.document.location.host.replace(/:3001$/, ':4000');

    var WebApi = function() {
        _.extend(this, Events);

        this.conStatus = 'DISCONNECTED'; // DISCONNECTED || CONNECTED || LOGGED || JOINED || ERROR
        this.error = false;
        this.history = [];
        this.cid = null;
        this.numUsers = null;
        this.unreadMessages = 0;

        document.addEventListener("visibilitychange", this.onVisibilityChange.bind());
    };

    WebApi.prototype.onVisibilityChange = function() {
        if(document.visibilityState === 'visible') {
            this.unreadMessages = 0;
            document.title = 'DustDice Casino';
        }
    };

    WebApi.prototype.connect = function(accessToken, username) {
        this.accessToken = accessToken;
        this.username = username;

        this.ws = io(chatHost, { multiplex: false });

        this.ws.on('connect', this.onConnect.bind(this));
        this.ws.on('disconnect', this.onDisconnect.bind(this));
        this.ws.on('error', this.onError.bind(this)); //Socket io errors

        this.ws.on('new_message', this.onMessage.bind(this));
        this.ws.on('client_error', this.onError.bind(this));
        this.ws.on('user_joined', this.onUserJoined.bind(this));
        this.ws.on('user_left', this.onUserLeft.bind(this));
        this.ws.on('system_message', this.onSystemMessage.bind(this));
    };

    WebApi.prototype.onConnect = function() {
        var self = this;

        var authPayload = {
            app_id: 1,
            token_hash: SHA256.hash(self.accessToken)
        };
        self.ws.emit('auth', authPayload, function(err, data) {
            if(err) {
                self.conStatus = 'ERROR';
                self.trigger('error');
                return;
            }

            self.room = data.room;
            self.user = data.user;
            self.conStatus = 'JOINED';

            self.trigger('joined');
        });

        self.conStatus = 'CONNECTED';
        this.trigger('change');
    };

    WebApi.prototype.onDisconnect = function() {
        this.conStatus = 'DISCONNECTED';
        this.trigger('disconnected');
    };

    WebApi.prototype.onMessage = function(msg) {

        //Test if the new message contains a mention to you
        if (this.username != msg.user.uname && Clib.newMentionRegExp(this.username).test(msg.text))
            Clib.beep();

        if (self.history.length > 500)
            self.history.splice(0, 400);

        this.room.history.push(msg);

        if(document.visibilityState === 'hidden') {
            this.unreadMessages += 1;
            document.title = '[' + this.unreadMessages + '] DustDice Casino';
        }

        this.trigger('message');
    };

    WebApi.prototype.onUserJoined = function(user) {
        if(this.conStatus === 'JOINED') {
            this.room.users[user.uname] = user;
            this.trigger('user_joined');
        }
    };

    WebApi.prototype.onUserLeft = function(user) {
        delete this.room.users[user.uname];
        this.trigger('user_left');
    };

    WebApi.prototype.onSystemMessage = function(message) {
        console.log(message);
    };

    WebApi.prototype.onError = function(err) {
        console.error('[Chat error] ', err);
    };

    WebApi.prototype.disconnect = function() {
        this.ws.disconnect();
    };

    WebApi.prototype.sendMsg = function(msg) {
        this.ws.emit('new_message', msg, function(err) {
        });
    };

    return new WebApi();


    function checkHistoryForMentions(history) {
        for(var i = 0, len = history.length; i < len; i++) {
            if(Clib.mentionRegExp.test(history[i].text))
                history[i].mention = true;
        }
    }

});