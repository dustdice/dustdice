define([
    'lib/react',
    'lib/clib',
    'game-logic/engine',
    'stores/game-settings'
],function(
    React,
    Clib,
    Engine,
    GameSettings
){
    var D = React.DOM;
    var cx = React.addons.classSet;


    /** Validate the input text or number of the wager in bits */
    function validateBetBits(bet) {
        var validity = 'valid', message = '';
        bet = Number(bet);
        if(!Clib.isInteger(bet)) {
            validity = 'wrong';
            message = 'Should be an integer';
        } else if(bet < 1) {
            validity = 'wrong';
            message = 'Should be bigger than zero';
        //} else if((Clib.bitToSat(bet) * (98/Engine.winProb) - Clib.bitToSat(bet)) > Engine.maxWin) {
        //    validity = 'warning';
        //    message = "The Achievable profit is bigger than the vault's max";
        } else if(bet > Clib.satToBit(Engine.balance)) {
            validity = 'warning';
            message = 'Not enough balance :o';
        }

        return [validity, message];
    }

    /** Validate the input text or number of the jackpot in bits **/
    function validateJackpotBits(jackpot) {
        var validity = 'valid', message = '';
        jackpot = Number(jackpot);
        if(!Clib.isInteger(jackpot)) {
            validity = 'wrong';
            message = 'Should be an integer';
        } else if(jackpot < 1) {
            validity = 'wrong';
            message = 'Should be bigger than zero';
        } else if(Clib.bitToSat(jackpot) > Engine.maxWin) {
            validity = 'warning';
            message = "The jackpot is bigger than the vault's max";
        }

        return [validity, message];
    }

    function validateClientSeed(seed) {
        if(seed == '')
            return new Error('Write a 32 bit number :)');
        seed = Number(seed);
        if(!Clib.isInteger(seed))
            return new Error('Should be an integer');
        if(seed < 0)
            return new Error('Should be greater or equal than zero');
        if(seed >= Math.pow(2,32))
            return new Error('Should less than 4294967296(32 bits)');

        return seed;
    }

    return React.createClass({
        displayName: 'Game Settings',

        propTypes: {
            _toggleSettings: React.PropTypes.func.isRequired,
            _clearHistory: React.PropTypes.func.isRequired
        },

        getInitialState: function() {
            var wagerBitsRounded = Clib.satToBitRounded(Engine.wager);
            var wagerValidation = validateBetBits(wagerBitsRounded);
            var jackpotBits = Clib.satToBit(Engine.jackpot);
            var jackpotValidation = validateJackpotBits(jackpotBits);
            return {
                wagerInputText: String(wagerBitsRounded),
                wagerValidity: wagerValidation[0],
                wagerValidityMessage: wagerValidation[1],
                jackpotInputText: String(jackpotBits),
                jackpotValidity: jackpotValidation[0],
                jackpotValidityMessage: jackpotValidation[1],
                clientSeedText: String(Engine.clientSeed),
                invalidClientSeed: false,
                tab: 'BET' // BET || FAIR
            }
        },

        componentDidMount: function() {
            Engine.on('all', this._onChange);
            GameSettings.on('all', this._onChange);
        },

        componentWillUnmount: function() {
            Engine.off('all', this._onChange);
            GameSettings.off('all', this._onChange);
        },

        _onChange: function() {
            if(this.isMounted())
                this.setState(this._getState());
        },

        _getState: function() { //TODO?: Subscribe the component to individual events and only update individual state changes if necessary
            if(Engine.clientSeed != this.state.clientSeedText)
                this.setState({ clientSeedText: String(Engine.clientSeed), invalidClientSeed: false  });

            var wagerBitsRounded = Clib.satToBitRounded(Engine.wager);
            if(wagerBitsRounded != this.state.wagerInputText) {
                var wagerBitsString = String(wagerBitsRounded);
                var wagerValidation = validateBetBits(wagerBitsString);
                this.setState({ wagerInputText: wagerBitsString, wagerValidity: wagerValidation[0], wagerValidityMessage: wagerValidation[1] });
            }

            return { engine: Engine, gameSettings: GameSettings }; //Just to render on changes
        },

        _setWinProb: function(ev) {
            Engine.setWinProb(parseInt(ev.target.value));
        },

        _setWager: function(ev) {
            var wagerValidation = validateBetBits(ev.target.value);

            this.setState({ wagerInputText: ev.target.value, wagerValidity: wagerValidation[0], wagerValidityMessage: wagerValidation[1] });

            if(wagerValidation[0] === 'wrong')
                return;

            Engine.setWager(Clib.bitToSat(parseInt(ev.target.value)));
        },

        _setMaxWager: function() {
            Engine.setWager(Engine.balance);
        },

        _setJackpot: function(ev) {
            var jackpotValidation = validateJackpotBits(ev.target.value);

            this.setState({ jackpotInputText: ev.target.value, jackpotValidity: jackpotValidation[0], jackpotValidityMessage: jackpotValidation[1] });

            if(jackpotValidation[0] === 'wrong')
                return;

            Engine.setJackpot(Clib.bitToSat(parseInt(ev.target.value)));
        },

        _setClientSeed: function(ev) {
            var seed = validateClientSeed(ev.target.value);

            if(seed instanceof Error)
                return this.setState({ clientSeedText: ev.target.value, invalidClientSeed: seed.message });

            this.setState({ clientSeedText: ev.target.value, invalidClientSeed: false });
            Engine.setClientSeed(ev.target.value);
        },

        _genClientSeed: function() {
            Engine.setClientSeed(Clib.randomUint32());
        },

        _toggleShowButtons: function() {
            GameSettings.toggleShowButtons();
        },

        _selectTab: function(tab) {
            var self = this;
          return function() {
              self.setState({ tab: tab });
          }
        },

        render: function() {

            var body;

            switch (this.state.tab) {

                case 'BET':

                    var wager = (this.state.wagerValidity !== 'wrong')? Clib.bitToSat(Number(this.state.wagerInputText)) : Engine.wager;
                    var achievableBetProfit = wager * (98/Engine.winProb) - wager;
                    var betTooHigh = (achievableBetProfit > Engine.maxWin);

                    var wagerDivClasses = cx({
                        'form-group': true,
                        'has-error': (this.state.wagerValidity === 'wrong'),
                        'has-warning': (this.state.wagerValidity === 'warning') || betTooHigh
                    });

                    var jackPotDivClasses = cx({
                        'form-group': true,
                        'has-error': (this.state.jackpotValidity === 'wrong'),
                        'has-warning': (this.state.jackpotValidity === 'warning')
                    });


                    body = D.div({ className: 'modal-body' },
                        D.div({ className: wagerDivClasses },
                            D.label({ className: 'control-label pull-left', htmlFor: 'set-input-wager' }, 'Bet'),
                            D.label({ className: 'control-label pull-right', htmlFor: 'set-input-wager' }, this.state.wagerValidityMessage? this.state.wagerValidityMessage : ''),
                            D.div({ className: 'input-group clear' },
                                D.input({ type: 'text', className: 'form-control', id: 'set-input-wager', value: this.state.wagerInputText, onChange: this._setWager }),
                                D.span({ className: 'input-group-btn'},
                                    D.button({ className: 'btn btn-default', type: 'button', onClick: this._setMaxWager }, 'Max')
                                )
                            )
                        ),

                        D.div({ className: jackPotDivClasses },
                            D.label({ className: 'control-label pull-left', htmlFor: 'set-jackpot-amount' }, 'Jackpot'),
                            D.label({ className: 'control-label pull-right', htmlFor: 'set-jackpot-amount' }, this.state.jackpotValidityMessage? this.state.jackpotValidityMessage: ''),
                            D.input({ type: 'text', className: 'form-control', id: 'set-jackpot-amount', value: this.state.jackpotInputText, onChange: this._setJackpot })
                        ),

                        D.div({ className: 'form-group' + (betTooHigh? ' has-warning' : '') },
                            D.label({ className: 'control-label pull-left', htmlFor: 'set-win-chance-slider' }, 'Wining probability: ' + Engine.winProb + '%'),
                            D.label({ className: 'control-label pull-right', htmlFor: 'set-win-chance-slider' }, 'Payout: ' + (98/Engine.winProb).toFixed(2) + 'x'),
                            D.input({ className: 'set-win-prob-range', type: 'range', max: '97', min: '1', id: 'set-win-chance-slider', value: Engine.winProb, onChange: this._setWinProb })
                        ),

                        D.div({ className: 'form-group' + (betTooHigh? ' has-warning' : '') },
                            D.label({ className: 'control-label pull-left', htmlFor: 'set-input-wager' }, betTooHigh? "The profit is bigger than vault's allowed profits" : ''),
                            D.div({ className: 'input-group clear' },
                                D.div({ className: 'input-group-addon input-title'}, 'Win Profit'),
                                D.input({ type: 'text', className: 'form-control', id: 'set-input-wager', value: Clib.formatSatoshis(achievableBetProfit, 2), readOnly: true })
                            )
                        ),

                        D.div({ className: 'form-group' },
                            D.div({ className: 'input-group clear' },
                                D.div({ className: 'input-group-addon input-title'}, "Vault's Max Profit"),
                                D.input({ type: 'text', className: 'form-control', id: 'set-input-wager', value: Clib.formatSatoshis(Engine.maxWin, 2), readOnly: true })
                            )
                        )
                    );

                break;

                case 'FAIR':
                    body = D.div({ className: 'modal-body' },

                        D.div({ className: 'form-group' },
                            D.label({ className: 'control-label', htmlFor: 'set-game-hash' }, 'Next Game Hash'),
                            D.input({ type: 'text', className: 'form-control', id: 'set-game-hash', defaultValue: Engine.nextGameHash, readOnly: true })
                        ),

                        D.div({ className: 'form-group' + ((this.state.invalidClientSeed)? ' has-error' : '') },
                            D.label({ className: 'control-label pull-left', htmlFor: 'set-client-seed' }, 'Client Seed'),
                            D.label({ className: 'control-label pull-right', htmlFor: 'set-client-seed' }, (this.state.invalidClientSeed)? this.state.invalidClientSeed : ''),
                            D.div({ className: 'input-group clear' },
                                D.input({ type: 'text', className: 'form-control', ref: 'clientSeed', id: 'set-client-seed', value: this.state.clientSeedText, onChange: this._setClientSeed }),
                                D.span({ className: 'input-group-btn'},
                                    D.button({ className: 'btn btn-default', type: 'button', onClick: this._genClientSeed }, 'Random')
                                )
                            )
                        )

                    );
                break;

                case 'VIEW':
                    body = D.div({ className: 'modal-body' },
                        D.div({ className: 'row' },
                            D.div({ className: 'col-xs-6' },
                                D.div({ className: 'checkbox' },
                                    D.label(null,
                                        D.input({ type: 'checkbox', checked: !GameSettings.showButtons, onChange: this._toggleShowButtons }, 'Remove Game Buttons')
                                    )
                                )
                            ),
                            D.div({ className: 'col-xs-6' },
                                D.button({ type: 'button', className: 'btn btn-default btn-block', onClick: this.props._clearHistory }, 'Clear History')
                            )
                        )
                    );
                break;

            }//\switch

            return D.div({ id: 'settings-modal', className: 'modal fade in', style: { display: 'block' } },

                D.div({ className: 'modal-dialog' },

                    D.div({ className: 'modal-content' },

                        D.div({ className: 'modal-header' },
                            D.button({ type: 'button', className: 'close', onClick: this.props._toggleSettings },
                                D.span({ 'aria-hidden': 'true' },
                                    String.fromCharCode(215)
                                )
                            ),
                            D.ul({ className: 'nav nav-tabs nav-justified' },
                                D.li({ role: 'presentation', className: (this.state.tab === 'BET')? 'active' : '', onClick: this._selectTab('BET') }, D.a({ href: '#' }, 'Bet')),
                                D.li({ role: 'presentation', className: (this.state.tab === 'FAIR')? 'active' : '', onClick: this._selectTab('FAIR')  }, D.a({ href: '#' }, 'Fair')),
                                D.li({ role: 'presentation', className: (this.state.tab === 'VIEW')? 'active' : '', onClick: this._selectTab('VIEW')  }, D.a({ href: '#' }, 'View'))
                            )
                        ),

                        body
                    )
                )
            )



        }
    });
});