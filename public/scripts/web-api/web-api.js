define([
        'lib/clib'
    ], function(
        Clib
    ) {

    //For development, always set to null
    var DELAY = null;

    var URL = PRODUCTION? 'https://vault.moneypot.com':'http://localhost:3000';

    var WebApi = function() {};

    WebApi.prototype.requestInitialData = function(accessToken, callback) {
        var self = this;

        Clib.parallel([
            function(callback) {
                self.requestAccountData(accessToken, callback);
            },
            function(callback) {
                self.requestNextGameHash(accessToken, callback);
            }

        ], function(err, result) {
            if(err)
                callback(err);

            var data = {
                balance: result[0].balance,
                hash: result[1]
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
            method: 'GET',
            url: URL+'/v1/bet/generate-hash'+'?access_token='+accessToken,
            callback: responseErrorHandler(callback)
        });
    };

    WebApi.prototype.bet = function(wager, winProb, hash, seed, hiLo, accessToken, jackpot, callback) {

        var cond = hiLo ? '>' : '<';
        var number = hiLo? (100-winProb) : winProb+1;

        var body = {
            hash: hash,
            wager: wager,
            client_seed: seed,
            cond: cond,
            number: number,
            jackpot: jackpot
        };

        body = JSON.stringify(body);

        new Requester({
            method: 'POST',
            url: URL+'/v1/bet/jackpot-dice'+'?access_token='+accessToken,
            body: body,
            callback: responseErrorHandler(callback)
        });

    };

    //Create errors and append the response body to them to catch them later
    function responseErrorHandler(callback) {

        return function(err, response) {

            //Fatal Error in the request
            if(err)
                callback(err);

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