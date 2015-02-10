define([
    'lib/react'
], function(
    React
) {

    var D = React.DOM;

    return React.createClass({
       displayName: 'Settings',

        propTypes: {
            smallWindow: React.PropTypes.bool.isRequired,
            wagerInputText: React.PropTypes.string.isRequired,
            invalidWager: React.PropTypes.bool.isRequired,
            setWagerText: React.PropTypes.func.isRequired,
            setWinProb: React.PropTypes.func.isRequired,
            gameState: React.PropTypes.object.isRequired
        },

        render: function(){
            return D.div({ className: (this.props.smallWindow)? 'col-xs-12' : 'col-xs-6' },

                D.div({ className: 'row v-space-btm-2 v-space-top-1' },
                    D.div({ className: 'col-xs-6 col-xs-offset-1'},
                        D.div(null,
                            D.span(null, 'BET')
                        ),
                        D.div({ className: 'input-group' + ((this.props.invalidWager)? ' has-error' : '') },
                            //D.span({ className: 'input-group-btn'},
                            //    D.button({ className: 'btn btn-default'}, '/2')
                            //),
                            D.input({ type: 'text', className: 'form-control', value: this.props.wagerInputText, onChange: this.props.setWagerText })
                            //D.span({ className: 'input-group-btn'},
                            //    D.button({ className: 'btn btn-default'}, 'x2')
                            //)
                        )
                    )
                ),

                D.div({ className: 'row' },
                    D.div({ className: 'col-xs-10 col-xs-offset-1' },
                        D.div(null,
                            D.span(null, 'Wining probability: ' + this.props.gameState.winProb + '%' ),
                            D.span({ className: 'pull-right' }, 'Payout: ' + (98/this.props.gameState.winProb).toFixed(2) + 'x')
                        ),
                        D.div({ className: 'win-chance-slider' },
                            D.input({ type: 'range', max: '97', min: '1', value: this.props.gameState.winProb, onChange: this.props.setWinProb })
                        ),
                        D.div(null,
                            ''
                        )
                    )
                ),

                D.div({ className: 'set-h-divider'})
            )
        }
    });

});