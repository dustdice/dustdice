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

            KeyMaster.key('up', this.betHi);
            KeyMaster.key('down', this.betLo);
            KeyMaster.key('right', this.increaseMultiplier);
            KeyMaster.key('left', this.decreaseMultiplier);
        },

        componentWillUnmount: function() {
            Engine.removeChangeListener(this.onChange);

            //TODO: check unbind
            KeyMaster.unbind('up', this.betHi);
            KeyMaster.unbind('down', this.betLo);
            KeyMaster.unbind('right', this.increaseMultiplier);
            KeyMaster.unbind('left', this.decreaseMultiplier);
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

        increaseMultiplier: function() {
            Engine.setMultiplier(this.state.multiplier * 2);
        },

        decreaseMultiplier: function() {
            Engine.setMultiplier(this.state.multiplier / 2);
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