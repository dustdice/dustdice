define([
    'lib/react',
    'components/game',
    'lib/fastclick'

], function(
    React,
    GameClass,
    FastClick
){
    var Game = React.createFactory(GameClass);

    FastClick.attach(document.body);

    React.render(Game(), document.getElementById('game-container'));
});