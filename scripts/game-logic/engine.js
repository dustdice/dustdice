//State holder of the history of the game
//And calls to the web api to handle bets
define([
    'lib/Events',
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
        self.gameProfit = 0; //The accumulated profit of this session
        self.gameState = 'STANDING_BY'; //STANDING_BY || BETTING

        self.payout = 2;
        self.wager = 100;
    };


    /** Engine API **/

    gameEngine.prototype.bet = function(hiLo) {
        var self = this;

        console.assert(Clib.isInteger(self.wager));
        console.assert(Clib.isNumber(self.payout));
        console.assert(typeof hiLo === 'boolean');

        self.gameState = 'BETTING';

        WebApi.bet(self.wager, self.payout, hiLo, function(err, game){
            if(err)
                console.error('Do something: ', err);

            if(game.win)
                self.gameProfit += (game.wager * game.payout) - game.wager;
            else
                self.gameProfit -= game.wager;

            self.gameHistory.push(game);

            //if(self.gameHistory.length > historyMaxLength)
            //    self.gameHistory.shift();

            self.gameState = 'STANDING_BY';

            self.trigger('bet', game, {
                wager: self.wager,
                payout: self.payout,
                gameProfit: self.gameProfit
            });
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
        this.on('bet', func)
    };

    gameEngine.prototype.removeBetListener = function(func) {
        this.off('bet', func)
    };

    gameEngine.prototype.addWagerListener = function(func) {
        this.on('new-wager-data', func);
    };

    gameEngine.prototype.removeWagerListener = function(func) {
        this.off('new-wager-data', func);
    };


    /** State getters for view controllers **/


    gameEngine.prototype.getWagerValues = function() {
        return {
            wager: this.wager,
            payout: this.payout,
            gameProfit: this.gameProfit
        }
    };


    /** Setters for controls view controller **/

    gameEngine.prototype.setWager = function(newWager) {
        this.wager = newWager;
        this.triggerBetValues();

    };

    gameEngine.prototype.setPayout = function(newPayout) {
        this.payout = newPayout;
        this.triggerBetValues();
    };

    gameEngine.prototype.triggerBetValues = function() {
        this.trigger('new-wager-data', {
            wager: this.wager,
            payout: this.payout,
            gameProfit: this.gameProfit
        });
    };


    return new gameEngine();
});