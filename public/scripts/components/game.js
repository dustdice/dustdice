define([
    'lib/react',
    'lib/mousetrap', //TODO: This is window,
    'game-logic/clib',
    'game-logic/engine',
    'components/top-bar',
    'components/graph',
    'components/controls',
    'components/settings',
    'components/tutorial',
    'components/deposit',
    'components/stats',
    'components/chat',
    'components/vertical-menu',
    'stores/game',
    'class-names'
], function(
    React,
    MouseTrap,
    Clib,
    Engine,
    TopBarClass,
    GraphClass,
    ControlsClass,
    SettingsClass,
    TutorialClass,
    DepositClass,
    StatsClass,
    ChatClass,
    VerticalMenuClass,
    GameStore,
    CX
){
    var D = React.DOM;
    var TopBar = React.createFactory(TopBarClass);
    var Graph = React.createFactory(GraphClass);
    var Controls = React.createFactory(ControlsClass);
    var Chat = React.createFactory(ChatClass);
    var VerticalMenu = React.createFactory(VerticalMenuClass);

    var Settings = React.createFactory(SettingsClass);
    var Tutorial = React.createFactory(TutorialClass);
    var Deposit = React.createFactory(DepositClass);
    var Stats = React.createFactory(StatsClass);

    return React.createClass({

        displayName: 'Game',

        //Global UI States
        getInitialState: function() {
            this.showChat = GameStore.showChat; //Helper to know if the chat state change to let the graph know it has to re-render
            return null;
        },

        //Follow only specific events to avoid re-rendering every child component if not needed
        componentDidMount: function() {
            MouseTrap.bind('s', this._toggleSettings);
            Engine.on('get-user-data', this._onChange); //Connected
            Engine.on('fatal-error', this._onChange);
            Engine.on('user-alert', this._userAlert);
            GameStore.on('show-chat-change', this._onChange);
            GameStore.on('modal-change', this._onChange);
            GameStore.on('focus-change', this._onChange);
        },

        componentWillUnmount: function() {
            MouseTrap.unbind('s', this._toggleSettings);
            Engine.off('get-user-data', this._onChange);
            Engine.off('fatal-error', this._onChange);
            Engine.off('user-alert', this._userAlert);
            GameStore.off('show-chat-change', this._onChange);
            GameStore.off('modal-change', this._onChange);
            GameStore.off('focus-change', this._onChange);
        },

        _onChange: function() {
            //Let know react that this component should re-render because something change in the state
            this.setState({ engine: Engine });
        },

        //If the chat state change we got to redraw the graph by triggering the resize event
        componentDidUpdate: function(prevProps, prevState) {
            if(this.showChat !== GameStore.showChat) {
                this.showChat = GameStore.showChat;
                window.dispatchEvent(new Event('resize'));
            }
        },

        _userAlert: function(error) {
            alert(error);
        },

        _toggleSettings: function() {
            GameStore.setUnsetModalFocus({ name: 'SETTINGS' });
        },

        _toggleTutorial: function() {
            GameStore.setUnsetModalFocus({ name: 'TUTORIAL' });
        },

        _toggleDepositAddress: function() {
            GameStore.setUnsetModalFocus({ name: 'DEPOSIT', initialTab: 'ADDRESS' });
        },

        _toggleFaucet: function() {
            GameStore.setUnsetModalFocus({ name: 'DEPOSIT', initialTab: 'FAUCET' });
        },

        _toggleStats: function() {
            GameStore.setUnsetModalFocus({ name: 'STATS' });
        },

        _toggleShowChat: function(e) {
            GameStore.toggleShowChatFocus();
            if(e)
                e.stopPropagation();
        },

        _handleChatClick: function() {
            if(GameStore.focus !== 'CHAT')
                GameStore.setFocus('CHAT');
        },

        _handleGameClick: function() {
            if(GameStore.focus !== 'GAME') {
                GameStore.setFocus('GAME');
                React.findDOMNode(this.refs.gameContainer).focus(); //TODO: Is this necessary?
            }
        },

        render: function() {

            var verticalMenu = !GameStore.showChat?
                VerticalMenu() : null;

            //The engine went to a fatal error state
            if(Engine.error)
                return D.div({ id: 'fatal-error-container'},
                    D.img({ src: '/img/cloud-error.svg' }),
                    D.br(),
                    D.span(null, (typeof Engine.error == 'string')? Engine.error : 'There was a fatal error'),
                    D.br(),
                    D.a({ href: PRODUCTION? 'https://dustdice.com' : 'http://localhost:3001' }, 'Go to DustDice.com')
                );

            //Waiting for the user data (loading)
            if(Engine.gameState === 'OFFLINE')
                return D.div({ id: 'loading-container'},
                    D.img({ src: '/img/loading.gif' })
                );

            var modal;
            switch (GameStore.modal.name) {
                case 'TUTORIAL':
                    modal = Tutorial({
                        _toggleTutorial: this._toggleTutorial
                    });
                    break;
                case 'SETTINGS':
                    modal = Settings({
                        _toggleSettings: this._toggleSettings
                    });
                    break;
                case 'DEPOSIT':
                    modal = Deposit({
                       _toggleDepositAddress: this._toggleDepositAddress,
                        settings: GameStore.modal
                    });
                    break;
                case 'STATS':
                    modal = Stats({
                        toggleStats: this._toggleStats,
                        settings: GameStore.modal
                    });
                    break;
            }

            var chatContainerClasses = CX(
                GameStore.showChat? 'expand' : 'compress',
                {
                    'off-focus': GameStore.focus !== 'CHAT'
                }
            );
            var chat = D.div({ id: 'chat-container-box', className: chatContainerClasses, onClick: this._handleChatClick },
                GameStore.showChat? Chat({
                    offFocus: GameStore.focus !== 'CHAT',
                    toggleShowChat: this._toggleShowChat
                }) : null
            );

            var gameContainerClasses = CX(
                GameStore.showChat? 'compress' : 'expand',
                {
                    'off-focus': GameStore.focus !== 'GAME'
                }
            );
            var game = D.div({
                    id: 'game-container-box',
                    ref: 'gameContainer',
                    className: gameContainerClasses,
                    onClick: this._handleGameClick,
                    tabIndex: 0
                },

                D.div({ id: 'top-bar-container' },
                    TopBar({
                        toggleTutorial: this._toggleTutorial,
                        toggleSettings: this._toggleSettings,
                        toggleDepositAddress: this._toggleDepositAddress,
                        toggleChat: this._toggleShowChat,
                        toggleFaucet: this._toggleFaucet,
                        toggleStats: this._toggleStats
                    })
                ),

                D.div({ id: 'graph-container' },
                    Graph()
                ),

                D.div({ id: 'controls-container' },
                    Controls({
                        _toggleSettings: this._toggleSettings,
                        _toggleTutorial: this._toggleTutorial,
                        _toggleDepositAddress: this._toggleDepositAddress,
                        disableControls: !!GameStore.modal.name || (GameStore.focus !== 'GAME')
                    })
                ),

                modal
            );

            return D.div(null,
                game,
                verticalMenu,
                chat
            )
        }
    });
});