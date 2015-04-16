define([
    'lib/react'
], function(
    React
){
    var D = React.DOM;

    return React.createClass({
        displayName: 'ChatMessage',

        propTypes: {
            message: React.PropTypes.object.isRequired
        },

        render: function() {
            return D.div(null,
                D.span(null,
                    D.b(null, this.props.message.user+':\u00a0'),
                    this.props.message.text
                )
            );
        }
    });
});