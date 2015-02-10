//State holder of the history of the game
//And calls to the web api to handle bets
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

    var gameEngine = function() {
        _.extend(this, Events);
        var self = this;

        self.gameHistory = []; // { wager: satoshis, payout: 2.03, win: boolean }
        self.gameState = 'STANDING_BY'; //STANDING_BY || BETTING

        self.winProb = 49;
        self.wager = 100;


        /* Constants */
        self.HOUSE_EDGE = 2;

        /* Temporal Constants */
        self.balance = 100000e2;
        self.maxBet  = 10000e8;
        self.jackpot = 10e8; //1BTC = 1,000,000bits = 100,000,000Satoshis
    };


    /** Engine API **/

    gameEngine.prototype.bet = function(hiLo) {
        var self = this;

        console.assert(Clib.isInteger(self.wager));
        console.assert(Clib.isInteger(self.winProb));
        console.assert(typeof hiLo === 'boolean');

        if(self.gameState === 'BETTING') {
            console.warn('Already betting');
            return;
        }


        self.gameState = 'BETTING';

        var bet = {
            wager: self.wager,
            winProb: self.winProb,
            hiLo: hiLo,
            balance: self.balance
        };

        self.trigger('bet-sent', bet);

        //TODO: Assuming that the responses are received in the same order they are sent
        WebApi.bet(self.wager, self.winProb, self.HOUSE_EDGE, hiLo, function(err, game){
            if(err) {
                alert('Error doing the bet: ' + err.message);
                return console.error( new Error('Error on WebApi: ' + err) );
            }

            if(game.win)
                self.balance += game.amount - game.wager;
            else
                self.balance -= game.amount;

            game.balance = self.balance;

            self.gameHistory.push(game);

            //if(self.gameHistory.length > historyMaxLength)
            //    self.gameHistory.shift();

            self.gameState = 'STANDING_BY';

            self.trigger('bet-end', game);
        });
    };


    /** Event registration for view controllers **/

    gameEngine.prototype.addChangeListener = function(func) {
        this.on('all', func);
    };

    gameEngine.prototype.removeChangeListener = function(func) {
        this.off('all', func);
    };

    gameEngine.prototype.addBetListener = function(func) {
        this.on('bet-sent', func)
    };

    gameEngine.prototype.removeBetListener = function(func) {
        this.off('bet-sent', func)
    };

    gameEngine.prototype.addBetEndListener = function(func) {
        this.on('bet-end', func);
    };

    gameEngine.prototype.removeBetEndListener = function(func) {
        this.off('bet-end', func);
    };

    gameEngine.prototype.addWagerListener = function(func) {
        this.on('new-wager-data', func);
    };

    gameEngine.prototype.removeWagerListener = function(func) {
        this.off('new-wager-data', func);
    };


    /** State getters for view controllers **/

    gameEngine.prototype.getGameState = function() {
        return {
            wager: this.wager,
            winProb: this.winProb,
            balance: this.balance,
            maxBet: this.maxBet,
            jackpot: this.jackpot,
            gameState: this.gameState
        }
    };


    /** Setters for controls view controller **/

    gameEngine.prototype.setWager = function(newWager) {
        console.assert(Clib.isInteger(newWager));
        this.wager = newWager;
        this.triggerBetValues();

    };

    gameEngine.prototype.setWinProb = function(newWinProb) {
        console.assert(Clib.isInteger(newWinProb) && newWinProb>=1 && newWinProb <=98);
        this.winProb = newWinProb;
        this.triggerBetValues();
    };

    gameEngine.prototype.triggerBetValues = function() {
        this.trigger('new-wager-data', {
            wager: this.wager,
            winProb: this.winProb,
            balance: this.balance
        });
    };


    return new gameEngine();
});