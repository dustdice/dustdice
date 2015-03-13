define(function() {

    var webApi = function() {};



    webApi.prototype.bet = function(wager, winProb, hash, seed, hiLo, callback) {

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = handleStateChange;
        if (!xhr) throw new Error("Browser doesn't support xhr");
        xhr.open('POST', 'http://localhost:3000/api/jackpot-dice', true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); //Default

        var direction = hiLo ? 'gt' : 'lt';
        var number = hiLo? (101-winProb) : winProb;
        xhr.send(
            'hash'          +   '=' +   encodeURIComponent(hash)            +'&'+
            'wager'         +   '=' +   encodeURIComponent(wager)           +'&'+
            'client_seed'   +   '=' +   encodeURIComponent(seed)            +'&'+
            'direction'     +   '=' +   encodeURIComponent(direction)       +'&'+
            'number'        +   '=' +   encodeURIComponent(String(number))
            //Jackpot is 1btc more than your bet by default on Vault API
        );

         function handleStateChange() {
            if (xhr.readyState === 4) { //If the operation is complete

                var status = xhr.status; //200 OK, 400, ...
                var error = null;
                var response = null;

                if(xhr.response)
                    try {
                        response = JSON.parse(xhr.response)
                    }catch(e) {
                        console.warn('Responce is not JSON'); //TODO: What to do?
                    }

                if (status === 0 || (status >= 400 && status < 600)) {
                    error = new Error(response);
                    error.statusCode = status;
                }

                //Example
                //{
                //    "bet_id": 3,
                //    "outcome": 81,
                //    "profit": 104.16666666666666, //
                //    "secret": 3444463889,
                //    "salt": "1d5d88ea507d1313",
                //    "next_hash": "bbee57e609734eb018eb494e0ed67e218b6329d728b593ab490cba20deb916b1"
                //}
                callback(error, response);
            }
        }

    };

    return new webApi();
});


////A number in the range of [0, 100)
//var randomNumber = Math.random()*100;
//
////Integer in the range of [1, 100]
//var rInt = Math.floor(randomNumber) + 1;
//
////Gives the result based on a probability of winning
//var won = (hiLo)? (rInt >= (101-winProb) && rInt <= 100): (rInt >= 1 && rInt <= winProb);
//
//var payout = (100-houseEdge)/winProb;
//
//var profit = (won)? (wager*payout)-wager : -wager;
//
//setTimeout(function() {
//    callback(null, {
//        next_hash: '8947n584ty457y34583485u0234y58723452384523985',
//        outcome: rInt,
//        profit: profit
//    });
//}, 5);