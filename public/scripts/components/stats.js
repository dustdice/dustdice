define([
    'lib/react',
    'game-logic/engine',
    'game-logic/clib'
],function(
    React,
    Engine,
    Clib
){
    var D = React.DOM;

    return React.createClass({
        displayName: 'Game Settings',

        propTypes: {
            _toggleStats: React.PropTypes.func.isRequired
        },

        _handleBackDropClick: function(e) {
            if(e.target === e.currentTarget)
                this.props._toggleStats();
        },

        render: function() {

            return D.div({ id: 'stats-container', className: 'modal fade in', style: { display: 'block' }, onClick: this._handleBackDropClick },

                D.div({ className: 'modal-dialog' },

                    D.div({ className: 'modal-content' },

                        D.div({ className: 'modal-header' },
                            D.button({ type: 'button', className: 'close', onClick: this.props._toggleStats },
                                D.span({ 'aria-hidden': 'true' },
                                    String.fromCharCode(215)
                                )
                            ),
                            D.h4({ className: 'modal-title' },
                                'Stats'
                            )
                        ),

                        D.div({ className: 'modal-body' },
                            D.p(null, D.b(null, 'Bet count: '), Engine.bettedCount),
                            D.p(null, D.b(null, 'Wagered Profit: '), Clib.satToBit(Engine.bettedProfit)),
                            D.p(null, D.b(null, 'Wagered Amount: '), Clib.satToBit(Engine.bettedWager))

                        )
                    )
                )
            )
        }
    });
});