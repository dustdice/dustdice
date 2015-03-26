define([
    'lib/react'
],function(
    React
){
    var D = React.DOM;

    return React.createClass({
        displayName: 'Game Settings',

        propTypes: {
            _toggleTutorial: React.PropTypes.func.isRequired
        },

        render: function() {

            return D.div({ className: 'modal fade in', style: { display: 'block' } },

                D.div({ className: 'modal-dialog' },

                    D.div({ className: 'modal-content' },

                        D.div({ className: 'modal-header' },
                            D.button({ type: 'button', className: 'close', onClick: this.props._toggleTutorial },
                                D.span({ 'aria-hidden': 'true' },
                                    String.fromCharCode(215)
                                )
                            ),
                            D.h4({ className: 'modal-title' },
                                'How to play'
                            )
                        ),

                        D.div({ className: 'modal-body' },
                            D.span(null, 'Use your keyboard arrows to bet and increase or decrease the bet.'),
                            D.br(),
                            D.br(),
                            D.b(null, 'Left Arrow: '), 'Bet on the low range.',
                            D.br(),
                            D.b(null, 'Right Arrow: '), 'Bet on the right range.',
                            D.br(),
                            D.b(null, 'Up Arrow: '), 'Multiply your bet by the qty on the button.',
                            D.br(),
                            D.b(null, 'Down Arrow: '), 'Divide your bet by the qty on the button.'
                        )
                    )
                )
            )
        }
    });
});