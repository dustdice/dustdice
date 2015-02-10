define(function() {

    var webApi = function() {};

    webApi.prototype.bet = function(wager, winProb, houseEdge, hiLo, callback) {

        //A number in the range of [0, 100)
        var randomNumber = Math.random()*100;

        //Integer in the range of [1, 100]
        var rInt = Math.floor(randomNumber) + 1;

        //Gives the result based on a probability of winning
        var won = (hiLo)? (rInt >= (100-winProb) && rInt <= 100): (rInt >= 1 && rInt <= winProb);

        var payout = (100-houseEdge)/winProb;

        var amount = (won)? wager*payout : wager;

        setTimeout(function() {
            callback(null, {
                wager: wager,
                winProb: winProb,
                houseEdge: houseEdge,
                hiLo: hiLo,
                win: won,
                amount: amount,
                result: rInt
            });
        }, 5 + Math.random()*1000);

    };

    return new webApi();
});