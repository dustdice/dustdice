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
        self.HOUSE_EDGE = 2;

        /** Initial State **/

        self.gameState = 'OFFLINE'; //STANDING_BY || BETTING || OFFLINE || REFRESHING

        self.balance = null;

        self.winProb = 49;

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
        self.depositAddress = null;

        self.currentBet = null; //The betting info while the gameState is 'BETTING'

        self.gameHistory = []; // { wager: satoshis, payout: 2.03, win: boolean }


        if(!Clib.browserSupport())
            self.setErrorState('We unfortunately don\'t support your browser');

        var params = Clib.getHashParams();

        window.history.replaceState({}, '', '#');

        if (params['access_token']) {
          self.accessToken = params['access_token'];
          localStorage['access_token'] = self.accessToken;
        } else if (localStorage['access_token']) {
          self.accessToken = localStorage['access_token'];
        } else {
          self.setErrorState('Could not find a valid access token');
        }


        // TODO: handle state, and expires_in

        //Get settings from localStorage if they exist
        var wager = JSON.parse(localStorage.wager ? localStorage.wager : null);
        this.wager = (typeof wager === 'number' && wager > 0)? wager : this.wager;

        var jackpot = JSON.parse(localStorage.jackpot ? localStorage.jackpot : null);
        this.jackpot = (typeof jackpot === 'number' && jackpot > 0)? jackpot : this.jackpot;

        var winProb = JSON.parse(localStorage.winProb ? localStorage.winProb : null);
        this.winProb = (typeof localStorage.winProb === 'number' && winProb > 0 && winProb < 98)? winProb : this.winProb;


        WebApi.requestInitialData(self.accessToken, self.errorHandler(function(data) {

            self.balance = data.balance;
            self.nextGameHash = data.hash;
            self.vaultBankroll = data.bankroll;
            self.depositAddress = data.depositAddress;
            self.maxWin = self.vaultBankroll * 0.01;
            self.gameState = 'STANDING_BY';

            self.trigger('get-user-data');
        }));


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


    GameEngine.prototype.errorHandler = function(callback) {
        var self= this;

        return function(err, data) {
            if (err) {
                console.assert(err.message);

                switch (err.message) {
                    case 'INVALID_ACCESS_TOKEN':
                        self.setErrorState('INVALID ACCOUNT');
                        return;
                    case 'BANKROLL_TOO_SMALL':
                        self.gameState = 'STANDING_BY';
                        self.trigger('user-alert', "Vault rejected this bet because it exceeds they limits");
                        return;
                    case 'NOT_ENOUGH_BALANCE':
                        self.gameState = 'STANDING_BY';
                        self.refreshBalance();
                        self.trigger('user-alert', 'Not enough balance to bet');
                        return;
                    default:
                        self.setErrorState(err.message);
                        return;
                }

            }
            callback(data);
        }
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
        self.currentBet = {
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
            Clib.roundTo100(self.currentBet.wager),
            self.currentBet.winProb,
            self.currentBet.hash,
            self.currentBet.seed,
            self.currentBet.hiLo,
            self.currentBet.accessToken,
            self.currentBet.jackpot,
            self.errorHandler(function(game){

                //Test the hash of the game & the outcome of the game
                var hash = SHA256.hash(game.secret + '|' + game.salt);
                var vaultOutcome = (game.secret + self.currentBet.seed) % Math.pow(2,32);
                var outcome = Math.floor(vaultOutcome / (Math.pow(2,32) / 100) ) + 1;
                if(self.nextGameHash !== hash || game.outcome !== outcome) {
                    self.setErrorState('Could not prove that the game was fair :/');
                    return;
                }

                self.clientSeed = Clib.randomUint32();

                //FOR TESTING THE JACKPOT
                //Do we won the jackpot? Could give us false positive if the bet is the same than the jackpot and we win that works for testing
                //if(game.profit == self.jackpot)

                if(game.profit > 0 && !game.wonJackpot)
                    game.wonBet = true;

                //Set the new balance in the engine
                self.balance += game.profit;
                //Set the new hash in the engine
                self.nextGameHash = game.next_hash;

                //Append the new balance in the game
                game.balance = self.balance;
                //Append game info to the result
                game.wager = self.currentBet.wager;
                game.winProb = self.currentBet.winProb;
                game.hiLo = self.currentBet.hiLo;


                self.gameHistory.push(game);

                //if(self.gameHistory.length > historyMaxLength)
                //    self.gameHistory.shift();

                self.gameState = 'STANDING_BY';

                self.currentBet = null; //Clear the current Bet

                //Send a copy of the game result values, do not edit this object in components!
                Object.seal(game);//Avoid some component do weird things on the object
                self.trigger('bet-end', game);
            })); //\WebApi.bet

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
        console.assert(newWager > 0);
        this.wager = newWager;
        localStorage.wager = this.wager;
        this.trigger('new-wager')
    };

    GameEngine.prototype.setJackpot = function(jackpot) {
        console.assert(Clib.isInteger(jackpot) && jackpot > 0);
        this.jackpot = jackpot;
        localStorage.jackpot = this.jackpot;
        this.trigger('new-jackpot');
    };

    GameEngine.prototype.setWinProb = function(newWinProb) {
        console.assert(Clib.isInteger(newWinProb) && newWinProb>=1 && newWinProb <= 97);
        this.winProb = newWinProb;
        localStorage.winProb = this.winProb;
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


    /** Engine API Helpers **/

    GameEngine.prototype.increaseWinProb = function() {
        if(this.winProb<= 96)
            this.setWinProb(this.winProb + 1);
    };

    GameEngine.prototype.decreaseWinProb = function() {
        if(this.winProb>=2)
            this.setWinProb(this.winProb - 1);
    };

    /**
     * Refresh the balance and the bankroll
     * Triggers:
     * 'refreshing-data': On start
     * 'new-balance': if it gets a new balance || 'refresh-data': If not a new balance
     */
    GameEngine.prototype.refreshBalance = function() {
        var self = this;

        if(self.gameState === 'REFRESHING')
            return;

        self.gameState = 'REFRESHING';
        self.trigger('refreshing-data');

        WebApi.refreshData(this.accessToken, self.errorHandler(function(data) {
            console.assert(typeof data.balance === 'number');
            console.assert(typeof data.bankroll === 'number');

            self.gameState = 'STANDING_BY';
            self.vaultBankroll = data.bankroll;

            if(self.balance !== data.balance) {
                self.balance = data.balance;

                self.trigger('new-balance', {
                    balance: self.balance,
                    wager: self.wager,
                    winProb: self.winProb //TODO: And if instead of sending the current state i just get it from the graph?
                });
            }

            self.trigger('refresh-data');
        }));
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


