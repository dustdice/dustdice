define([
    'game-logic/engine',
    'lib/socket.io',
    'lib/events',
    'lib/lodash',
    'lib/sha256',
    'game-logic/clib'
], function(
    Engine,
    io,
    Events,
    _,
    SHA256,
    Clib
) {
    var chatHost = CHAT_URI;
    var mark = false;
    var betsAmount = 0;
    
    var Chat = function() {
        _.extend(this, Events);

        this.conStatus = 'DISCONNECTED'; // DISCONNECTED || CONNECTED || LOGGED || JOINED || ERROR
        this.error = false;
        this.history = null;
        this.userList = null;
        this.user = null;
        this.unreadMessages = 0;

        document.addEventListener("visibilitychange", this.onVisibilityChange.bind());
    };

    Chat.prototype.onVisibilityChange = function() {
        if(document.visibilityState === 'visible') {
            this.unreadMessages = 0;
            document.title = 'DustDice Casino';
        }
    };

    Chat.prototype.connect = function(accessToken, username) {
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
        
        this.ws.on('balance_change', this.onBalanceChange.bind(this));
        
        this.ws.on('new_bet', this.onNewBet.bind(this));
    };

    Chat.prototype.onConnect = function() {
        var self = this;

        var authPayload = {
            app_id: 1,
            access_token: self.accessToken,
            subscriptions: ['CHAT', 'DEPOSITS', 'BETS']
        };

        self.ws.emit('auth', authPayload, function(err, data) {
            if(err) {
                self.conStatus = 'ERROR';
                self.trigger('error');
                return;
            }

            self.history = data.chat.messages;
            self.userList = data.chat.userlist;
            self.user = data.user;
            self.conStatus = 'JOINED';

            self.trigger('joined');
            
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (xhttp.readyState == 4 && xhttp.status == 200) {
                    var data = JSON.parse(xhttp.responseText);
                    var table = document.getElementById("allbets-list");
                    for(var i=data.length-1; i>=0; i--){
                        betsAmount++;
        
                        var id = data[i].id,
                            profit = parseFloat(data[i].profit/100),
                            username = data[i].uname,
                            bet = parseFloat(data[i].wager/100).toFixed(0),
                            multiplier = ((data[i].payouts[0].value/100)/bet);
                        var win = profit >= 0;
                        
                        var row = table.insertRow(0);
                        
                        var cell1 = row.insertCell(0);
                        var cell2 = row.insertCell(1);
                        var cell3 = row.insertCell(2);
                        var cell4 = row.insertCell(3);
                        var cell5 = row.insertCell(4);
                        
                        cell1.innerHTML = "<a href=\"https://www.moneypot.com/bets/"+id+"\" target=\"blank\">"+id+"</a>";
                        cell2.innerHTML = username;
                        cell3.innerHTML = bet+" Bits";
                        cell4.innerHTML = multiplier+"x";
                        cell5.innerHTML = (win?"+":"")+profit;
                        cell5.className = (win?"win":"lose");
                        
                        if(mark){
                            row.className = "marked";
                            mark = false;
                        }else{
                            row.className = "notMarked";
                            mark = true;
                        }
                    }
                }
            };
            xhttp.open("GET", "https://api.moneypot.com/v1/list-bets?app_id=1&access_token="+authPayload.access_token, true);
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send();
        });

        self.conStatus = 'CONNECTED';
        this.trigger('change');
    };

    Chat.prototype.onDisconnect = function() {
        this.conStatus = 'DISCONNECTED';
        this.trigger('disconnected');
    };
    
    Chat.prototype.onBalanceChange = function() {
        Engine.refreshBalance();
    };
    
    Chat.prototype.onNewBet = function(data) {
        betsAmount++;
        
        var id = data.bet_id,
            profit = parseFloat(data.profit/100),
            username = data.uname,
            bet = parseFloat(data.wager/100).toFixed(0),
            multiplier = ((data.payouts[0].value/100)/bet);
        var win = profit >= 0;
        
        var table = document.getElementById("allbets-list");
        
        var row = table.insertRow(0);
        
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);
        
        cell1.innerHTML = "<a href=\"https://www.moneypot.com/bets/"+id+"\" target=\"blank\">"+id+"</a>";
        cell2.innerHTML = username;
        cell3.innerHTML = bet+" Bits";
        cell4.innerHTML = multiplier+"x";
        cell5.innerHTML = (win?"+":"")+profit;
        cell5.className = (win?"win":"lose");
        
        if(mark){
            row.className = "marked";
            mark = false;
        }else{
            row.className = "notMarked";
            mark = true;
        }
        
        if(betsAmount>100){
            var rowCount = table.rows.length;
            table.deleteRow(rowCount -1);
            betsAmount = 100;
        }
        
    };

    /** Chat message
     *
     * if msg.user exist its an user message
     * else its s system message e.g. 'Ryan muted sarah for 8 minutes'
     */
    Chat.prototype.onMessage = function(msg) {

        //Test if the new message contains a mention to you
        if (msg.user && (this.username != msg.user.uname) && Clib.newMentionRegExp(this.username).test(msg.text))
            Clib.beep();

        if (self.history.length > 500)
            self.history.splice(0, 400);

        this.history.push(msg);

        if(document.visibilityState === 'hidden') {
            this.unreadMessages += 1;
            /*document.title = '[' + this.unreadMessages + '] DustDice Casino';*/
            document.title = '[New] DustDice Casino';
        }

        this.trigger('message');
    };

    Chat.prototype.onUserJoined = function(user) {
        if(this.conStatus === 'JOINED') {
            this.userList[user.uname] = user;
            this.trigger('user_joined');
        }
    };

    Chat.prototype.onUserLeft = function(user) {
        delete this.userList[user.uname];
        this.trigger('user_left');
    };

    Chat.prototype.onError = function(err) {
        console.error('[Chat error] ', err);
    };

    Chat.prototype.disconnect = function() {
        this.ws.disconnect();
    };

    Chat.prototype.sendMsg = function(msg) {
        var self = this;

        var msgPayload = {
            text: msg
        };

        this.ws.emit('new_message', msgPayload, function(err, message) {
            if (err) {
                switch(err) {
                    case 'USER_IS_MUTED':
                        self.history.push({ text: 'You are muted.' });
                        self.trigger('message');
                        break;
                    case 'INVALID_MUTE_COMMAND':
                        self.history.push({ text: 'Invalid mute command.' });
                        self.trigger('message');
                        break;
                    case 'USER_NOT_FOUND':
                        self.history.push({ text: 'User not found.' });
                        self.trigger('message');
                        break;
                    default:
                        console.log('Error when submitting new_message to server:', err);
                        break;
                }
            }
        });
    };

    return new Chat();

    function checkHistoryForMentions(history) {
        for(var i = 0, len = history.length; i < len; i++) {
            if(Clib.mentionRegExp.test(history[i].text))
                history[i].mention = true;
        }
    }

});
