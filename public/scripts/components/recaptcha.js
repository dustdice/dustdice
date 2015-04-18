define([
    'lib/react'
],function(
    React
){
    var D = React.DOM;

    return React.createClass({
        displayName: 'Recaptcha',

        propTypes: {
           // _toggleDepositAddress: React.PropTypes.func.isRequired
        },

        componentDidMount: function() {
            if (!grecaptcha || !grecaptcha.render)
                return;

            console.log('Rendering recaptcha');

            grecaptcha.render("faucet-recaptcha", {
                sitekey: '6LcdiAUTAAAAAMCcV578i5mzx5AlTzz1I5K4gDlY'
            });
        },

        shouldComponentUpdate: function() { return false },  // prevent it changing since its unmanaged


        render: function() {

            return D.form({ action: '#', method:'POST' },

                D.div({ id: "faucet-recaptcha"}, ''),
                D.br(),
                D.input({ type: 'submit', value: 'Submit Recap' })
            )

        }
    });
});