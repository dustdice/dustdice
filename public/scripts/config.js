requirejs.config({
    baseUrl: "scripts/", //If no baseUrl is explicitly set in the configuration, the default value will be the location of the HTML page that loads require.js.
    paths: {
        'highcharts': 'lib/highcharts-src',
        'highcharts-theme': 'lib/dark-unica',
        'highcharts-bubble': 'lib/highcharts-bubble',
        'jquery': 'lib/jquery',
        'jqueryui': 'lib/jquery-ui-1.11.2/jquery-ui.min',
        'screenfull': 'lib/screenfull',
        'react-bootstrap': 'lib/react-bootstrap',
        'class-names': 'lib/class-names'
    },
    shim: {
        'react-bootstrap': {
            deps: ['lib/react']
        },
        jqueryui: ['jquery'],
        highcharts: {
            deps: ['jquery'],
            exports: 'Highcharts'
        },

        'highcharts-bubble': {
            deps: ['highcharts']
        },

        'highcharts-theme': {
            deps: ['highcharts', 'jqueryui', 'highcharts-bubble'],
            exports: 'Highcharts'
        }
    }
});

require(['main']);