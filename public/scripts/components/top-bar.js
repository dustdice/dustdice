define([
    'game-logic/engine',
    'screenfull',
    'lib/clib',
    'lib/react',
    'react-bootstrap'
], function(
    Engine,
    ScreenFull,
    Clib,
    React,
    ReactBootstrap
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
            _toggleTutorial: React.PropTypes.func.isRequired
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

        render: function() {

            return D.div({ id: 'top-bar-box' },
                D.div({ id: 'top-bar-balance', onClick: this._refreshBalance },
                    D.div({ className: 'top-bar-state'},
                        D.div({ className: 'ctl-state-amount' },
                            D.span(null, Clib.formatSatoshis(Engine.balance))
                        ),
                        D.span({ className: 'ctl-state-lbl' },
                            D.i({ className: 'fa fa-btc' }), (Engine.balance === 100)? 'it': 'its'
                        ),
                        D.span({ className: 'ctl-state-button' },
                            D.i({ className: 'fa fa-refresh' + (Engine.gameState === 'REFRESHING'? ' spin': '') })
                        )
                    ),
                    D.div({ className: 'top-bar-state-name' },
                        D.span(null, 'BALANCE')
                    )
                ),

                D.div({ id: 'top-bar-logo' },
                    D.img({ src: 'img/powder2.png' }),
                    D.h1(null, 'Dust Dice')
                ),
                D.button({ id: 'expand-button', type: 'button', className: 'btn btn-default top-bar-menu-btn', onClick: this._toggleFullScreen },
                    (this.state.screenFull)? D.i({ className: 'fa fa-compress' }) : D.i({ className: 'fa fa-expand' })
                ),
                DropdownButton({ className: 'top-bar-menu-btn', bsStyle: 'default', pullRight: true, title: D.i({ className: 'fa fa-bars' }) },
                    MenuItem({ href: '/faq.html' }, "FAQ's"),
                    MenuItem({ href: 'http://vault.moneypot.com/' }, "Account"),
                    MenuItem({ onSelect: this.props._toggleTutorial }, "Tutorial")
                )
            );
        }
    });
});