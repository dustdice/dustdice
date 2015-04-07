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

        render: function() {

            return D.div({ id: 'deposit-address-container', className: 'modal fade in', style: { display: 'block' } },

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

                        D.div({ className: 'modal-body' },
                            D.span(null, "Deposit to this address to directly send BTC's to this vault's APP"),
                            D.br(),
                            D.br(),
                            D.b(null, 'Address: '), Engine.depositAddress
                        )
                    )
                )
            )
        }
    });
});