define([
    'lib/react',
    'lib/keymaster', //TODO: This is window,
    'game-logic/engine',
    'components/top-bar',
    'components/graph',
    'components/controls',
    'components/settings',
    'components/tutorial'
],
function(
    React,
    KeyMaster,
    Engine,
    TopBarClass,
    GraphClass,
    ControlsClass,
    GameSettings,
    GameTutorial
){
    var D = React.DOM;
    var TopBar = React.createFactory(TopBarClass);
    var Graph = React.createFactory(GraphClass);
    var Controls = React.createFactory(ControlsClass);

    var Settings = React.createFactory(GameSettings);
    var Tutorial = React.createFactory(GameTutorial);

    return React.createClass({

        //Global UI States
        getInitialState: function() {
            return {
                showSettings: false,
                showTutorial: false
            }
        },

        componentDidMount: function() {
            KeyMaster.key('c', this._clearHistory);
            KeyMaster.key('s', this._toggleSettings);

        },

        componentWillUnmount: function() {
            KeyMaster.key.unbind('c', this._clearHistory);
            KeyMaster.key.unbind('s', this._toggleSettings);
        },

        _toggleSettings: function() {
            this.setState({ showSettings: !this.state.showSettings, showTutorial: false });
        },

        _toggleTutorial: function() {
            this.setState({ showTutorial: !this.state.showTutorial, showSettings: false });
        },

        _clearHistory: function() {
            Engine.clearHistory();
        },

        render: function() {

            var set = this.state.showSettings ? Settings({
                _toggleSettings: this._toggleSettings,
                _clearHistory: this._clearHistory
            }) : null;

            var tut = this.state.showTutorial ? Tutorial({
                _toggleTutorial: this._toggleTutorial
            }) : null;

            return D.div(null,

                D.div({ id: 'top-bar-container' },
                    TopBar({
                        _toggleTutorial: this._toggleTutorial
                    })
                ),

                D.div({ id: 'graph-container' },
                    Graph()
                ),

                D.div({ id: 'controls-container' },
                    Controls({
                        _toggleSettings: this._toggleSettings,
                        _toggleTutorial: this._toggleTutorial
                    })
                ),

                set,
                tut
            )
        }
    });
});