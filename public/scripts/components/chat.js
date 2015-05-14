define([
    'lib/react',
    'game-logic/chat',
    'components/chat-message',
    'components/user-connected',
    'lib/lodash'

], function(
    React,
    ChatAPI,
    ChatMessageClass,
    UserConnectedClass,
    _
) {
    /* Constants */
    var SCROLL_OFFSET = 120; //Pixels needed to do auto scroll

    var D = React.DOM;
    var ChatMessage = React.createFactory(ChatMessageClass);
    var UserConnected = React.createFactory(UserConnectedClass);

    return React.createClass({
        displayName: 'Chat',

        propTypes: {
            offFocus: React.PropTypes.bool.isRequired,
            toggleShowChat: React.PropTypes.func.isRequired
        },

        getInitialState: function() {
            this.firstScrollDown = false;
            return {
                ChatAPI: ChatAPI,
                showUsers: false
            };
        },

        //If this component is mounted the game should be connected
        componentDidMount: function() {
            ChatAPI.on('all', this._onChange);
            this._scrollChat();
        },

        componentWillUnmount: function() {
            ChatAPI.off('all', this._onChange);
        },

        //Safe render
        shouldComponentUpdate: function() {
            return this.isMounted();
        },

        /** If the length of the chat changed and the scroll position is near bottom scroll to the bottom **/
        componentDidUpdate: function(prevProps, prevState) {
            this._scrollChat();
        },

        _onChange: function() {
            //Just to trigger a re render
            this.setState({ ChatAPI: ChatAPI });
        },

        _sendMessage: function(e) {
            if(e.keyCode == 13) {
                var msg = e.target.value;
                if(msg.length > 1 && msg.length < 500) {
                    ChatAPI.sendMsg(msg);
                    e.target.value = '';
                }
            }
        },

        _handleChatClick: function() {
            if(this.props.offFocus)
                React.findDOMNode(this.refs.input).focus();
        },

        _toggleUsers: function() {
            this.setState({ showUsers: !this.state.showUsers });
        },

        _scrollChat: function() {
            //if(prevState.engine.chat.length != this.listLength){
            //this.listLength = this.state.engine.chat.length;

            if(ChatAPI && (ChatAPI.conStatus === 'JOINED') && !this.state.showUsers) {

                var msgsBox = React.findDOMNode(this.refs.chat);

                if(!this.firstScrollDown) {
                    msgsBox.scrollTop = msgsBox.scrollHeight;
                    this.firstScrollDown = true;
                } else {
                    var scrollBottom = msgsBox.scrollHeight-msgsBox.offsetHeight-msgsBox.scrollTop;

                    if(scrollBottom < SCROLL_OFFSET)
                        msgsBox.scrollTop = msgsBox.scrollHeight;
                }
            } else {
                this.firstScrollDown = false;
            }

            //}
        },

        render: function() {
            //Not connected
            if(ChatAPI && (ChatAPI.conStatus !== 'JOINED'))
                return D.div({id: 'chat-loading-container'},
                    D.img({src: 'img/loading.gif'})
                );

            //Show users && connected
            if(this.state.showUsers) {
                var usersConnected = _.map(ChatAPI.room.users, function(user, uname) {
                    return UserConnected({ user: user, key: uname });
                });

                return D.div({ id: 'chat-inner-container' },
                    D.div({ id: 'chat-header' },
                        D.h1(null, 'Users'),
                        D.button({ type: 'button', className: 'close pull right', onClick: this._toggleUsers },
                            D.span({ className: 'glyphicon glyphicon-remove' })
                        )
                    ),
                    D.div({ id: 'chat-content', ref: 'chat' },
                        usersConnected
                    )
                );

            }

            //Message list && Connected
            var chatMessages = ChatAPI.room.history.map(function(message, index) {
                return ChatMessage({ message: message, key: index });
            });

            return D.div({ id: 'chat-inner-container', onClick: this._handleChatClick },
                D.div({ id: 'chat-header' },
                    D.h1(null, 'Chat'),
                    D.button({ type: 'button', className: 'close pull right', onClick: this.props.toggleShowChat },
                        D.span({ className: 'glyphicon glyphicon-remove' })
                    ),
                    D.a({ id: 'chat-users-count', onClick: this._toggleUsers, href: '#' },
                        'Users online:\u00a0', Object.keys(ChatAPI.room.users).length
                    )
                ),
                D.div({ id: 'chat-content', ref: 'chat' },
                    chatMessages
                ),
                D.div({ id: 'chat-input-container' },
                    D.input({ id: 'chat-input', type: 'text', ref: 'input', onKeyDown: this._sendMessage })
                )
            );

        }
    });
});