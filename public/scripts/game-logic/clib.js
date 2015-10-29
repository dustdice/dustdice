define([], function () {

    var audio = null;

    return {

        /** General stuff **/

        isInteger: function (nVal) {
            return typeof nVal === "number" && isFinite(nVal) && nVal > -9007199254740992 && nVal < 9007199254740992 && Math.floor(nVal) === nVal;
        },

        isNumber: function (nVal) {
            return typeof nVal === "number" && isFinite(nVal) && nVal > -9007199254740992 && nVal < 9007199254740992;
        },

        /** Satoshis/Bits handlers **/

        satToBit: function (satoshis) {
            return satoshis / 100;
        },

        satToBitFloored: function (satoshis) {
            return Math.floor(this.satToBit(satoshis));
        },

        bitToSat: function (bits) {
            return bits * 100;
        },

        floorHundreds: function (number) {
            return Math.floor(number / 100) * 100;
        },

        //Validate the input text or number of bits
        //Should be integer, bigger than 0 and bigger than the balance
        validateBitsInput: function(bet, balance) {
            var validity = 'valid', message = '';
            bet = Number(bet);
            if(!this.isInteger(bet)) {
                validity = 'wrong';
                'Should be an integer';
            } else if(bet < 1) {
                validity = 'wrong';
                message = 'Should be bigger than zero';
            } else if(bet > this.satToBit(balance)) {
                validity = 'warning';
                message = 'Not enough balance :o';
            }
            return [validity, message];
        },

        formatSatoshis: function (n, decimals) {
            return this.formatDecimals(Math.floor(n) / 100, decimals);
        },

        formatDecimals: function (n, decimals) {
            if (typeof decimals === 'undefined') {
                if (n % 1 === 0)
                    decimals = 0;
                else
                    decimals = 2;
            }
            return n.toFixed(decimals).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
        },

        bitsTextTerm: function (bits) {
            return (bits < 1.005 && bits >= 0.995) ? 'bit' : 'bits';
        },

        browserSupport: function () {
            if (typeof Storage === 'undefined')
                return false;

            return !!XMLHttpRequest;
        },

        log: function () {
            for (var i = 0, length = arguments.length; i < length; i++) {
                arguments[i] = JSON.parse(JSON.stringify(arguments[i]));
            }
            console.log.apply(console, arguments);
        },

        randomUint32: function () {
            if (window && window.crypto && window.crypto.getRandomValues && Uint32Array) {
                var o = new Uint32Array(1);
                window.crypto.getRandomValues(o);
                return o[0];
            } else {
                console.warn('Falling back to pseudo-random client seed');
                return Math.floor(Math.random() * Math.pow(2, 32));
            }
        },

        //Execute an array of functions and return an array with they results in the same order
        parallel: function(funcs, complete) {
            var completed = 0;
            var length = funcs.length;
            var results = new Array(length);
            var bail = false;

            funcs.forEach(function(func, i) {
              func(function (err, result) {
                if (bail) return;

                if (err) {
                  bail = true;
                  return complete(err);
                }

                results[i] = result;
                ++completed;

                console.assert(completed <= length, 'One of the parallel functions called the callback multiple times');

                if (completed === length)
                  return complete(null, results);
              })
            });
        },

        getHashParams: function () {

            var hashParams = {};
            var e,
                a = /\+/g,  // Regex for replacing addition symbol with a space
                r = /([^&;=]+)=?([^&;]*)/g,
                d = function (s) {
                    return decodeURIComponent(s.replace(a, " "));
                },
                q = window.location.hash.substring(1);

            while (e = r.exec(q))
                hashParams[d(e[1])] = d(e[2]);

            return hashParams;
        },

        localOrDef: function(name, def) {
            if(localStorage[name])
                return JSON.parse(localStorage[name]);
            else
                return def;
        },

        newMentionRegExp: function(username) {
            return new RegExp('@' + username + '(?:$|[^a-z0-9_\-])', 'ig');
        },

        beep: function() { //Load when is required to avoid unnecessary load
            if(!audio) {
                audio = new Audio('/sounds/alert.wav');
                audio.play();
            } else {
                audio.play();
            }
        }

    }

});
