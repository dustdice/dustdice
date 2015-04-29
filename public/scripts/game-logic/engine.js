/**
 * Important: Do not edit the values sent by the event system
 * Other modules could use the same values
 */
define([
    'lib/events',
    'lib/lodash',
    'lib/clib',
    'web-api/web-api',
    'lib/sha256',
    'lib/cookies'
], function(
    Events,
    _,
    Clib,
    WebApi,
    SHA256,
    Cookies
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

        self.winChances = Clib.localOrDef('winChances', 50);

        //Wager is a float but is rounded when betting and when showing it to the user, this allows to chase bet on small qty's to actually work, Use Math.round(), is as close as you can get.
        self.wager =  Clib.localOrDef('wager', 1e2);

        //Low jackpot because we are poor :p
        self.jackpot =  Clib.localOrDef('jackpot', 100000e2);

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
        self.username = null;

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


        WebApi.requestInitialData(self.accessToken, self.errorHandler(function(data) {

            self.balance = data.balance;
            self.username = data.username;
            self.nextGameHash = data.hash;
            self.vaultBankroll = data.bankroll;
            self.depositAddress = data.depositAddress;
            self.maxWin = self.vaultBankroll * 0.01;
            self.gameState = 'STANDING_BY';

            //Set the access token and the expiration date in a cookie two days earlier, we don't want to expire while the user is playing
            Cookies.set('access_token', self.accessToken, { expires: data.expiresIn - 172800 });

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
                    case 'AUTH_DISABLED':
                        Cookies.expire('access_token');
                        self.setErrorState('This app is disabled, you can enable it back in MoneyPot.com');
                        return;
                    case 'INVALID_ACCESS_TOKEN':
                        Cookies.expire('access_token');
                        self.setErrorState('INVALID ACCOUNT');
                        return;
                    case 'BANKROLL_TOO_SMALL':
                        self.gameState = 'STANDING_BY';
                        self.trigger('user-alert', "MoneyPot rejected this bet because it exceeds they limits");
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


    /** Engine API
     *
     * Triggers:
     * 'bet-sent': When the bet was sent and a copy of the bet info
     *
     * 'bet-end': When receiving the result of the bet
     *
     * We send a copy of the bet info because the graph requires to have a history of the bets by its own,
     * so there is no need to the engine to have another one,
     * and the graph can't get the state directly from the engine because it could change between the lapse 'bet-end' is triggered and
     * the graph getting the state from the engine. The same to the 'claim-faucet' and 'new-balance' events.
     */
    GameEngine.prototype.bet = function(cond) {
        var self = this;

        console.assert(self.balance >= self.wager && self.wager > 0);
        console.assert(self.gameState != 'BETTING');

        self.gameState = 'BETTING';

        /** Save the current state of the engine, do not send it by reference to other modules
            This object will be modified and saved in the graph history */
        self.currentBet = {
            wager: self.getWager(),
            winChances: self.winChances,
            cond: cond,
            balance: self.balance,
            hash: self.nextGameHash,
            seed: self.clientSeed,
            accessToken: self.accessToken,
            payout: Math.round(self.getPayout() * self.getWager())
        };

        /**
         * DustDice bet API
         *
         * You can't win the jackpot and win the bet and the same time
         */
        WebApi.bet(
            self.currentBet.wager,
            self.currentBet.winChances,
            self.currentBet.hash,
            self.currentBet.seed,
            self.currentBet.cond,
            self.currentBet.accessToken,
            self.currentBet.payout,
            self.errorHandler(function(game){

                //Test the hash of the game & the outcome of the game
                var hash = SHA256.hash(game.secret + '|' + game.salt);
                var vaultOutcome = (game.secret + self.currentBet.seed) % Math.pow(2,32);
                var outcome = Math.floor(vaultOutcome / (Math.pow(2,32) / 101) );
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
                game.winChances = self.currentBet.winChances;
                game.cond = self.currentBet.cond;


                self.gameHistory.push(game);

                self.gameState = 'STANDING_BY';

                self.currentBet = null; //Clear the current Bet

                //Send a copy of the game result values, do not edit this object in components!
                //Object.seal(game);//Avoid some component do weird things on the object
                self.trigger('bet-end', game);
            })); //\WebApi.bet

        //Send a copy of the current values of the bet, do not edit this object in components!
        var betSent = {
            wager: self.wager,
            balance: self.balance,
            winChances: self.winChances,
            cond: cond
        };
        //Object.seal(betSent); //Avoid some component do weird things on the object
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

    GameEngine.prototype.setwinChances = function(newwinChances) {
        //console.assert(Clib.isInteger(newwinChances) && newwinChances>=2 && newwinChances <= 99);
        console.assert(Clib.isInteger(newwinChances));
        this.winChances = newwinChances;
        localStorage.winChances = this.winChances;
        this.trigger('new-win-chances');
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

    GameEngine.prototype.increasewinChances = function() {
        if(this.winChances<= 98)
            this.setwinChances(this.winChances + 1);
    };

    GameEngine.prototype.decreasewinChances = function() {
        if(this.winChances>=2)
            this.setwinChances(this.winChances - 1);
    };

    /**
     * Refresh the balance and the bankroll
     * Triggers:
     * 'refreshing-data': On start
     * 'new-balance':  amount
     * if it gets a new balance || 'refresh-data': If not a new balance
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
                    winChances: self.winChances
                });
            }

            self.trigger('refresh-data');
        }));
    };

    /**
     * Claims the faucet
     * triggers 'new-balance': if it gets a new balance
     */
    GameEngine.prototype.claimFaucet = function(response, callback) {
        var self = this;

        WebApi.claimFaucet(this.accessToken, response, function(err, data) {
            if (err)
                return callback(err);

            self.balance += data.amount;

            self.trigger('new-balance', {
                balance: self.balance,
                wager: self.wager,
                winChances: self.winChances
            });

            callback(null, data);
        });
    };

    /** Helper functions **/

    //The wager the engines does when betting
    GameEngine.prototype.getWager = function() {
        return Clib.floorHundreds(this.wager);
    };

    GameEngine.prototype.getPotentialProfit = function() {
        return this.getWager() * (this.getPayout()-1);
    };

    GameEngine.prototype.getPayout = function() {
        var t = .99 / (this.winChances / 101);
        return Math.ceil(t * 100) / 100;
    };

    GameEngine.prototype.isBetTooHigh = function() {
        return this.getPotentialProfit() > this.maxWin;
    };

    GameEngine.prototype.isBetValid = function() {
        return this.getWager() > this.balance;
    };



    return new GameEngine();
});


