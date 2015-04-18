define([
    'lib/react',
    'lib/keymaster', //TODO: This is window,
    'lib/clib',
    'game-logic/engine',
    'components/top-bar',
    'components/graph',
    'components/controls',
    'components/settings',
    'components/tutorial',
    'components/deposit',
    'components/chat',
    'stores/game-settings'
],
function(
    React,
    KeyMaster,
    Clib,
    Engine,
    TopBarClass,
    GraphClass,
    ControlsClass,
    SettingsClass,
    TutorialClass,
    DepositAddressClass,
    ChatClass,
    GameSettings
){
    var D = React.DOM;
    var TopBar = React.createFactory(TopBarClass);
    var Graph = React.createFactory(GraphClass);
    var Controls = React.createFactory(ControlsClass);
    var Chat = React.createFactory(ChatClass);

    var Settings = React.createFactory(SettingsClass);
    var Tutorial = React.createFactory(TutorialClass);
    var DepositAddress = React.createFactory(DepositAddressClass);

    return React.createClass({

        //Global UI States
        getInitialState: function() {
            this.showChat = GameSettings.showChat;
            return {
                modal: (GameSettings.hideTutorial)? '' : 'TUTORIAL',
                engine: Engine
            }
        },

        componentDidMount: function() {
            KeyMaster.key('s', this._toggleSettings);
            Engine.on('get-user-data', this._getUserData); //Connected
            Engine.on('fatal-error', this._onChange);
            Engine.on('user-alert', this._userAlert);
            GameSettings.on('show-chat-change', this._onChange);
        },

        componentWillUnmount: function() {
            KeyMaster.key.unbind('s', this._toggleSettings);
            Engine.off('get-user-data', this._getUserData);
            Engine.off('fatal-error', this._onChange);
            Engine.off('user-alert', this._userAlert);
            GameSettings.off('show-chat-change', this._onChange);
        },

        //If the chat state change we got to redraw the graph by triggering the resize event
        componentDidUpdate: function(prevProps, prevState) {
            if(this.showChat !== GameSettings.showChat) {
                this.showChat = GameSettings.showChat;
                window.dispatchEvent(new Event('resize'));
            }
        },

        _userAlert: function(error) {
            alert(error);
        },

        _getUserData: function() {
            this.setState({ engine: Engine }); //Just to re render
        },

        _toggleSettings: function() {
            this.setState({ modal: (this.state.modal === 'SETTINGS')? '' : 'SETTINGS' });
        },

        _toggleTutorial: function() {
            this.setState({ modal: (this.state.modal === 'TUTORIAL')? '' : 'TUTORIAL' });
        },

        _toggleDepositAddress: function() {
            this.setState({ modal: (this.state.modal === 'DEPOSIT')? '' : 'DEPOSIT' })
        },

        _toggleChat: function() {
            GameSettings.toggleShowChat();
        },

        _onChange: function() {
            this.setState({ engine: Engine });
        },

        render: function() {

            //If the engine does not have the user's data
            if(Engine.error)
                return D.div({ id: 'fatal-error-container'},
                    D.img({ src: '/img/cloud-error.svg' }),
                    D.br(),
                    D.span(null, (typeof Engine.error == 'string')? Engine.error : 'There was a fatal error'),
                    D.br(),
                    D.a({ href: PRODUCTION? 'https://dustdice.com' : 'http://localhost:3001' }, 'Go to DustDice.com')
                );

            if(Engine.gameState === 'OFFLINE')
                return D.div({ id: 'loading-container'},
                    D.img({ src: '/img/loading.gif' })
                );

            var modal;
            switch (this.state.modal) {
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
                    modal = DepositAddress({
                       _toggleDepositAddress: this._toggleDepositAddress
                    });
                    break;

            }

            return D.div(null,

                D.div({ id: 'chat-container-box', className: GameSettings.showChat? 'expand' : 'compress' },
                    GameSettings.showChat? Chat() : null
                ),

                D.div({ id: 'game-container-box', className: GameSettings.showChat? 'compress' : 'expand' },

                    D.div({ id: 'top-bar-container' },
                        TopBar({
                            _toggleTutorial: this._toggleTutorial,
                            _toggleSettings: this._toggleSettings,
                            _toggleDepositAddress: this._toggleDepositAddress,
                            _toggleChat: this._toggleChat
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
                            disableControls: this.state.modal || this.showChat
                        })
                    ),

                    modal
                )
            )
        }
    });
});