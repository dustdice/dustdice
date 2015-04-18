define([
    'lib/react',
    'game-logic/engine',
    'components/recaptcha'
],function(
    React, Engine, RecaptchaClass
){
    var D = React.DOM;
    var Recaptcha = React.createFactory(RecaptchaClass);


    return React.createClass({
        displayName: 'Faucet',

        getInitialState: function() {
          return { stage: 'SHOW' }
        },

        _recaptchaSubmit: function(response) {

            console.log('Got response: ', response);

            var self = this;
            self.setState({ stage: 'CLAIMING' });

            Engine.claimFaucet(response, function(err, data) {
                console.log('Faucet claim: ', err, data);
                if (!self.isMounted()) return;

                if (err) {
                    self.setState({ stage: 'ERROR', err: err.message });
                    return;
                }

                self.setState({ stage: 'CLAIMED', amount: data.amount });
            });


        },

        render: function() {
            switch (this.state.stage) {
                case 'SHOW':
                    return Recaptcha({ _recaptchaSubmit: this._recaptchaSubmit });
                    break;
                case 'CLAIMING':
                    return D.p(null, 'Claiming amount from MoneyPot.com');
                case 'ERROR':
                    return D.p(null, 'MoneyPot returned ' + this.state.err);
                case 'CLAIMED':
                    return D.p(null, 'Claimed ' + this.state.amount/100 + ' bit faucet. You may claim in another 5 minutes');
                default:
                    throw new Error('Unknown stage: ', this.state.stage);
            }


            return D.div({ id: "faucet-recaptcha" });
        }
    });
});