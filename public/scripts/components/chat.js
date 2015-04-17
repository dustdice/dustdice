define([
    'lib/react',
    'game-logic/chat',
    'components/chat-message'

], function(
    React,
    ChatAPI,
    ChatMessageClass

) {
    /* Constants */
    var SCROLL_OFFSET = 120; //Pixels needed to do auto scroll

    var D = React.DOM;

    var ChatMessage = React.createFactory(ChatMessageClass);

    return React.createClass({
        displayName: 'Chat',

        getInitialState: function() {
            this.chatAPI = new ChatAPI();
            return {
                ChatAPI: ChatAPI
            };
        },

        //If this component is mounted the game should be connected
        componentDidMount: function() {
            this.chatAPI.on('all', this._onChange);
        },

        componentWillUnmount: function() {
            this.chatAPI.off('all', this._onChange);
            this.chatAPI.disconnect();
        },

        //Safe render
        shouldComponentUpdate: function() {
            return this.isMounted();
        },

        _onChange: function() {
            //Just to trigger a re render
            this.setState({ ChatAPI: ChatAPI });
        },

        _sendMessage: function(e) {
            if(e.keyCode == 13) {
                var msg = e.target.value;
                if(msg.length > 1 && msg.length < 500) {
                    this.chatAPI.sendMsg(msg);
                    e.target.value = '';
                }
            }
        },

        /** If the length of the chat changed and the scroll position is near bottom scroll to the bottom **/
        componentDidUpdate: function(prevProps, prevState) {

            //if(prevState.engine.chat.length != this.listLength){
                //this.listLength = this.state.engine.chat.length;

            if(this.chatAPI && (this.chatAPI.conStatus === 'JOINED')) {
                var msgsBox = React.findDOMNode(this.refs.chat);
                var scrollBottom = msgsBox.scrollHeight-msgsBox.offsetHeight-msgsBox.scrollTop;

                if(scrollBottom < SCROLL_OFFSET)
                    msgsBox.scrollTop = msgsBox.scrollHeight;
            }

            //}
        },

        render: function() {

            if(this.chatAPI && (this.chatAPI.conStatus !== 'JOINED')) {
                return D.div({ id: 'chat-loading-container' },
                    D.img({ src: 'img/loading.gif' })
                );
            } else {
                var chatMessages = this.chatAPI.chatHistory.map(function(message, index) {
                    return ChatMessage({ message: message, key: index });
                });

                return D.div({ id: 'chat-inner-container' },
                    D.div({ id: 'chat-title' },
                        D.h1(null, 'Chat')
                    ),
                    D.div({ id: 'chat-content', ref: 'chat' },
                        chatMessages
                    ),
                    D.div({ id: 'chat-input-container' },
                        D.input({ id: 'chat-input', type: 'text', onKeyDown: this._sendMessage })
                    )
                );
            }

        }
    });
});