define(function() {

    var webApi = function() {

    };

    webApi.prototype.bet = function(wager, payout, hiLo, callback) {
        var win = hiLo? (Math.random() < (1/payout)): (Math.random() < (1/payout));
        callback(null, {
            win: win,
            wager: wager,
            payout: payout
        });
    };

    return new webApi();

});