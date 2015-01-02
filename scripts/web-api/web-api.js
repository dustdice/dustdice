define(function() {

    var webApi = function() {

    };

    webApi.prototype.bet = function(wager, multiplier, hiLo, callback) {
        var win = hiLo? (Math.random() < (1/multiplier)): (Math.random() < (1/multiplier));
        callback(null, {
            win: win,
            wager: wager,
            multiplier: multiplier
        });
    };

    return new webApi();

});