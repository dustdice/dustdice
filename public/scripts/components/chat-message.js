define([
    'lib/react',
    'stores/game',
    'game-logic/clib',
    'game-logic/engine',
    'lib/autolinker'
], function(
    React,
    GameStore,
    Clib,
    Engine,
    Autolinker
){
    var D = React.DOM;

    // Overrides Autolinker.js' @username handler to instead open the stats modal
    var replaceUsernameMentions = function(autolinker, match) {
        // Use default handler for non-twitter links
        if (match.getType() !== 'twitter') return true;

        var username = match.getTwitterHandle();
        var textedUsername = "'"+match.getTwitterHandle()+"'";

        return '<a href="#" onclick="chatMessageOpenUserStats('+textedUsername+')" >@' + username + '</a>';
    };

    var escapeHTML = (function() {
        var entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;'
        };

        return function(str) {
            return String(str).replace(/[&<>"']/g, function (s) {
                return entityMap[s];
            });
        };
    })();

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

            var username = Engine.username;

            var r = new RegExp('@' + username + '(?:$|[^a-z0-9_\-])', 'i');
            var mentioned = '';
            if (username && this.props.message.user && (this.props.message.user.uname != username) && r.test(this.props.message.text))
                mentioned = ' mentioned';

            Autolinker.link(
                escapeHTML(this.props.message.text),
                { truncate: 50, replaceFn: replaceUsernameMentions }
            );

            var user = (this.props.message.user)? D.b({ className: 'chat-msg-uname ' + this.props.message.user.role, onClick: this._setUnsetModal({ name: 'STATS', username: this.props.message.user.uname }) },
                D.a({ href: '#' }, this.props.message.user.uname)
            ) : D.b({ className: 'chat-msg-sys' }, 'System');

            /*var role = (this.props.message.user && (this.props.message.user.role !== 'member'))?
                D.span({ className: 'chat-msg-role ' + this.props.message.user.role }, this.props.message.user.role) : null;*/
            return D.div({ className: 'chat-msg' + mentioned},
                D.span(null,
                    //role,
                    user,
                    D.b(null, ':\u00a0'),
                    D.span({ className: 'chat-msg-text', dangerouslySetInnerHTML: {
                        __html: Autolinker.link(
                            escapeHTML(this.props.message.text),
                            { truncate: 50, replaceFn: replaceUsernameMentions }
                        )
                    } })
                )
            );
        }
    });

});
