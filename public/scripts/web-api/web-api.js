define([
        'game-logic/clib'
    ], function(
        Clib
    ) {

    //For development, always set to false
    var DELAY = 0;
    if(PRODUCTION)
        console.assert(DELAY == 0);

    var URL = PRODUCTION ? 'https://api.moneypot.com' : 'http://localhost:3000';

    var WebApi = function() {};

    WebApi.prototype.requestInitialData = function(accessToken, callback) {
        var self = this;

        Clib.parallel([
            function(callback) {
                self.requestAccountData(accessToken, callback);
            },
            function(callback) {
                self.requestNextGameHash(accessToken, callback);
            },
            function(callback) {
                self.getVaultBankroll(accessToken, callback);
            },
            function(callback) {
                self.getDepositAddress(accessToken, callback);
            }

        ], function(err, result) {
            if (err)
                return callback(err);

            var data = {
                balance: result[0].balance,
                username: result[0].uname,
                expiresIn: result[0]['expires_in'],
                bettedCount: result[0]['betted_count'],
                bettedProfit: result[0]['betted_profit'],
                bettedWager: result[0]['betted_wager'],
                hash: result[1],
                bankroll: result[2],
                depositAddress: result[3]
            };

            callback(null, data);
        });
    };

    WebApi.prototype.refreshData = function(accessToken, callback) {
        var self = this;

        Clib.parallel([
            function(callback) {
                self.requestAccountData(accessToken, callback);
            },
            function(callback) {
                self.getVaultBankroll(accessToken, callback);
            }

        ], function(err, result) {
            if (err)
                return callback(err);

            var data = {
                balance: result[0].balance,
                bettedCount: result[0]['betted_count'],
                bettedProfit: result[0]['betted_profit'],
                bettedWager: result[0]['betted_wager'],
                bankroll: result[1]
            };

            callback(null, data);
        });
    };

    WebApi.prototype.requestAccountData = function(accessToken, callback) {

        new Requester({
            method: 'GET',
            url: URL+'/v1/tokens/'+accessToken+'?access_token='+accessToken,
            callback: responseErrorHandler(callback)
        });
    };

    WebApi.prototype.requestNextGameHash = function(accessToken, callback) {

        new Requester({
            method: 'POST',
            url: URL+'/v1/bet-hashes?access_token='+accessToken,
            callback: responseErrorHandler(callback)
        });
    };

    WebApi.prototype.getVaultBankroll = function(accessToken, callback) {

        new Requester({
            method: 'GET',
            url: URL+'/v1/bankroll?access_token='+accessToken,
            callback: responseErrorHandler(callback)
        });
    };

    WebApi.prototype.bet = function(wager, winChances, hash, seed, cond, accessToken, payout, callback) {

        var number = (cond === '>')? (100-winChances) : winChances;

        var body = JSON.stringify({
            hash: hash,
            wager: wager,
            client_seed: seed,
            cond: cond,
            target: number,
            payout: payout
        });

        new Requester({
            method: 'POST',
            url: URL+'/v1/bets/101-dice?access_token='+accessToken,
            body: body,
            callback: responseErrorHandler(callback)
        });
    };

    WebApi.prototype.claimFaucet = function(accessToken, response, callback) {
        var body = JSON.stringify({ response: response });

        new Requester({
            method: 'POST',
            url: URL+'/v1/claim-faucet?access_token=' + accessToken,
            body: body,
            callback: responseErrorHandler(callback)
        });
    };

    WebApi.prototype.getDepositAddress = function(accessToken, callback) {
        new Requester({
           method: 'GET',
            url: URL+'/v1/deposit-address?access_token='+accessToken,
            callback: responseErrorHandler(callback)
        });
    };

    //Create errors and append the response body to them to catch them later
    function responseErrorHandler(callback) {

        return function(err, response) {

            //Fatal Error in the request
            if(err)
                return callback(err);

            //Known Error with a response from the server
            if (response.statusCode >= 400 && response.statusCode < 600)
                return callback(new Error(response.body));

            //Success
            callback(null, response.body);
        }

    }


    /** Requester middleware **/

    var Requester = function(options) {
        var self = this;

        self.options = options;
        self.xhr = new XMLHttpRequest();
        self.xhr.onreadystatechange = handleStateChange;
        self.xhr.open(options.method, options.url);
        self.xhr.setRequestHeader("Content-Type", "text/plain");
        self.xhr.send(options.body);

         function handleStateChange() {
            if (self.xhr.readyState === 4) { //If the operation is complete

                var status = self.xhr.status; //200 OK, 400, ...
                var response = {};
                response.statusCode = self.xhr.status;

                if(self.xhr.response){
                    try {
                        response.body = JSON.parse(self.xhr.response)
                    }catch(e) {
                        console.error('[XHR ERROR]: ', self.xhr);
                        return self.options.callback(new Error('Wrong response from the server'));
                    }
                } else {
                    console.error('[XHR ERROR]: ', self.xhr);
                    return self.options.callback(new Error('No response from the server'));
                }

                if(status === 0) {
                    console.error('[XHR ERROR]: ', self.xhr);
                    return self.options.callback(new Error('Problem reaching the server'));
                }

                if(DELAY)
                    setTimeout(function() {
                        self.options.callback(null, response);
                    }, DELAY);
                else
                    self.options.callback(null, response);
            }
        }
    };




    return new WebApi();
});