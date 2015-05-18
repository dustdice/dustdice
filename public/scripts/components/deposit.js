define([
    'lib/react',
    'react-bootstrap',
    'game-logic/engine',
    'components/faucet'
], function(
    React,
    ReactBootstrap,
    Engine,
    FaucetClass
){
    var D = React.DOM;
    var Faucet = React.createFactory(FaucetClass);


    return React.createClass({
        displayName: 'Deposit Address',

        propTypes: {
            _toggleDepositAddress: React.PropTypes.func.isRequired,
            settings: React.PropTypes.object
        },

        getInitialState: function() {
            return {
                tab: this.props.settings.initialTab? this.props.settings.initialTab : 'ADDRESS'
            }
        },

        _handleBackDropClick: function(e) {
            if(e.target === e.currentTarget)
                this.props._toggleDepositAddress();
        },

        _selectTab: function(tab) {
            var self = this;
            return function() {
                self.setState({ tab: tab });
            }
        },

        render: function() {
            var body;

            switch(this.state.tab) {
                case 'ADDRESS':
                    body = D.div({ className: 'modal-body' },
                        D.img({ src: 'https://blockchain.info/qr?data='+Engine.depositAddress+'&size=200'}),
                        D.br(),
                        D.br(),
                        D.p(null, "All amounts sent to this bitcoin address will automatically be credited into your DustDice account after a single bitcoin confirmation."),
                        D.b({ className: 'bitcoin-address' }, Engine.depositAddress)
                    );
                    break;
                case 'MONEYPOT':
                    body = D.div({ className: 'modal-body' },
                        D.p(null, "You can deposit and withdraw funds from and to you MoneyPot account:"),
                        D.a({ href: 'https://www.moneypot.com/apps/1-dust-dice', target: '_blank' }, 'https://www.moneypot.com/apps/1-dust-dice')
                    );
                    break;
                case 'FAUCET':
                    body = D.div({ className: 'modal-body' },
                        Faucet()
                    );
                    break;
              default:
                throw new Error('Unrecognized tab state: '+ this.state.tab);
            }

            return D.div({ id: 'deposit-address-container', className: 'modal fade in', style: { display: 'block' }, onClick: this._handleBackDropClick },

                D.div({ className: 'modal-dialog' },

                    D.div({ className: 'modal-content' },

                        D.div({ className: 'modal-header' },
                            D.button({ type: 'button', className: 'close', onClick: this.props._toggleDepositAddress },
                                D.span({ 'aria-hidden': 'true' },
                                    String.fromCharCode(215)
                                )
                            ),
                            D.h4({ className: 'modal-title' },
                                'Add funds'
                            )
                        ),

                        D.div({ className: 'modal-nav' },
                            D.ul({ className: 'nav nav-tabs nav-justified' },
                                D.li({
                                    role: 'presentation',
                                    className: this.state.tab === 'ADDRESS' ? 'active' : '',
                                    onClick: this._selectTab('ADDRESS')
                                }, D.a({ href: '#' }, 'Address')),
                                D.li({
                                    role: 'presentation',
                                    className: this.state.tab === 'MONEYPOT' ? 'active' : '',
                                    onClick: this._selectTab('MONEYPOT')
                                }, D.a({ href: '#' }, 'MoneyPot')),
                                D.li({
                                    role: 'presentation',
                                    className: this.state.tab === 'FAUCET' ? 'active' : '',
                                    onClick: this._selectTab('FAUCET')
                                }, D.a( { href: '#' }, 'Faucet'))
                            )
                        ),

                        body

                    )
                )
            )
        }
    });
});