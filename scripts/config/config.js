requirejs.config({
    baseUrl: "scripts/", //If no baseUrl is explicitly set in the configuration, the default value will be the location of the HTML page that loads require.js.
    paths: {
        "highcharts": "lib/highcharts-src"
    },
    shim: {
        jquery: {
            exports: 'jQuery'
        },
        highcharts: {
            deps: ['lib/jquery'],
            exports: 'highcharts'

        }
    }

});

define(['main']);

