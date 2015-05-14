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
            var role = (this.props.message.user.role !== 'member')?
                D.span({ className: 'chat-msg-role ' + this.props.message.user.role }, this.props.message.user.role) : null;
            return D.div(null,
                D.span(null,
                    role,
                    D.b(null, this.props.message.user.uname+':\u00a0'),
                    this.props.message.text
                )
            );
        }
    });
});