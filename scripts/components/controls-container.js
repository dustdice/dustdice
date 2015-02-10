define([
    'lib/react',
    'components/controls',
    'components/settings',
    'game-logic/engine',
    'lib/keymaster', //TODO: This is window
    'lib/clib'
], function(
    React,
    ControlsClass,
    SettingsClass,
    Engine,
    KeyMaster,
    Clib
){
    /* Constants */
    var _widthTrigger = 992;

    var D = React.DOM;
    var Controls = React.createFactory(ControlsClass);
    var Settings = React.createFactory(SettingsClass);

    function getState() {
        var state = {};
        state.gameState = Engine.getGameState();
        state.gameState.wager = Clib.satToBit(state.gameState.wager);
        state.gameState.balance = Clib.satToBit(state.gameState.balance);
        state.gameState.maxBet = Clib.satToBit(state.gameState.maxBet);
        state.gameState.jackpot = Clib.satToBit(state.gameState.jackpot);
        state.wagerInputText = String(state.gameState.wager); //This is an intermediary state of the bet
        return state;
    }

    return React.createClass({
        displayName: 'ControlsContainer',

        getInitialState: function() {
            var state = getState();
            state.invalidWager = false;
            state.smallViewPort = (window.innerWidth < _widthTrigger);
            state.selectedView = Controls;
            return state;
        },

        componentDidMount: function() {
            window.addEventListener('resize', this._handleResize);
            Engine.addChangeListener(this._onChange);

            KeyMaster.key('up', this._doubleBet);
            KeyMaster.key('down', this._halfBet);
            KeyMaster.key('right', this._betHi);
            KeyMaster.key('left', this._betLo);
            KeyMaster.key('q', this._decreaseWinProb);
            KeyMaster.key('r', this._increaseWinProb);
        },

        componentWillUnmount: function() {
            window.removeEventListener('resize', this._handleResize);
            Engine.removeChangeListener(this._onChange);

            KeyMaster.key.unbind('up', this._doubleBet);
            KeyMaster.key.unbind('down', this._halfBet);
            KeyMaster.key.unbind('right', this._betHi);
            KeyMaster.key.unbind('left', this._betLo);
        },

        _onChange: function() {
            if(this.isMounted())
                this.setState(getState());
        },

        _handleResize: function() {
            var smallViewPort = (window.innerWidth < _widthTrigger);
            if(this.state.smallViewPort !== smallViewPort)
                this.setState({ smallViewPort: smallViewPort });
        },

        _setWinProb: function(ev) {
            Engine.setWinProb(parseInt(ev.target.value));
        },

        //Change the state of the bet input
        //and if its valid set it in the engine
        // *This will actually cause the wager Input text to bet updated by the engine with the same value :/
        _setWager: function(ev) {
            var wager = Clib.validateBitsBet(ev.target.value, this.state.gameState.maxBet);

            if(wager instanceof Error)
                return this.setState({ wagerInputText: ev.target.value, invalidWager: wager.message });

            this.setState({ wagerInputText: ev.target.value, invalidWager: false });

            Engine.setWager(Clib.bitToSat(parseInt(ev.target.value)));
        },

        _betHi: function() {
            if(this.state.gameState.gameState != 'BETTING')
                Engine.bet(true)
        },

        _betLo: function() {
            if(this.state.gameState.gameState != 'BETTING')
                Engine.bet(false)
        },

        _doubleBet: function() {
            var wager = Clib.validateBitsBet(this.state.gameState.wager * 2, this.state.gameState.maxBet);

            if(wager instanceof Error)
                return alert(wager.message);

            Engine.setWager(Clib.bitToSat(wager));
        },

        _halfBet: function() {
            if(this.state.gameState.wager > 2)
                Engine.setWager(Clib.bitToSat(parseInt(this.state.gameState.wager / 2)));
        },

        _increaseWinProb: function() {
            if(this.state.gameState.winProb<=97)
                Engine.setWinProb(this.state.gameState.winProb + 1);
        },

        _decreaseWinProb: function() {
            if(this.state.gameState.winProb>=2)
                Engine.setWinProb(this.state.gameState.winProb - 1);
        },

        _changeSelectedView: function() {
            if(this.state.selectedView == Controls)
                this.setState({ selectedView: Settings });
            else
                this.setState({ selectedView: Controls });
        },

        render: function() {

            var controlsProps = {
                smallWindow: false,
                betHi: this._betHi,
                betLo: this._betLo,
                doubleBet: this._doubleBet,
                halfBet: this._halfBet,
                increaseWinProb: this._increaseWinProb,
                decreaseWinProb: this._decreaseWinProb,
                gameState: this.state.gameState,
                key: 'controls'
            };

            var settingsProps = {
                smallWindow: false,
                wagerInputText: this.state.wagerInputText,
                invalidWager: this.state.invalidWager,
                setWagerText: this._setWager,
                setWinProb: this._setWinProb,
                gameState: this.state.gameState,
                key: 'settings'
            };

            var selector = D.ul({ className: 'nav nav-tabs controls-selector-container', key: 'controls-selector' },
                D.li({ className: 'active controls-selector', role: 'presentation', onClick: this._changeSelectedView },
                    D.a({ href: '#'}, (this.state.selectedView == Settings)? 'Controls' : 'Settings'))
            );

            var elements = [selector];

            //If the window is small only show the selected component and the selector
            if(this.state.smallViewPort) {
                //elements.push(selector);


                var elemProps = (this.state.selectedView == Settings)? settingsProps : controlsProps;
                elemProps.key = 'selected-view';
                elemProps.smallWindow = true;

                elements.push(
                    this.state.selectedView(elemProps)
                );

            //If the window is big show both components without selector
            } else {
                elements.push(
                    Controls(controlsProps)
                );
                elements.push(
                    Settings(settingsProps)
                );
            }

            return D.div({ id: 'controls-container-box' },
                D.div({ className: 'row no-margin   ' },
                    elements
                )
            );
        }
    });
});