define([
    'game-logic/engine',
    'screenfull',
    'game-logic/clib',
    'lib/react',
    'react-bootstrap',
    'stores/game'
], function(
    Engine,
    ScreenFull,
    Clib,
    React,
    ReactBootstrap,
    GameStore
){
    var D = React.DOM;
    var DropdownButton = React.createFactory(ReactBootstrap.DropdownButton);
    var MenuItem = React.createFactory(ReactBootstrap.MenuItem);

    function getState() {
        return { engine: Engine }
    }

    return React.createClass({
        displayName: 'TopBar',

        propTypes: {
            toggleTutorial: React.PropTypes.func.isRequired,
            toggleSettings: React.PropTypes.func.isRequired,
            toggleDepositAddress: React.PropTypes.func.isRequired,
            toggleChat: React.PropTypes.func.isRequired,
            toggleFaucet: React.PropTypes.func.isRequired,
            toggleStats: React.PropTypes.func.isRequired
        },

        getInitialState: function() {
            var state = getState();
            state.screenFull = false;
            return getState();
        },

        componentDidMount: function() {
            Engine.on('all', this._onChange);

            if (ScreenFull.enabled)
                document.addEventListener(ScreenFull.raw.fullscreenchange, this._screenChange);
        },

        componentWillUnmount: function() {
            Engine.off('all', this._onChange);

            if (ScreenFull.enabled)
                document.removeEventListener(ScreenFull.raw.fullscreenchange, this._screenChange);
        },

        _screenChange: function() {
            if(ScreenFull.isFullscreen !== this.state.screenFull)
                this.setState({ screenFull: ScreenFull.isFullscreen })
        },

        _onChange: function() {
            if(this.isMounted())
                this.setState(getState());
        },

        _toggleFullScreen: function() {
            ScreenFull.toggle();
        },

        _refreshBalance: function() {
            Engine.refreshBalance();
        },

        _toggleChat: function() {
            GameStore.toggleShowChatFocus();
        },

        _logOut: function() {
            Engine.logOut();
        },

        _handleBackDropClick: function(e) {
            if(e.target === e.currentTarget)
                this.props.toggleTutorial();
        },

        render: function() {

            return D.div({ id: 'top-bar-box' },
                D.div({ id: 'top-bar-balance', onClick: this._refreshBalance },
                    D.button({
                        id: 'allbets-button',
                        type: 'button',
                        className: 'btn btn-default top-bar-menu-btn hidden-xs',
                        onClick: function(){
                            if(tabs==0){
                                tabs = 1;
                                document.getElementById('allbets-button').innerHTML = "Go back to Game";
                                document.getElementById('graph-box').style.display = "none";
                                document.getElementById('controls-container-buttons').style.display = "none";
                                document.getElementById('allbets-box').style.display = "block";
                            }else{
                                tabs = 0;
                                document.getElementById('allbets-button').innerHTML = "See All bets";
                                document.getElementById('graph-box').style.display = "block";
                                document.getElementById('controls-container-buttons').style.display = "block";
                                document.getElementById('allbets-box').style.display = "none";
                            }
                        }
                    }, (tabs==0?'All bets':'Back to Game')),
                    D.button({
                        id: ''
                    })
                    D.button({
                        id: 'deposit-button',
                        type: 'button',
                        className: 'btn btn-default top-bar-menu-btn hidden-xs',
                        onClick: function(){
                            var windowUrl = 'https://www.moneypot.com/dialog/deposit?app_id=1';
                            var windowName = 'manage-auth';
                            var windowOpts = 'width=420,height=350,left=100,top=100';
                            var windowRef = window.open(windowUrl, windowName, windowOpts);
                            windowRef.focus();
                        }
                    }, 'Deposit'),
                    D.button({
                        id: 'withdraw-button',
                        type: 'button',
                        className: 'btn btn-default top-bar-menu-btn hidden-xs',
                        onClick: function(){
                            var windowUrl = 'https://www.moneypot.com/dialog/withdraw?app_id=1';
                            var windowName = 'manage-auth';
                            var windowOpts = 'width=420,height=350,left=100,top=100';
                            var windowRef = window.open(windowUrl, windowName, windowOpts);
                            windowRef.focus();
                        }
                    }, 'Withdraw'),
                    D.div({ className: 'top-bar-state'},
                        D.div({ className: 'ctl-state-amount' },
                            D.span(null, Clib.formatSatoshis(Engine.balance, 2))
                        ),
                        D.span({ className: 'ctl-state-lbl' },
                            (Engine.balance === 100)? '\u00a0bit': '\u00a0bits'
                        )/*,
                        D.span({ className: 'ctl-state-button' },
                            D.i({ className: 'fa fa-refresh' + (Engine.gameState === 'REFRESHING'? ' spin': '') })
                        )*/
                    )/*,
                    D.div({ className: 'top-bar-state-name' },
                        D.span(null, 'BALANCE')
                    )*/
                ),

                D.div({ id: 'top-bar-logo' },
                    D.img({ src: 'img/new-logo.png' }),
                    D.h1(null, '\u00a0DustDice')
                ),

                //D.button({
                //        id: 'chat-button',
                //        type: 'button',
                //        className: 'btn btn-default top-bar-menu-btn hidden-xs',
                //        onClick: this.props.toggleChat
                //    },
                //    D.i({ className: 'fa fa-comment' })
                //),
                D.button({
                        id: 'faucet-button',
                        type: 'button',
                        className: 'btn btn-default top-bar-menu-btn hidden-xs',
                        onClick: this.props.toggleFaucet
                    },
                    D.i({ className: 'fa fa-eyedropper' })
                ),
                D.button({ id: 'expand-button', type: 'button', className: 'btn btn-default top-bar-menu-btn', onClick: this._toggleFullScreen },
                    (this.state.screenFull)? D.i({ className: 'fa fa-compress' }) : D.i({ className: 'fa fa-expand' })
                ),
                DropdownButton({ className: 'top-bar-menu-btn', bsStyle: 'default', pullRight: true, title: D.i({ className: 'fa fa-bars' }) },
                    /*MenuItem({ onClick: function(){ // this.props.toggleDepositAddress
                            var windowUrl = 'https://www.moneypot.com/dialog/deposit?app_id=1';
                            var windowName = 'manage-auth';
                            var windowOpts = 'width=420,height=350,left=100,top=100';
                            var windowRef = window.open(windowUrl, windowName, windowOpts);
                            windowRef.focus();
                        } 
                    }, 'Deposit'),
                    MenuItem({ onClick: function(){
                            var windowUrl = 'https://www.moneypot.com/dialog/withdraw?app_id=1';
                            var windowName = 'manage-auth';
                            var windowOpts = 'width=420,height=350,left=100,top=100';
                            var windowRef = window.open(windowUrl, windowName, windowOpts);
                            windowRef.focus();
                        } 
                    }, 'Withdraw'),
                    MenuItem({ onSelect: this.props.toggleSettings }, 'Settings'),
                    MenuItem({ onSelect: this.props.toggleChat, onClick: function(e) {
                        e.stopPropagation(); //Avoid focus going to GAME after opening CHAT
                    } }, (GameStore.showChat? 'Hide' : 'Show') + ' Chat'),*/
                    //MenuItem({ onSelect: this.props.toggleStats }, 'Stats'),
                    MenuItem({ href: '/faq' }, "FAQ ", D.span({ className: 'glyphicon glyphicon-new-window' })),
                    MenuItem({ href: 'https://www.moneypot.com' }, 'Account ', D.span({ className: 'glyphicon glyphicon-new-window' })),
                    MenuItem({ onSelect: this.props.toggleTutorial }, 'Tutorial'),
                    MenuItem({ onSelect: this._logOut }, 'Log out ', D.span({ className: 'glyphicon glyphicon-new-window' }))
                )
            );
        }
    });
});
