define([
    'lib/react',
    'highcharts-theme',
    'game-logic/engine'
],function(
    React,
    HighCharts,
    Engine
){
    var D = React.DOM;

    var MAX_NUM_POINTS = 30;

    function getBetValues() {
        return Engine.getBetValues();
    }

    return React.createClass({
        displayName: 'Graph',

        chart: null,

        onWagerChange: function(wagerData) {
            if(!this.isMounted())
                return;

            var chartLength = this.chart.series[2].data.length-1;
            var chartIndex = this.chart.series[2].data[this.chart.series[2].data.length - 1].x;
            this.updateProjections(chartLength, chartIndex, wagerData);
        },

        shouldComponentUpdate: function(nextProps, nextState){
            return false; //Never render
        },

        onNewBet: function(game, wagerData) { //The position in the array of this bet
            if(!this.isMounted())
                return;

            //Create the new point and add it without redrawing
            var newPoint;
            if(game.win)
                newPoint = {
                    color: 'green',
                    lineColor: 'green',
                    y: wagerData.gameProfit,
                    radius: 7
                };
            else
                newPoint = {
                    color: 'red',
                    y: wagerData.gameProfit,
                    radius: 7
                };

            var chartLength = this.chart.series[2].data.length; //The real length of the chart
            var chartIndex = this.chart.series[2].data[this.chart.series[2].data.length - 1].x + 1;

            this.chart.series[2].data[chartLength-1].update({ radius: 4 }, false);
            this.chart.series[2].addPoint(newPoint); //The length of the graph is not updated until render time

            if(chartLength > MAX_NUM_POINTS)
                this.chart.series[2].data[0].remove();

            this.updateProjections(chartLength, chartIndex, wagerData);
        },

        updateProjections: function(chartLength, chartIndex, wagerData) {
            var wonProjection = wagerData.gameProfit + (wagerData.wager * wagerData.payout) - wagerData.wager;
            this.chart.series[0].data[0].update([chartIndex, wagerData.gameProfit], false);
            this.chart.series[0].data[1].update([chartIndex + 1, wonProjection], false);

            var LostProjection = wagerData.gameProfit - wagerData.wager;
            this.chart.series[1].data[0].update([chartIndex, wagerData.gameProfit], false);
            this.chart.series[1].data[1].update([chartIndex + 1, LostProjection]);
        },

        componentDidMount: function() {
            Engine.addWagerListener(this.onWagerChange);
            Engine.addBetListener(this.onNewBet);
            this.chart = createChart(this.refs.graphBox.getDOMNode(), Engine.getWagerValues());
        },

        componentWillUnmount: function() {
            Engine.removeWagerListener(this.onWagerChange);
            Engine.removeBetListener(this.onNewBet);

            this.chart.destroy();
        },

        render: function() {
            return D.div({ ref: 'graphBox' });
        }
    });

    function createSeries(wagerData) {
        var series = [];

        var profitSeries = {
            data: [
                { y: 0, color: 'green', radius: 7 }
            ]
        };

        //Create the won projection series
        var wonProjectionSeries = {
            color: "#12ff35",
            data: [
                {
                    y: 0,
                    x: 0
                },
                {
                    y: 0 + (wagerData.wager * wagerData.payout) - wagerData.wager,
                    x: 1
                }
            ]
        };

        //Create the lost projection series
        var lostProjectionSeries = {
            color: "#FA3C4F",
            data: [
                {
                    y: 0,
                    x: 0
                },
                {
                    y: 0 - wagerData.wager,
                    x: 1
                }
            ]
        };

        series.push(wonProjectionSeries);
        series.push(lostProjectionSeries);
        series.push(profitSeries);

        return series;
    }

    function createChart(node, wagerData) {
        return new Highcharts.Chart({
            chart: {
                renderTo: node,
                type: 'spline',
                //margin: [70, 50, 60, 80], //Margin around the graph container
                animation: {
                    duration: 0
                }
                //backgroundColor: '#272B30'
            },
            title: {
                text: 'Dust Dice'
                //style: {
                //    color: '#ffffff',
                //    fontWeight: 'bold'
                //}
            },
            subtitle: {
                text: 'The simplest casino you could find'
                //style: {
                //    color: '#ffffff',
                //    fontWeight: 'bold'
                //}
            },
            xAxis: {
                //gridLineWidth: 1,
                //minPadding: 0.2,
                //maxPadding: 0.2,
                //maxZoom: 60,
                //min: 0,
                //max: 30,
                //tickPixelInterval: 100,
                //tickInterval: 1,
                //minPadding: 0.2,
                minRange: 30,
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
            series: createSeries(wagerData)
        });

    }
});