define([
    'lib/react',
    'components/graph',
    'components/controls-container',
    'lib/fastclick'
], function(
    React,
    GraphClass,
    ControlsContainerClass,
    FastClick
){
    var Graph = React.createFactory(GraphClass);
    var ControlsContainer = React.createFactory(ControlsContainerClass);

    FastClick.attach(document.body);

    React.render(Graph(), document.getElementById('graph-container'));
    React.render(ControlsContainer(), document.getElementById('controls-container'));
});