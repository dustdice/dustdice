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
    var historyMaxLength = 28;

    /** State of the controls view controller  **/
    var multiplier = 2;
    var wager = 100;

    var gameEngine = function() {
        _.extend(this, Events);
        var self = this;

        self.gameHistory = []; // { wager: satoshis, multiplier: 2.03, win: boolean }
        self.gameState = 'STANDING_BY'; //STANDING_BY || BETTING
    };


    /** Engine API **/

    gameEngine.prototype.bet = function(hiLo) {
        console.assert(Clib.isInteger(wager));
        console.assert(Clib.isNumber(multiplier));
        console.assert(typeof hiLo === 'boolean');

        var self = this;

        self.gameState = 'BETTING';

        WebApi.bet(wager, multiplier, hiLo, function(err, game){
            if(err)
                console.error('Do something: ', err);

            self.gameHistory.push(game);

            if(self.gameHistory.length > historyMaxLength)
                self.gameHistory.shift();

            self.gameState = 'STANDING_BY';
            self.trigger('bet');
        });
    };




    /** Event registration for view controllers **/

    gameEngine.prototype.addChangeListener = function(func) {
        this.on('all', func);
    };

    gameEngine.prototype.removeChangeListener = function(func) {
        this.off('all', func);
    };


    /** State getter for view controllers **/

    gameEngine.prototype.getHistory = function() {
        return _.clone(this.gameHistory, true);
    };

    gameEngine.prototype.getBetValues = function() {
        return {
            wager: wager,
            multiplier: multiplier
        }
    };


    /** Setters for controls view controller **/

    gameEngine.prototype.setWager = function(newWager) {
        wager = newWager;
        this.trigger('new-wager');
    };

    gameEngine.prototype.setMultiplier = function(newMultiplier) {
        multiplier = newMultiplier;
        this.trigger('new-multiplier');
    };

    return new gameEngine();
});