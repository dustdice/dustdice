define([
    'lib/react',
    'highcharts',
    'game-logic/engine'
],function(
    React,
    HighCharts,
    Engine
){
    var D = React.DOM;

    function getState() {
        var state = Engine.getBetValues();
        state.gameHistory = Engine.getHistory();
        return state;
    }

    return React.createClass({
        displayName: 'Graph',

        chart: null,

        getInitialState: function() {
            return getState();
        },

        _onChange: function() {
            if(this.isMounted())
                this.setState(getState());
        },

        shouldComponentUpdate: function(nextProps, nextState){ //TODO: More efficient way
            var series = createSeries(nextState);
            this.chart.series[0].setData(series[0].data);
            this.chart.series[1].setData(series[1].data);
            this.chart.series[2].setData(series[2].data);

            return false; //Never render
        },

        componentDidMount: function() {

            Engine.addChangeListener(this._onChange);
            this.chart = createChart(this.refs.graphBox.getDOMNode(), this.state);

            //For future reference
            //var self = this;
            //setTimeout(function(){
            //    //chart.series[0].addPoint([4000]);
            //    self.chart.destroy();
            //}, 3000);

        },

        componentWillUnmount: function() {
            Engine.removeChangeListener(this._onChange);

            this.chart.destroy();
        },

        render: function() {
            return D.div({ ref: 'graphBox' });
        }
    });

    function createSeries(state) {
        var series = [];

        //Create the history series
        var data = state.gameHistory;
        var profit = 0;
        var charData = data.map(function(game){
            if(game.win) {
                profit += game.wager * game.multiplier;
                return {
                    color: 'green',
                    lineColor: 'green',
                    y: profit
                }
            } else {
                profit -= game.wager;
                return {
                    color: 'red',
                    y: profit
                }
            }

        });
        charData.unshift({ y: 0, color: 'green' });

        //Create the won projection series
        var wonProjectionSeries = {
            color: "#12ff35",
            data: [
                {
                    y: profit,
                    x: state.gameHistory.length
                },
                {
                    y: profit + (state.wager * state.multiplier),
                    x: state.gameHistory.length + 1
                }
            ]
        };

        //Create the lost projection series
        var lostProjectionSeries = {
            color: "#FA3C4F",
            data: [
                {
                    y: profit,
                    x: state.gameHistory.length
                },
                {
                    y: profit - (state.wager * state.multiplier),
                    x: state.gameHistory.length + 1
                }
            ]
        };

        series.push(wonProjectionSeries);
        series.push(lostProjectionSeries);
        series.push({
            data: charData
        });

        return series;
    }

    function createChart(node, state) {
        return new Highcharts.Chart({
            chart: {
                renderTo: node,
                type: 'scatter',
                margin: [70, 50, 60, 80],
                animation: {
                    duration: 1
                }
            },
            title: {
                text: 'Dust Dice'
            },
            subtitle: {
                text: 'The simplest casino you could find'
            },
            xAxis: {
                gridLineWidth: 1,
                minPadding: 0.2,
                maxPadding: 0.2,
                maxZoom: 60,
                min: 0,
                max: 30,
                allowDecimals: false
            },
            yAxis: {
                title: {
                    text: 'Balance'
                },
                minPadding: 0.2,
                maxPadding: 0.2,
                maxZoom: 60,
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            legend: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            plotOptions: {
                series: {
                    lineWidth: 1,
                    marker: {
                        //radius: 8,
                        symbol: 'circle'
                    }
                }
            },
            series: createSeries(state)
        });

    }
});