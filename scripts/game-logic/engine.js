/**
 * Important: Do not edit the values sent by the event system
 * Other modules could use the same values
 */
define([
    'lib/events',
    'lib/lodash',
    'lib/clib',
    'web-api/web-api'
], function(
    Events,
    _,
    Clib,
    WebApi
){
    //var historyMaxLength = 100;

    function requestNextGameHash(callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = handleStateChange;
        if (!xhr) throw new Error("Browser doesn't support xhr");
        xhr.open('GET', 'http://localhost:3000/v1/bet/generate-hash');
        xhr.send();

        function handleStateChange() {
            if(xhr.readyState === 4) {

                if(!xhr.response)
                    throw new Error('Bad response'); //TODO: Reload the page and alert the user

                callback(JSON.parse(xhr.response));
            }
        }
    }

    function requestAccountData(accessToken, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = handleStateChange;
        if (!xhr) throw new Error("Browser doesn't support xhr"); //TODO: Alert the user
        xhr.open('GET', 'http://localhost:3000/oauth/tokens/'+accessToken);
        xhr.send();

        function handleStateChange() {
            if (xhr.readyState === 4) {

                if(!xhr.response)
                    throw new Error('Bad response'); //TODO: Reload the page and alert the user

                callback(JSON.parse(xhr.response));

            }
        }
    }

    var gameEngine = function() {
        _.extend(this, Events);
        var self = this;

        self.gameHistory = []; // { wager: satoshis, payout: 2.03, win: boolean }
        self.gameState = 'STANDING_BY'; //STANDING_BY || BETTING

        self.winProb = 49;

        //Wager is a float but is rounded when betting and when showing it to the user, this allows to chase bet on small qty's to actually work
        //Use Math.round(), is as close as you can get.
        self.wager = 1e2;

        /* Constants */
        self.HOUSE_EDGE = 2;

        /* Temporal Constants */
        self.balance = null;
        self.maxBet  = 10000e8; //TODO: Remove Max Bet, it will be added later
        self.jackpot = 1e8; //1BTC = 1,000,000bits = 100,000,000 Satoshis //TODO: Add the jackpot to the settings?
        self.nextGameHash = null; //TODO: Show that there is no gameHash on settings

        self.clientSeed = 4294967295; //Max 2^32b TODO: Generate this

        /* Hardcoded vars */
        self.accessToken =  '82c5bbe7-d9fd-4f5d-a06c-e34e588db2fd'; //TODO: This is sent by the server in the hash
        self.state = 'xyz'; //TODO: Check that the stored state and the returned by the server are equals

        requestAccountData(self.accessToken, function(data) {
            self.balance = data.balance;

            requestNextGameHash(function(hash) {
                self.nextGameHash = hash;
                self.trigger('get-user-data');
            });
        });

    };


    /** Engine API **/

    gameEngine.prototype.bet = function(hiLo) {
        var self = this;

        console.assert(typeof hiLo === 'boolean');
        console.assert(self.balance >= self.wager && self.wager > 0);
        console.assert(self.gameState != 'BETTING');

        self.gameState = 'BETTING';

        /** Save the current state of the engine, do not send it by reference to other modules
            This object will be modified and saved in the graph history */
        var currentBet = {
            wager: Clib.roundSatToTwo(self.wager), //Round the wager by two decimal places since we only bet bits
            winProb: self.winProb,
            hiLo: hiLo,
            balance: self.balance,
            hash: self.nextGameHash,
            seed: self.clientSeed,
            accessToken: self.accessToken
        };

        WebApi.bet(currentBet.wager, currentBet.winProb, currentBet.hash, currentBet.seed, currentBet.hiLo, currentBet.accessToken, function(err, game){
            if(err) {
                console.log('alert');
                alert('Error doing the bet, reload the page: ' + err.message);
                return console.error( new Error('Error on WebApi: ' + err) );
            }

            //Set the new balance in the engine
            self.balance += game.profit;
            //Set the new hash in the engine
            self.nextGameHash = game.next_hash;

            //Append the new balance in the game
            game.balance = self.balance;
            //Append game info to the result
            game.wager = currentBet.wager;
            game.winProb = currentBet.winProb;
            game.hiLo = currentBet.hiLo;


            self.gameHistory.push(game);

            //if(self.gameHistory.length > historyMaxLength)
            //    self.gameHistory.shift();

            self.gameState = 'STANDING_BY';

            //Send a copy of the game result values, do not edit this object in components!
            Object.seal(game);//Avoid some component do weird things on the object
            self.trigger('bet-end', game);
        });

        self.nextGameHash = null; //The hash was used so we kill it

        //Send a copy of the current values of the bet, do not edit this object in components!
        var betSent = {
            wager: self.wager,
            balance: self.balance,
            winProb: self.winProb,
            hiLo: hiLo
        };
        Object.seal(betSent); //Avoid some component do weird things on the object
        self.trigger('bet-sent', betSent);
    };


    /** Engine API **/

    gameEngine.prototype.setWager = function(newWager) {
        //console.assert(Clib.isInteger(newWager/100));
        //console.assert(newWager <= this.balance && newWager <= this.maxBet);
        this.wager = newWager;
        this.trigger('new-wager-data')

    };

    gameEngine.prototype.setWinProb = function(newWinProb) {
        console.assert(Clib.isInteger(newWinProb) && newWinProb>=1 && newWinProb <=98); //TODO: Is this up to date?
        this.winProb = newWinProb;
        this.trigger('new-wager-data');
    };

    gameEngine.prototype.setClientSeed = function(newSeed) {
        this.clientSeed = newSeed;
        this.trigger('set-client-seed');
    };

    gameEngine.prototype.clearHistory = function() {
        this.gameHistory = [];
        this.trigger('history-clear');
    };

    gameEngine.prototype.genClientSeed = function() {
        this.clientSeed = Math.floor(Math.random()*4294967296) + 1;  //TODO: Use window.crypto or something like that
        this.trigger('new-client-seed');
    };


    return new gameEngine();
});