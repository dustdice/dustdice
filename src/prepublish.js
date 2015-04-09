var requirejs = require('requirejs');


var config = {
    appDir: './public',
    baseUrl: 'scripts',
    dir: './build',
    name: 'config',

    removeCombined: true,
    mainConfigFile: "public/scripts/config.js",
    preserveLicenseComments: false,
    optimize: "uglify2",
    optimizeCss: "standard",
    findNestedDependencies: true

    //If i use almond it breaks
    //include: ['config'],
    //The first call
    //insertRequire: ['config'],
    //wrap: true,

    //If i add require it breaks, looks like it is the react-boostrap react dependency
    //paths: {
    //  requireLib: 'lib/require'
    //},
    //include: 'requireLib',

};


requirejs.optimize(config, function (buildResponse) {
    //buildResponse is just a text output of the modules
    //included. Load the built file for the contents.
    //Use config.out to get the optimized file contents.
    var contents = fs.readFileSync(config.out, 'utf8');
    console.log(buildResponse);
}, function(err) {
    console.error('[Error on require optimization]');
    //optimization err callback
});