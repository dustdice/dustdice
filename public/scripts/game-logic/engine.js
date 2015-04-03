/**
 * Important: Do not edit the values sent by the event system
 * Other modules could use the same values
 */
define([
    'lib/events',
    'lib/lodash',
    'lib/clib',
    'web-api/web-api',
    'lib/sha256'
], function(
    Events,
    _,
    Clib,
    WebApi,
    SHA256
){
    //var historyMaxLength = 100;

    function GameEngine() {
        _.extend(this, Events);
        var self = this;

        /** Constants **/
        self.winProb = 49;
        self.HOUSE_EDGE = 2;

        /** Initial State **/

        self.gameState = 'OFFLINE'; //STANDING_BY || BETTING || OFFLINE || REFRESHING

        self.balance = null;

        //Wager is a float but is rounded when betting and when showing it to the user, this allows to chase bet on small qty's to actually work, Use Math.round(), is as close as you can get.
        self.wager = 1e2;

        //Low jackpot because we are poor :p
        self.jackpot = 100e2;

        //TODO: Remove max bet, it should be max profit
        self.maxBet  = 10000e8;

        //The game had a fatal error and reload page is needed
        self.error = false;

        //TODO: Show that there is no gameHash on settings?
        self.nextGameHash = null;

        self.clientSeed = Clib.randomUint32();

        self.accessToken = null;
        self.expiresIn = null;
        self.state = null; //TODO: Check that the stored state and the returned by the server are equals, generate uuid maybe
        self.vaultBankroll = null;
        self.maxWin = null;

        self.gameHistory = []; // { wager: satoshis, payout: 2.03, win: boolean }


        if(!Clib.browserSupport())
            self.setErrorState('Your browser is old, please open dustDice in a decent browser ;)');

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

            //TODO: validate the values?

            localStorage.accessToken = self.accessToken;
            localStorage.expiresIn = self.expiresIn;
            localStorage.state = self.state;
        }

        WebApi.requestInitialData(self.accessToken, function(err, data) {
            if(err) {
                switch (err.message) {
                    case 'INVALID_ACCESS_TOKEN':
                        self.setErrorState('INVALID ACCOUNT');
                        return;
                    default:
                        self.setErrorState(err.message);
                        return;
                }
            }

            self.balance = data.balance;
            self.nextGameHash = data.hash;
            self.vaultBankroll = data.bankroll;
            self.maxWin = self.vaultBankroll * 0.01;
            self.gameState = 'STANDING_BY';

            self.trigger('get-user-data');
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
            accessToken: self.accessToken,
            jackpot: self.jackpot
        };

        /**
         * DustDice bet API
         *
         * You can't win the jackpot and win the bet and the same time
         */
        WebApi.bet(
            Clib.roundTo100(currentBet.wager),
            currentBet.winProb,
            currentBet.hash,
            currentBet.seed,
            currentBet.hiLo,
            currentBet.accessToken,
            currentBet.jackpot,
            function(err, game){
                if (err) {
                    console.assert(err.message);

                    switch (err.message) {
                        case 'BANKROLL_TOO_SMALL':
                            self.gameState = 'STANDING_BY';
                            self.trigger('user-alert', 'The bet was too high');
                            return;
                        case 'NOT_ENOUGH_BALANCE': //TODO: Reload the balance of the user
                            self.gameState = 'STANDING_BY';
                            self.trigger('user-alert', 'Not enough balance to bet, please refresh the page');
                            return;
                        //TODO: Catch errors of the WEBAPI for better message display
                        default:
                            self.setErrorState(err.message);
                            return;
                    }

                }

            //Test the hash of the game & the outcome of the game
            var hash = SHA256.hash(game.secret + '|' + game.salt);
            var vaultOutcome = (game.secret + currentBet.seed) % Math.pow(2,32);
            var outcome = Math.floor(vaultOutcome / (Math.pow(2,32) / 100) ) + 1;
            if(self.nextGameHash !== hash || game.outcome !== outcome) {
                self.setErrorState('Could not prove that the game was fair :/');
                return;
            }

            self.clientSeed = Clib.randomUint32();

            //Do we won the jackpot? Could give us false positive if the bet is the same than the jackpot and we win that works for testing
            if(game.profit == self.jackpot)//TODO: NEW API wonJackpot coming in vault
                game.wonJackpot = true;
            //Do we won the bet
            else if(game.profit > 0)
                    game.wonBet = true;

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
        console.assert(Clib.isInteger(newWager) && newWager > 0);

        this.wager = newWager;
        this.trigger('new-wager')
    };

    GameEngine.prototype.setJackpot = function(jackpot) {
        console.assert(Clib.isInteger(jackpot) && jackpot > 0);

        this.jackpot = jackpot;
        this.trigger('new-jackpot');
    };

    GameEngine.prototype.setWinProb = function(newWinProb) {
        console.assert(Clib.isInteger(newWinProb) && newWinProb>=1 && newWinProb <= 97);
        this.winProb = newWinProb;
        this.trigger('new-win-prob');
    };

    GameEngine.prototype.setClientSeed = function(newSeed) {
        this.clientSeed = newSeed;
        this.trigger('set-client-seed');
    };

    GameEngine.prototype.clearHistory = function() {
        this.gameHistory = [];
        this.trigger('history-clear');
    };

    GameEngine.prototype.refreshBalance = function() {
        var self = this;
        self.gameState = 'REFRESHING';
        self.trigger('refreshing-balance');
        WebApi.requestAccountData(this.accessToken, function(err, data) {
            if (err)
                return self.setErrorState(err.message); //TODO: Handle Errors

            self.gameState = 'STANDING_BY';

            if(self.balance !== data.balance) {
                self.balance = data.balance;
                self.trigger('refresh-balance', {
                    balance: self.balance,
                    wager: self.wager,
                    winProb: self.winProb //TODO: And if instead of sending the current state i just get it from the graph?
                });
            }

            self.trigger('same-balance');
        });
    };

    GameEngine.prototype.goToVaultDeposit = function() {
        window.location.href = 'https://vault.moneypot.com/me/receive';
    };

    /** Helper functions **/

    GameEngine.prototype.isBetTooHigh = function() {
        return ((this.wager * (98/this.winProb) - this.wager) > this.maxWin)  || (this.jackpot > this.maxWin);
    };

    GameEngine.prototype.isBetValid = function() {
        return (this.wager > this.balance);
    };


    return new GameEngine();
});


