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

    function GameEngine() {
        _.extend(this, Events);
        var self = this;

        /** Constants **/
        self.winProb = 49;

        //The game had a fatal error and reload page is needed
        self.error = false;

        if(!Clib.browserSupport())
            self.setErrorState('Your browser is old, please open dustDice in a decent browser ;)');

        self.accessToken = null;
        self.expiresIn = null;
        self.state = null; //TODO: Check that the stored state and the returned by the server are equals, generate uuid maybe

        self.gameHistory = []; // { wager: satoshis, payout: 2.03, win: boolean }
        self.gameState = 'OFFLINE'; //STANDING_BY || BETTING || OFFLINE

        //Store the hash and remove it from the url, it is dangerous to let it there, it could be stolen from a picture or something
        var hash = window.location.hash;
        window.location.hash = '';

        if(!hash) {
            if(localStorage.accessToken) {
                self.accessToken = localStorage.accessToken;
                self.expiresIn = localStorage.expiresIn;
                self.state = localStorage.state;
            } else {
                self.setErrorState('Login session is missing');
            }
        } else {
            if(hash.indexOf('#')>-1)
                hash = hash.split('#')[1];
            hash = hash.split('&');

            self.accessToken = hash[0].split('=')[1];
            self.expiresIn = hash[1].split('=')[1];
            self.state = hash[2].split('=')[1];

            //TODO: validate the values

            localStorage.accessToken = self.accessToken;
            localStorage.expiresIn = self.expiresIn;
            localStorage.state = self.state;
        }

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

        self.clientSeed = 4294967295; //Max 2^32b (2^32-1) TODO: Generate this

        WebApi.requestAccountData(self.accessToken, function(err, data) {
            if(err)
                return self.setErrorState(err.message);

            self.balance = data.balance;

            WebApi.requestNextGameHash(self.accessToken, function(err, hash) {
                if(err)
                    return self.setErrorState(err.message);

                console.log('User Data: ', data, hash);

                self.nextGameHash = hash;
                self.gameState = 'STANDING_BY';

                self.trigger('get-user-data');
            });
        });

    }

    /** The first error on the engine is set and trigger the error, next errors are obviated **/
    GameEngine.prototype.setErrorState = function(errorMsg) {
        var self = this;
        console.assert(errorMsg === 'undefined' || typeof errorMsg === 'string');

        if(self.error == false) {
            if(errorMsg === 'undefined')
                self.error = true;
            else if(typeof errorMsg === 'string')
                self.error = errorMsg;
        }
        self.trigger('fatal-error');
    };

    /** Engine API **/

    GameEngine.prototype.bet = function(hiLo) {
        var self = this;

        console.assert(typeof hiLo === 'boolean');
        console.assert(self.balance >= self.wager && self.wager > 0);
        console.assert(self.gameState != 'BETTING');

        self.gameState = 'BETTING';

        /** Save the current state of the engine, do not send it by reference to other modules
            This object will be modified and saved in the graph history */
        var currentBet = {
            wager: Clib.roundTo100(self.wager), // Round the wager to the nearest bits
            winProb: self.winProb,
            hiLo: hiLo,
            balance: self.balance,
            hash: self.nextGameHash,
            seed: self.clientSeed,
            accessToken: self.accessToken
        };

        WebApi.bet(Clib.roundTo100(currentBet.wager),
            currentBet.winProb,
            currentBet.hash,
            currentBet.seed,
            currentBet.hiLo,
            currentBet.accessToken,
          function(err, game){
            if(err)
                return self.setErrorState(err.message);

            // TODO: verify game here...

            self.clientSeed = Clib.randomUint32();

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

    GameEngine.prototype.setWager = function(newWager) {
        //console.assert(Clib.isInteger(newWager/100));
        //console.assert(newWager <= this.balance && newWager <= this.maxBet);
        this.wager = newWager;
        this.trigger('new-wager-data')

    };

    GameEngine.prototype.setWinProb = function(newWinProb) {
        console.assert(Clib.isInteger(newWinProb) && newWinProb>=1 && newWinProb <= 97);
        this.winProb = newWinProb;
        this.trigger('new-wager-data');
    };

    GameEngine.prototype.setClientSeed = function(newSeed) {
        this.clientSeed = newSeed;
        this.trigger('set-client-seed');
    };

    GameEngine.prototype.clearHistory = function() {
        this.gameHistory = [];
        this.trigger('history-clear');
    };


    return new GameEngine();
});


