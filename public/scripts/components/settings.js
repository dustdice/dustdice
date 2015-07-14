define([
    'lib/react',
    'game-logic/clib',
    'game-logic/engine',
    'stores/game',
    'react-bootstrap',
    'class-names'
],function(
    React,
    Clib,
    Engine,
    GameStore,
    ReactBootstrap,
    CX
){
    var D = React.DOM;

    var OverlayTrigger = React.createFactory(ReactBootstrap.OverlayTrigger);
    var ToolTip = React.createFactory(ReactBootstrap.Tooltip);


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
            _toggleSettings: React.PropTypes.func.isRequired
        },

        getInitialState: function() {
            var wagerBitsFloored = Clib.satToBitFloored(Engine.wager);
            var wagerValidation = Clib.validateBitsInput(wagerBitsFloored, Engine.balance);
            return {
                wagerInputText: String(wagerBitsFloored),
                wagerValidity: wagerValidation[0],
                wagerValidityMessage: wagerValidation[1],
                clientSeedText: String(Engine.clientSeed),
                invalidClientSeed: false,
                customBetMultiplierText: GameStore.customBetMultiplier,
                customBetMultiplierInvalid: false,
                tab: 'BET' // BET || FAIR
            }
        },

        componentDidMount: function() {
            Engine.on('all', this._onChange);
            GameStore.on('all', this._onChange);
        },

        componentWillUnmount: function() {
            Engine.off('all', this._onChange);
            GameStore.off('all', this._onChange);
        },

        _onChange: function() {
            if(this.isMounted())
                this.setState(this._getState());
        },

        _getState: function() { //TODO?: Subscribe the component to individual events and only update individual state changes if necessary
            if(Engine.clientSeed != this.state.clientSeedText)
                this.setState({ clientSeedText: String(Engine.clientSeed), invalidClientSeed: false  });

            var wagerBitsFloored = Clib.satToBitFloored(Engine.wager);
            if(wagerBitsFloored != this.state.wagerInputText) {
                var wagerBitsString = String(wagerBitsFloored);
                var wagerValidation = Clib.validateBitsInput(wagerBitsString, Engine.balance);
                this.setState({ wagerInputText: wagerBitsString, wagerValidity: wagerValidation[0], wagerValidityMessage: wagerValidation[1] });
            }

            if(Number(this.state.customBetMultiplierText) !== GameStore.customBetMultiplier)
                this.setState({ customBetMultiplierText: String(GameStore.customBetMultiplier) });

            return { engine: Engine, GameStore: GameStore }; //Just to render on changes
        },

        _setwinChances: function(ev) {
            Engine.setwinChances(parseInt(ev.target.value));
        },

        _setWager: function(ev) {
            var wagerValidation = Clib.validateBitsInput(ev.target.value, Engine.balance);

            this.setState({ wagerInputText: ev.target.value, wagerValidity: wagerValidation[0], wagerValidityMessage: wagerValidation[1] });

            if(wagerValidation[0] === 'wrong')
                return;

            Engine.setWager(Clib.bitToSat(parseInt(ev.target.value)));
        },

        _setMaxWager: function() {
            Engine.setWager(
              Math.max(100,
                 Math.min(Clib.floorHundreds(Engine.balance),
                   Clib.floorHundreds(Engine.maxWin / (Engine.getPayout()-1) ))
              )
            );
        },

        _setClientSeed: function(ev) {
            var seed = validateClientSeed(ev.target.value);

            if(seed instanceof Error)
                return this.setState({ clientSeedText: ev.target.value, invalidClientSeed: seed.message });

            this.setState({ clientSeedText: ev.target.value, invalidClientSeed: false });
            Engine.setClientSeed(Number(ev.target.value));
        },

        _genClientSeed: function() {
            Engine.setClientSeed(Clib.randomUint32());
        },

        _toggleShowButtons: function() {
            GameStore.toggleShowButtons();
        },

        _selectTab: function(tab) {
            var self = this;
          return function() {
              self.setState({ tab: tab });
          }
        },

        _toggleCustomBetMultiplier: function() {
            GameStore.toggleCustomBetMultiplier();
        },

        _setCustomBetMultiplier: function(ev) {
            this.setState({ customBetMultiplierText: ev.target.value });

            var multiplier = Number(ev.target.value);
            if(!Clib.isNumber(multiplier))
                this.setState({ customBetMultiplierInvalid: 'Should be a number' });
            else if(multiplier <= 0)
                this.setState({ customBetMultiplierInvalid: 'Should be greater than zero' });
            else {
                this.setState({ customBetMultiplierInvalid: false });
                GameStore.setCustomBetMultiplier(multiplier);
            }

        },

        _clearHistory: function() {
                Engine.clearHistory();
        },

        _increasewinChances: function() {
            Engine.increasewinChances();
        },

        _decreasewinChances: function() {
            Engine.decreasewinChances();
        },

        _handleBackDropClick: function(e) {
            if(e.target === e.currentTarget)
                this.props._toggleSettings();
        },

        //_setGraphRightMargin: function(e) {
        //    GameStore.setGraphRightMargin(e.target.value);
        //},

        render: function() {

            var body;

            switch (this.state.tab) {

                case 'BET':

                    var wager = (this.state.wagerValidity !== 'wrong')? Clib.bitToSat(Number(this.state.wagerInputText)) : Engine.wager;
                    var betTooHigh = Engine.isBetTooHigh();

                    var wagerDivClasses = CX({
                        'form-group': true,
                        'has-error': (this.state.wagerValidity === 'wrong'),
                        'has-warning': (this.state.wagerValidity === 'warning') || betTooHigh
                    });

                    var LinkWithTooltip = React.createFactory(React.createClass({
                        displayName: "LinkWithTooltip",
                        render: function() {
                            var tooltip = ToolTip(null, this.props.tooltip);

                            return (
                                OverlayTrigger({ placement: "top", overlay: tooltip, delayShow: 300, delayHide: 150 },
                                    D.a({ href: this.props.href }, this.props.children)
                                )
                            );
                        }
                    }));

                    body = D.div({ className: 'modal-body' },
                        D.div({ className: wagerDivClasses },
                            D.label({ className: 'control-label pull-left', htmlFor: 'set-input-wager' }, 'Bet\u00a0\u00a0', D.a({ href: '#', onClick: this._setMaxWager }, 'set max')),
                            D.label({ className: 'control-label pull-right', htmlFor: 'set-input-wager' }, this.state.wagerValidityMessage? this.state.wagerValidityMessage : ''),
                            D.div({ className: 'input-group clear' },
                                D.input({ type: 'text', className: 'form-control', id: 'set-input-wager', value: this.state.wagerInputText, onChange: this._setWager }),
                                D.div({ className: 'input-group-addon'}, "bits")
                            )
                        ),

                        D.div({ className: 'form-group' + (betTooHigh? ' has-warning' : '') },
                            D.label({ className: 'control-label pull-left', htmlFor: 'set-win-chance-slider' }, 'Chance of winning: ' + Engine.winChances + ' in 101'),
                            D.label({ className: 'control-label pull-right', htmlFor: 'set-win-chance-slider' },
	                            'Payout: ', Engine.getPayout(), 'x'),
                            D.input({ className: 'set-win-chances-range clear', type: 'range', max: '99', min: '1', id: 'set-win-chance-slider', value: Engine.winChances, onChange: this._setwinChances })
                        ),

                        D.hr(),

                        D.div({ className: 'form-group' + (betTooHigh? ' has-warning' : '') },
                            D.label({ className: 'control-label pull-left', htmlFor: 'set-input-wager' }, betTooHigh? "The profit is bigger than MoneyPot's max allowed profits" : ''),
                            D.div({ className: 'input-group clear' },
                                D.div({ className: 'input-group-addon input-title'}, 'Win Profit'),
                                D.input({ type: 'text', className: 'form-control', id: 'set-input-wager', value: Clib.formatSatoshis(Engine.getPotentialProfit(), 2), readOnly: true })
                            )
                        ),

                        D.div({ className: 'form-group' },
                            D.div({ className: 'input-group clear' },
                                D.div({ className: 'input-group-addon input-title'}, "MoneyPot Max Profit"),
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

                case 'CONTROLS':
                    body = D.div({ className: 'modal-body' },

                        D.div({ className: 'form-group' },
                            D.input({ id: 'remove-game-buttons', type: 'checkbox', checked: !GameStore.showButtons, onChange: this._toggleShowButtons }),
                            D.label({ htmlFor: 'remove-game-buttons' }, '\u00a0Hide Game Buttons')
                        ),

                        //[Feature disabled]
                        //D.div({ className: 'form-group' },
                        //    D.label({ className: 'control-label pull-left', htmlFor: 'set-graph-right-margin' }, 'Right graph margin: ' + GameStore.graphRightMargin),
                        //    D.input({ className: 'set-graph-right-margin clear', type: 'range', max: '10', min: '1', id: 'set-graph-right-margin', value: GameStore.graphRightMargin, onChange: this._setGraphRightMargin })
                        //),

                        D.div({ className: 'form-group' + (this.state.customBetMultiplierInvalid? ' has-error' : '') },
                            D.label({ className: 'control-label pull-left', htmlFor: 'set-client-seed' }, 'Custom bet multiplier'),
                            D.label({ className: 'control-label pull-right', htmlFor: 'set-input-wager' }, this.state.customBetMultiplierInvalid? this.state.customBetMultiplierInvalid : ''),
                            D.div({ className: 'input-group clear' },
                                D.span({ className: 'input-group-addon'},
                                    D.input({ type: 'checkbox', checked: GameStore.useCustomBetMultiplier, onChange: this._toggleCustomBetMultiplier })
                                ),
                                D.input({ type: 'text', className: 'form-control', value: this.state.customBetMultiplierText, onChange: this._setCustomBetMultiplier }),
                                D.span({ className: 'input-group-addon'},
                                    'x'
                                )
                            )
                        ),

                        D.b(null, 'More controls:'),
                        D.button({ type: 'button', className: 'btn btn-default btn-block', onClick: this._decreasewinChances }, 'Decrease win probability (Q)'),
                        D.button({ type: 'button', className: 'btn btn-default btn-block', onClick: this._increasewinChances }, 'Increase win probability (R)'),
                        D.button({ type: 'button', className: 'btn btn-default btn-block', onClick: this._clearHistory }, 'Clear History (C)'),
                        D.button({ type: 'button', className: 'btn btn-default btn-block', onClick: this.props._toggleSettings }, 'Close/Open settings (S)')
                    );
                break;

            }//\switch

            return D.div({ id: 'settings-modal', className: 'modal fade in', style: { display: 'block' }, onClick: this._handleBackDropClick },

                D.div({ className: 'modal-dialog' },

                    D.div({ className: 'modal-content' },

                        D.div({ className: 'modal-header' },
                            D.button({ type: 'button', className: 'close', onClick: this.props._toggleSettings },
                                D.span({ 'aria-hidden': 'true' },
                                    String.fromCharCode(215)
                                )
                            ),
                            D.h4({ className: 'modal-title' },
                                'Settings (S)'
                            )
                        ),

                        D.div({ classNam_: 'modal-nav' },
                            D.ul({ className: 'nav nav-tabs nav-justified' },
                                D.li({ role: 'presentation', className: (this.state.tab === 'BET')? 'active' : '', onClick: this._selectTab('BET') }, D.a({ href: '#' }, 'Bet')),
                                D.li({ role: 'presentation', className: (this.state.tab === 'FAIR')? 'active' : '', onClick: this._selectTab('FAIR')  }, D.a({ href: '#' }, 'Fair')),
                                D.li({ role: 'presentation', className: (this.state.tab === 'CONTROLS')? 'active' : '', onClick: this._selectTab('CONTROLS')  }, D.a({ href: '#' }, 'Controls'))
                            )
                        ),

                        body
                    )
                )
            )



        }
    });
});