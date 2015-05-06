define([
    'lib/react'
],function(
    React
){
    var D = React.DOM;

    return React.createClass({
        displayName: 'Recaptcha',

        propTypes: {
            _recaptchaSubmit: React.PropTypes.func.isRequired
        },


        componentDidMount: function() {
            if (!grecaptcha || !grecaptcha.render) { // JS isn't loaded yet
                console.warn('recaptcha has not loaded');
                return;
            }

            grecaptcha.render("faucet-recaptcha", {
                sitekey: '6LcdiAUTAAAAAMCcV578i5mzx5AlTzz1I5K4gDlY',
                callback: this.props._recaptchaSubmit
            });
        },

        shouldComponentUpdate: function() { return false },  // prevent it changing since its unmanaged


        render: function() {
            return D.div({ id: "faucet-recaptcha" });
        }
    });
});