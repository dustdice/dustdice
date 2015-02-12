requirejs.config({
    baseUrl: "scripts/", //If no baseUrl is explicitly set in the configuration, the default value will be the location of the HTML page that loads require.js.
    paths: {
        highcharts: 'lib/highcharts-src',
        'highcharts-theme': 'lib/dark-unica',
        jquery: 'lib/jquery',
        jqueryui: 'lib/jquery-ui-1.11.2/jquery-ui.min',
        'jquery-text-width': 'lib/jquery-plugins/text-width'
    },
    shim: {
        //jquery: {
        //    exports: '$'
        //},
        'jquery-text-width': ['jquery'],

        jqueryui: ['jquery'],

        highcharts: {
            deps: ['jquery'],
            exports: 'Highcharts'

        },
        'highcharts-theme': {
            deps: ['highcharts', 'jqueryui'],
            exports: 'Highcharts'
        }
    }

});

define(['main']);

