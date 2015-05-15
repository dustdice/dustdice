define([
    'lib/react',
    'stores/game'
], function(
    React,
    GameStore
){
    var D = React.DOM;

    return React.createClass({
        displayName: 'ChatMessage',

        propTypes: {
            message: React.PropTypes.object.isRequired
        },

        _setUnsetModal: function(modal) {
            return function(e) {
                GameStore.setUnsetModalFocus(modal);
                e.stopPropagation();
            }
        },

        render: function() {
            var role = (this.props.message.user.role !== 'member')?
                D.span({ className: 'chat-msg-role ' + this.props.message.user.role }, this.props.message.user.role) : null;
            return D.div(null,
                D.span(null,
                    role,
                    D.b({ className: 'chat-msg-uname', onClick: this._setUnsetModal({ name: 'STATS', username: this.props.message.user.uname }) },
                        D.a({ href: '#' }, this.props.message.user.uname)
                    ),
                    D.b(null, ':\u00a0'),
                    this.props.message.text
                )
            );
        }
    });
});