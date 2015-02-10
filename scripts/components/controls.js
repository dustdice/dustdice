define([
    'lib/react',
    'lib/Clib'
],function(
    React,
    Clib
){
    var D = React.DOM;

    return React.createClass({
        displayName: 'Controls',

        propTypes: {
            smallWindow: React.PropTypes.bool.isRequired,
            betHi: React.PropTypes.func.isRequired,
            betLo: React.PropTypes.func.isRequired,
            doubleBet: React.PropTypes.func.isRequired,
            halfBet: React.PropTypes.func.isRequired,
            increaseWinProb: React.PropTypes.func.isRequired,
            decreaseWinProb: React.PropTypes.func.isRequired,
            gameState: React.PropTypes.object.isRequired
        },


        render: function() {

            var btnDisable = (this.props.gameState.gameState === 'BETTING');

            return D.div({ className: (this.props.smallWindow)? 'col-xs-12' : 'col-xs-6' },

                D.div({ className: 'row' },
                    D.div({ className: 'col-xs-6' },
                        D.div({ className: 'betinfo' },
                            D.div({ className: 'lbl' }, 'BET'),
                            D.div({ className: 'txt'},
                                D.span(null, this.props.gameState.wager),
                                D.i({ className: 'fa fa-btc'}),
                                'its'
                            )
                        )
                    ),
                    D.div({ className: 'col-xs-6 text-right' },
                        D.div({ className: 'bet-info pull-right'},
                            D.div({ className: 'lbl'}, 'PAYOUT'),
                            D.div({ className: 'txt'},
                                D.span(null, (98/this.props.gameState.winProb).toFixed(2)),
                                D.i({ className: 'fa fa-times'})
                            )
                        )
                    )
                ),

                D.div({ className: 'row'},
                    D.button({ type: 'button', className: 'btn btn-default btn-controls col-xs-2 col-xs-offset-5', onClick: this.props.doubleBet },
                        D.span({ className: 'val' }, 'x2'),
                        D.span({ className: 'mark'},
                            D.i({ className: 'fa fa-arrow-up' })
                        )
                    )
                ),

                D.div({ className: 'row'},
                    D.button({ type: 'button', className: 'btn btn-default btn-controls col-xs-2 col-xs-offset-2', disabled: btnDisable, onClick: this.props.betLo },
                        D.span({ className: 'val' }, 'Lo'),
                        D.span({ className: 'mark'},
                            D.i({ className: 'fa fa-arrow-left' })
                        ),
                        //D.br(),
                        D.span({ className: 'dif' },
                            '1 to ' + this.props.gameState.winProb
                        )
                    ),
                    D.button({ type: 'button', className: 'btn btn-default btn-controls col-xs-2 col-xs-offset-1', onClick: this.props.halfBet },
                        D.span({ className: 'val' }, '/2'),
                        D.span({ className: 'mark'},
                            D.i({ className: 'fa fa-arrow-down' })
                        )
                    ),
                    D.button({ type: 'button', className: 'btn btn-default btn-controls col-xs-2 col-xs-offset-1', disabled: btnDisable, onClick: this.props.betHi },
                        D.span({ className: 'val' }, 'Hi'),
                        D.span({ className: 'mark'},
                            D.i({ className: 'fa fa-arrow-right' })
                        ),
                        //D.br(),
                        D.span({ className: 'dif' },
                            (this.props.gameState.winProb+2) + ' to 100'
                        )
                    )
                ),

                D.div({ className: 'row v-space-top-1' },
                    D.div({ className: 'col-xs-6' },
                        D.div({ className: 'bet-info' },
                            D.div({ className: 'lbl' }, 'WINING PROB'),
                            D.div({ className: 'txt'},
                                D.span(null, this.props.gameState.winProb),
                                D.i({ className: 'icon-percent'})
                            )
                        )
                    ),
                    D.div({ className: 'col-xs-6 text-right' },
                        D.div({ className: 'bet-info pull-right'},
                            D.div({ className: 'lbl'}, 'JACKPOT WIN PROB'),
                            //D.div({ className: 'txt'},
                                D.span(null, '1 in a ' +  Math.round(Clib.jackWinProbBitsPerX(this.props.gameState.wager)))
                            //)
                        )
                    )
                )
            );
        }
    });
});