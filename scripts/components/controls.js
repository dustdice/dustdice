define([
    'lib/react',
    'game-logic/engine',
    'lib/keymaster'
],function(
    React,
    Engine,
    KeyMaster
){
    var D = React.DOM;

    function getState() {
        return Engine.getWagerValues();
    }

    return React.createClass({
        displayName: 'Controls',

        getInitialState: function() {
            return getState();
        },

        onChange: function() {
            if(this.isMounted())
                this.setState(getState());
        },

        componentDidMount: function() {
            Engine.addChangeListener(this.onChange);

            KeyMaster.key('up', this.doubleBet);
            KeyMaster.key('down', this.halfBet);
            KeyMaster.key('right', this.betHi);
            KeyMaster.key('left', this.betLo);
            KeyMaster.key('q', this.halfPayout);
            KeyMaster.key('r', this.doublePayout);
        },

        componentWillUnmount: function() {
            Engine.removeChangeListener(this.onChange);

            //TODO: check unbind
            KeyMaster.unbind('up', this.doubleBet);
            KeyMaster.unbind('down', this.halfBet);
            KeyMaster.unbind('right', this.betHi);
            KeyMaster.unbind('left', this.betLo);
        },

        wagerChange: function(e) {
            var wagerValue = parseInt(e.target.value);
            Engine.setWager(wagerValue);
        },

        payoutChange: function(e) {
            var payoutValue = parseFloat(e.target.value);
            Engine.setWager(payoutValue);
        },

        betHi: function() {
            Engine.bet(true)
        },

        betLo: function() {
            Engine.bet(false)
        },

        doubleBet: function() {
            Engine.setWager(this.state.wager * 2);
        },

        halfBet: function() {
            Engine.setWager(this.state.wager / 2);
        },

        increasePayout: function() {
            Engine.setPayout(this.state.payout + 0.1);
        },

        decreasePayout: function() {
            Engine.setPayout(this.state.payout - 0.1);
        },

        doublePayout: function() {
            Engine.setPayout(this.state.payout * 2);
        },

        halfPayout: function() {
            Engine.setPayout(this.state.payout / 2);
        },

        render: function() {
            return D.div({ className: 'controls-container row' },

                D.div({ className: 'col-lg-6'},
                    D.div({ className: 'input-group' },
                        D.span({ className: 'input-group-btn' },
                            D.button({ className: 'btn btn-default', onClick: this.decreasePayout }, '-')
                        ),
                        D.input({ type: 'text', className: 'form-control', id: 'payout', value: this.state.payout.toFixed(2), onChange: this.payoutChange }),
                        D.span({ className: 'input-group-btn' },
                            D.button({ className: 'btn btn-default', onClick: this.increasePayout }, '+')
                        )
                    )
                ),

                D.div({ className: 'col-lg-6'},
                    D.div({ className: 'input-group' },
                        D.span({ className: 'input-group-btn' },
                            D.button({ className: 'btn btn-default', onClick: this.betHi }, 'Bet Hi')
                        ),
                        D.input({ className: 'form-control', type: 'text', placeholder: 'Bits', value: this.state.wager, onChange: this.wagerChange }),
                        D.span({ className: 'input-group-btn' },
                            D.button({ className: 'btn btn-default', onClick: this.betLo }, 'Bet Lo')
                        )
                    )
                )
            );
        }
    });
});