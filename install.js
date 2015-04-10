var fs = require('fs');
var exec = require('child_process').exec;

var requirejs = require('requirejs');
var assert = require('assert');

if(process.env.NODE_ENV !== 'production')
    return;

console.log('Running install script');

//Set file names for the optimized files
var config = {
    jsBuildFilename: Math.round(Math.random()*295682831396).toString(16), //Random name
    cssBuildFilename: Math.round(Math.random()*208613985927).toString(16) //Random name
};

fs.writeFile('src/config.js', JSON.stringify(config), function (err) {
    if (err) throw err;
    console.log('Config file created');
});

var options = {
    appDir: './public',
    baseUrl: 'scripts',
    dir: './build',
    name: 'config',

    removeCombined: true,
    mainConfigFile: "public/scripts/config.js",
    preserveLicenseComments: false,
    optimize: "none", //uglify2
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

var todo = [];
function execute(command) {
    todo.push(command);

    if (todo.length === 1)
        run();

    function run() {
        var command = todo[0];
        exec(command, function(err, stdout, stderr) {
            console.log('exec result (' + command + ') ', err, stdout, stderr);
            assert(!err);
            if (stderr) console.error(stderr);

            todo.shift();
            if (todo.length > 0)
                run();
        });
    }

}

requirejs.optimize(options, function (buildResponse) {
    //buildResponse is just a text output of the modules
    //included. Load the built file for the contents.
    //Use config.out to get the optimized file contents.
    //var contents = fs.readFileSync(config.out, 'utf8');

    console.log(buildResponse);


    //Copy the build files with the hashed name
    execute('cp ./build/scripts/config.js ./build/scripts/' + config.jsBuildFilename + '.js');
    execute('cp ./build/css/app.css ./build/css/' + config.cssBuildFilename + '.css');

}, function(err) {
    console.error('[Error on require optimization]: ', err);
    //optimization err callback
});