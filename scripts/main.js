define([
    'lib/react',
    'components/graph',
    'components/controls'
], function(
    React,
    GraphClass,
    ControlsClass
){
    var Graph = React.createFactory(GraphClass);
    var Controls = React.createFactory(ControlsClass);

    React.render(Graph(), document.getElementById('graphContainer'));
    React.render(Controls(), document.getElementById('controlsContainer'));
});