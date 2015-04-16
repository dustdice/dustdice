define([
    'lib/react',
    'react-bootstrap',
    'game-logic/engine'
],function(
    React,
    ReactBootstrap,
    Engine
){
    var D = React.DOM;

    return React.createClass({
        displayName: 'Deposit Address',

        propTypes: {
            _toggleDepositAddress: React.PropTypes.func.isRequired
        },

        getInitialState: function() {
            return {
                tab: 'ADDRESS'
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
                        D.p(null, "Deposit to this MoneyPot address to directly send bits to DustDice Game, your bits are still inside MoneyPot"),
                        D.b(null, Engine.depositAddress)
                    );
                    break;
                case 'MONEYPOT':
                    body = D.div({ className: 'modal-body' },
                        D.p(null, "This link will get you to DustDice App in MoneyPot, you can deposit and withdraw there"),
                        D.a({ href: 'https://www.moneypot.com/apps/1-dust-dice'}, 'https://www.moneypot.com/apps/1-dust-dice')
                    );
                    break;
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
                                'Deposit Address'
                            )
                        ),

                        D.div({ className: 'modal-nav' },
                            D.ul({ className: 'nav nav-tabs nav-justified' },
                                D.li({ role: 'presentation', className: (this.state.tab === 'ADDRESS')? 'active' : '', onClick: this._selectTab('ADDRESS') }, D.a({ href: '#' }, 'Address')),
                                D.li({ role: 'presentation', className: (this.state.tab === 'MONEYPOT')? 'active' : '', onClick: this._selectTab('MONEYPOT')  }, D.a({ href: '#' }, 'MoneyPot'))
                            )
                        ),

                        body

                    )
                )
            )
        }
    });
});