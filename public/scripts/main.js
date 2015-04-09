define([
    'lib/react',
    'components/game',
    'lib/fastclick'
], function(
    React,
    GameClass,
    FastClick
){
    console.log('Main.js');

    var Game = React.createFactory(GameClass);

    FastClick.attach(document.body);

    React.render(Game(), document.getElementById('game-container'));
});