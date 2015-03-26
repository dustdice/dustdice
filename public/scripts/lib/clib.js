define([
], function(
) {
    return {
        isInteger: function (nVal) {
            return typeof nVal === "number" && isFinite(nVal) && nVal > -9007199254740992 && nVal < 9007199254740992 && Math.floor(nVal) === nVal;
        },

        isNumber: function (nVal) {
            return typeof nVal === "number" && isFinite(nVal) && nVal > -9007199254740992 && nVal < 9007199254740992;
        },

        satToBit: function(satoshis) {
            return satoshis/100;
        },

        satToBitRounded: function(satoshis) {
            return Math.round(this.satToBit(satoshis));
        },

        bitToSat: function(bits) {
            return bits*100;
        },

        /**
         * Probability ratio(1 = 100%) of winning a jackpot of 10BTC
         * using 1% of your bet for the jackpot
         * with no house edge:
         **/
        jackWinProbSatoshisRatio: function(wager, jackpot) {
            return (wager/100)/jackpot;
        },

        formatSatoshis: function (n, decimals) {
            return this.formatDecimals(n/100, decimals);
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

        bitsTextTerm: function(bits) {
            return (bits >= 2)? 'its' : 'it';
        },

        roundTo100: function(number) {
            return Math.round(number/100)*100;
        },

        roundSatToTwo: function(satoshis) {
            return this.roundTo100(satoshis);
        },

        browserSupport: function() {

            if(typeof Storage === 'undefined')
                return false;

            if(typeof XMLHttpRequest === 'undefined')
                return false;

            return true;

        }


    }
});