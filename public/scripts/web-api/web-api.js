define(function() {

    var URL = PRODUCTION? 'https://vault.moneypot.com':'http://localhost:3000';


    var WebApi = function() {};

    WebApi.prototype.requestAccountData = function(accessToken, callback) {

        new Requester({
            method: 'GET',
            url: URL+'/v1/tokens/'+accessToken+'?access_token='+accessToken,
            callback: callback
        });
    };

    WebApi.prototype.requestNextGameHash = function(accessToken, callback) {

        new Requester({
            method: 'GET',
            url: URL+'/v1/bet/generate-hash'+'?access_token='+accessToken,
            callback: callback
        });
    };

    WebApi.prototype.bet = function(wager, winProb, hash, seed, hiLo, accessToken, callback) {

        var cond = hiLo ? '>' : '<';
        var number = hiLo? (100-winProb) : winProb+1;

        var body = {
            hash: hash,
            wager: wager,
            client_seed: seed,
            cond: cond,
            number: number
            //Jackpot is 1btc more than your bet by default on Vault API
        };

        body = JSON.stringify(body);

        new Requester({
            method: 'POST',
            url: URL+'/v1/bet/jackpot-dice'+'?access_token='+accessToken,
            body: body,
            callback: callback
        });

    };


    /** Requester middleware **/

    var Requester = function(options) {
        var self = this;

        self.options = options;
        self.xhr = new XMLHttpRequest();
        self.xhr.onreadystatechange = handleStateChange;
        self.xhr.open(options.method, options.url);
        self.xhr.setRequestHeader("Content-Type", "application/json");
        self.xhr.send(options.body);

         function handleStateChange() {
            if (self.xhr.readyState === 4) { //If the operation is complete

                var status = self.xhr.status; //200 OK, 400, ...
                var response = null;

                if(self.xhr.response){
                    try {
                        response = JSON.parse(self.xhr.response)
                    }catch(e) {
                        console.error('[XHR ERROR]: ', self.xhr);
                        return self.options.callback(new Error('Wrong response from the server'));
                    }
                } else {
                    console.error('[XHR ERROR]: ', self.xhr);
                    return self.options.callback(new Error('No response from the server'));
                }


                if (status === 0 || (status >= 400 && status < 600)) {
                    console.error('[XHR ERROR]: ', self.xhr);
                    return self.options.callback(new Error('Server side error'));
                }

                self.options.callback(null, response);
            }
        }
    };




    return new WebApi();
});