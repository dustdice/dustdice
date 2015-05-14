define([
    'lib/react',
    'components/game',
    'lib/fastclick',
    'game-logic/engine',
    'game-logic/clib'
], function(
    React,
    GameClass,
    FastClick,
    Engine,
    Clib
){
    var urlParams = Clib.getHashParams();
    window.history.replaceState({}, '', '#!/');

    var Game = React.createFactory(GameClass);

    FastClick.attach(document.body);

    React.render(Game(), document.getElementById('game-container'));

    Engine.connect(urlParams);
});