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

        validateBitsBet: function(bet, maxBet) {
            bet = Number(bet);
            if(!this.isInteger(bet))
                return new Error('The bet should be an integer.');
            if(bet > maxBet)
                return new Error('Your bet is bigger than the max bet.');
            if(bet < 1)
                return new Error('Your bet should be bigger than  one.');
            return bet;
        },

        satToBit: function(satoshis) {
            return satoshis/100;
        },

        bitToSat: function(bits) {
            return bits*100;
        },

        /**
         * Probability of winning a jackpot of 10BTC
         * using 1% of your bet for the jackpot
         * with no house edge:
         *
         * WinProb: Probability a user has to win given a wager
         *
         * UserProb/WinProb = Payout
         *
         * WinAmount = Payout * Wager
         *
         * UserProb/WinProb = WinAmount/Wager
         *
         * WinProb = UserProb/WinAmount * Wager
         **/
        jackWinProbBits: function(wager) {
            return 1/1000000000*wager;
        },

        jackWinProbBitsPerX: function(wager) {
            return 1/this.jackWinProbBits(wager);
        }
    }
});