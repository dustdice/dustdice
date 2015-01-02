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
        return Engine.getBetValues();
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

        increaseMultiplier: function() {
            Engine.setMultiplier(this.state.multiplier + 0.1);
        },

        decreaseMultiplier: function() {
            Engine.setMultiplier(this.state.multiplier - 0.1);
        },

        render: function() {
            return D.div({ className: 'controls-container row' },

                D.div({ className: 'col-lg-6'},
                    D.div({ className: 'input-group' },
                        D.span({ className: 'input-group-btn' },
                            D.button({ className: 'btn btn-default', onClick: this.decreaseMultiplier }, '-')
                        ),
                        D.input({ type: 'text', className: 'form-control', id: 'multiplier', value: this.state.multiplier.toFixed(2), readOnly: true }),
                        D.span({ className: 'input-group-btn' },
                            D.button({ className: 'btn btn-default', onClick: this.increaseMultiplier }, '+')
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