define([
    'lib/react',
    'game-logic/chat',
    'stores/game'
], function(
    React,
    ChatEngine,
    GameStore
) {
    var D = React.DOM;

    return React.createClass({
        displayName: 'VerticalMenu',

        getInitialState: function() {
            return {
                messageCounter: 0
            }
        },

        componentDidMount: function() {
            ChatEngine.on('message', this._newChatMessage);
        },

        componentWillUnmount: function() {
            ChatEngine.off('message', this._newChatMessage);
        },

        _newChatMessage: function() {
            this.setState({ messageCounter: ++this.state.messageCounter });
        },

        _toggleShowChat: function() {
            GameStore.toggleShowChatFocus();
        },

        render: function() {
            return D.div({ id: 'vertical-menu', onClick: this._toggleShowChat },
                this.state.messageCounter? D.span({ id: 'vertical-menu-msg-counter' }, this.state.messageCounter) : null,
                D.button({ className: '' },
                    D.span(null, 'chat')
                )
            );
        }
    });
});