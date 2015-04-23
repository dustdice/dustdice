define([
    'lib/react',
    'game-logic/engine',
    'lib/keymaster', //TODO: This is window
    'lib/clib',
    'stores/game-settings'
], function(
    React,
    Engine,
    KeyMaster,
    Clib,
    GameSettings
){
    /* Constants */
    //var _widthTrigger = 992;

    var D = React.DOM;
    var cx = React.addons.classSet;

    function getBetMultiplier() {
        if(GameSettings.useCustomBetMultiplier) {
            return GameSettings.customBetMultiplier;
        } else {
            //Chase mode
            var payout = Engine.getPayout();
            return (payout/(payout-1));
        }
    }

    function getState() {
        var state = {};
        state.notEnoughBalance = Engine.isBetValid();
        state.betTooHigh = Engine.isBetTooHigh();
        return state;
    }

    return React.createClass({
        displayName: 'ControlsContainer',

        propTypes: {
            _toggleSettings: React.PropTypes.func.isRequired,
            disableControls: React.PropTypes.bool.isRequired,
            _toggleDepositAddress: React.PropTypes.func.isRequired
        },

        getInitialState: function() {
            return getState();
        },

        componentDidMount: function() {
            Engine.on('all', this._onChange);
            GameSettings.on('all', this._onChange);
            KeyMaster.key('c', this._clearHistory);
            KeyMaster.key('q', this._decreasewinChances);
            KeyMaster.key('r', this._increasewinChances);
            KeyMaster.key('up', this._chaseBet);
            KeyMaster.key('down', this._divideBet);
            KeyMaster.key('right', this._betHi);
            KeyMaster.key('left', this._betLo);
        },

        componentWillUnmount: function() {
            Engine.off('all', this._onChange);
            GameSettings.off('all', this._onChange);
            KeyMaster.key.unbind('c', this._clearHistory);
            KeyMaster.key.unbind('q', this._decreasewinChances);
            KeyMaster.key.unbind('r', this._increasewinChances);
            KeyMaster.key.unbind('up', this._chaseBet);
            KeyMaster.key.unbind('down', this._divideBet);
            KeyMaster.key.unbind('right', this._betHi);
            KeyMaster.key.unbind('left', this._betLo);
        },

        _onChange: function() {
            if(this.isMounted())
                this.setState(getState());
        },

        _clearHistory: function() {
            if(!this.props.disableControls)
                Engine.clearHistory();
        },

        _increasewinChances: function() {
            if(!this.props.disableControls)
                Engine.increasewinChances();
        },

        _decreasewinChances: function() {
            if(!this.props.disableControls)
                Engine.decreasewinChances();
        },

        _betHi: function() {
            if(Engine.gameState != 'BETTING' && !this.state.notEnoughBalance && !this.state.betTooHigh && !this.props.disableControls)
                Engine.bet('>');
        },

        _betLo: function() {
            if(Engine.gameState != 'BETTING' && !this.state.notEnoughBalance && !this.state.betTooHigh && !this.props.disableControls)
                Engine.bet('<')
        },

        _chaseBet: function() {
            if(!this.props.disableControls)
                Engine.setWager(Engine.wager * getBetMultiplier());
        },

        _divideBet: function() {
            if(!this.props.disableControls) {
                var newWager = Engine.wager/getBetMultiplier();
                if(newWager < 100)
                    newWager = 100;

                Engine.setWager(newWager);
            }
        },

        render: function() {

            var isBetting = Engine.gameState === 'BETTING';

            var betHiBtn, betLoBtn, chaseBetBtn, divideBetBtn;

            var betHiBtnClasses = cx({
                'btn': true,
                'btn-default': true,
                'ctl-button': true,
                'cant-bet': (this.state.notEnoughBalance || this.state.betTooHigh),
                'betting': (isBetting && Engine.currentBet.hiLo === true),
                'transparent': !GameSettings.showButtons,
                'disabled': this.props.disableControls
            });
            betHiBtn = D.button(
                {
                    id: 'bet-hi-button',
                    className: betHiBtnClasses,
                    onClick: this.state.betTooHigh? this.props._toggleSettings : this.state.notEnoughBalance? this.props._toggleDepositAddress : this._betHi,
                    disabled: ((isBetting || this.props.disableControls) && GameSettings.showButtons)
                },
                this.state.betTooHigh?
                    'Supported':
                this.state.notEnoughBalance?
                    'Get more bits' :
                    D.div(null, D.span(null, 'Bet > ' + (100-Engine.winChances)), D.i({ className: 'fa fa-caret-square-o-right' }))
            );

            var betLoBtnClasses = cx({
                'btn': true,
                'btn-default': true,
                'ctl-button': true,
                'cant-bet': (this.state.notEnoughBalance || this.state.betTooHigh),
                'betting': (isBetting && Engine.currentBet.hiLo === false),
                'transparent': !GameSettings.showButtons,
                'disabled': this.props.disableControls
            });
            betLoBtn = D.button(
                {
                    id: 'bet-lo-button',
                    className: betLoBtnClasses,
                    onClick: this.state.betTooHigh? this.props._toggleSettings : this.state.notEnoughBalance? this.props._toggleDepositAddress : this._betLo,
                    disabled: ((isBetting || this.props.disableControls) && GameSettings.showButtons)
                },
                this.state.betTooHigh?
                    'Bet not':
                this.state.notEnoughBalance?
                    'Not enough bits' :
                    D.div(null, D.i({ className: 'fa fa-caret-square-o-left' }), D.span(null, ('Bet < ' + Engine.winChances)))
            );

            var chaseDivideBetBtnClasses = cx({
                'btn': true,
                'btn-default': true,
                'ctl-button': true,
                'transparent': !GameSettings.showButtons,
                'disabled': this.props.disableControls
            });
            chaseBetBtn = D.button({
                    id: 'bet-chase-bet-button',
                    className: chaseDivideBetBtnClasses,
                    onClick: this._chaseBet,
                    disabled: ((isBetting || this.props.disableControls) && GameSettings.showButtons)
                },
                D.span(null, 'x' + getBetMultiplier().toFixed(2)),
                D.i({ className: 'fa fa-caret-square-o-up' })
            );
            divideBetBtn = D.button({
                    id: 'bet-divide-bet-button',
                    className: chaseDivideBetBtnClasses,
                    onClick: this._divideBet,
                    disabled: ((isBetting || this.props.disableControls) && GameSettings.showButtons)
                },
                D.i({ className: 'fa fa-caret-square-o-down' }),
                D.span(null, '/' + getBetMultiplier().toFixed(2))
            );

            var potentialProfit = Clib.satToBit(Engine.getPotentialProfit());

            return D.div(null,

                //Absolute positioned buttons relative to the controls-container-div
                D.div({ id: 'controls-container-buttons' },
                    betHiBtn,
                    betLoBtn,
                    chaseBetBtn,
                    divideBetBtn
                ),

                //The fixed bottom bar
                D.div({ id: 'controls-pre-container-box' },

                    D.div({ id: 'controls-container-box' },

                        D.div({ id: 'ctl-settings-btn', onClick: this.props._toggleSettings },
                            D.i({ className: 'fa fa-cog'})
                        ),

                        D.div({ id: 'ctl-bet-box', onClick: this.props._toggleSettings },
                            D.div({ className: 'ctl-state-name' },
                                D.span(null, 'BET')
                            ),
                            D.div({ className: 'crl-in-bottom' },
                                D.div({ className: 'ctl-state-amount' },
                                    D.span(null, Clib.satToBitFloored(Engine.wager))
                                ),
                                D.span({ className: 'ctrl-state-lbl' },
                                    '\u00a0', Clib.bitsTextTerm(Clib.satToBitFloored(Engine.wager))
                                )
                            )
                        ),

                        D.div({ id: 'ctl-payout-box', onClick: this.props._toggleSettings },
                            D.div({ className: 'ctl-state-name' },
                                D.span(null, 'PAYOUT')
                            ),
                            D.div({ className: 'crl-in-bottom' },
                                D.div({ className: 'ctl-state-amount' },
                                    D.span(null, Engine.getPayout())
                                ),
                                D.span({ className: 'ctrl-state-lbl' },
                                    D.i({ className: 'fa fa-times' })
                                )
                            )
                        ),

                        D.div({ id: 'ctl-win-chances-box', onClick: this.props._toggleSettings },
                            D.div({ className: 'ctl-state-name' },
                                D.span(null, 'WIN CHANCES')
                            ),
                            D.div({ className: 'crl-in-bottom' },
                                D.div({ className: 'ctl-state-amount' },
                                    D.span(null, (Engine.winChances / 101 * 100).toFixed(2))
                                ),
                                D.span({ className: 'ctrl-state-lbl' },
                                    D.i({ className: 'icon-percent'})
                                )
                            )
                        ),
	                    D.div({ id: 'ctl-jackpot-box', onClick: this.props._toggleSettings },
		                    D.div({ className: 'ctl-state-name' },
			                    D.span(null, 'POTENTIAL PROFIT')
		                    ),
		                    D.div({ className: 'crl-in-bottom' },
			                    D.div({ className: 'ctl-state-amount' },
				                    D.span(null, potentialProfit.toFixed(2))
			                    ),
			                    D.span({ className: 'ctrl-state-lbl' },
				                    '\u00a0', Clib.bitsTextTerm(potentialProfit)
			                    )
		                    )
	                    )
                )
                )
            );

        }
    });
});