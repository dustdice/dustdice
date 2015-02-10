define([
    'game-logic/engine',
    'lib/react'
], function(
    Engine,
    React
){
    var D = React.DOM;

    return React.createClass({
        displayName: 'TopBar',

        componentDidMount: function() {
            Engine.addBetListener(this.onNewBet);
        },

        componentWillUnmount: function() {
            Engine.removeBetListener(this.onNewBet);
        }
    });
});