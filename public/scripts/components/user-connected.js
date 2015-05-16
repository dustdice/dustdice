define([
   'lib/react',
    'stores/game'
], function(
    React,
    GameStore
){
    var D = React.DOM;

    return React.createClass({
       displayName: 'UserConnected',

        propTypes: {
            user: React.PropTypes.object.isRequired
        },

        _setUnsetModal: function(modal) {
            return function(e) {
                GameStore.setUnsetModalFocus(modal);
                e.stopPropagation();
            }
        },

        render: function() {
            return D.div(null,
                D.span(null,
                    D.a({ onClick: this._setUnsetModal({ name: 'STATS', username: this.props.user.uname }), href: '#' }, D.i({ className: 'fa fa-bar-chart' })),
                    '\u00a0',
                    D.b(null, this.props.user.uname),
                    this.props.role
                )
            );
        }
    });

});