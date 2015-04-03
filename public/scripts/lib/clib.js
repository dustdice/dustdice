define([], function () {
    return {
        isInteger: function (nVal) {
            return typeof nVal === "number" && isFinite(nVal) && nVal > -9007199254740992 && nVal < 9007199254740992 && Math.floor(nVal) === nVal;
        },

        isNumber: function (nVal) {
            return typeof nVal === "number" && isFinite(nVal) && nVal > -9007199254740992 && nVal < 9007199254740992;
        },

        satToBit: function (satoshis) {
            return satoshis / 100;
        },

        satToBitRounded: function (satoshis) {
            return Math.round(this.satToBit(satoshis));
        },

        bitToSat: function (bits) {
            return bits * 100;
        },

        /**
         * Probability ratio(1 = 100%) of winning a jackpot of 10BTC
         * using 1% of your bet for the jackpot
         * with no house edge:
         **/
        jackWinProbSatoshisRatio: function (wager, jackpot) {
            wager = this.roundTo100(wager); // Must bet an a whole amount of satoshis
            return wager / 100 / (wager + jackpot);
        },

        formatSatoshis: function (n, decimals) {
            return this.formatDecimals(n / 100, decimals);
        },

        formatDecimals: function (n, decimals) {
            if (typeof decimals === 'undefined') {
                if (n % 100 === 0)
                    decimals = 0;
                else
                    decimals = 2;
            }
            return n.toFixed(decimals).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
        },

        bitsTextTerm: function (bits) {
            return (bits >= 2) ? 'its' : 'it';
        },

        roundTo100: function (number) {
            return Math.round(number / 100) * 100;
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

        max: function(qt1, qt2) {
            return (qt1>qt2)? qt1 : qt2;
        }

    }

});