var fs = require('fs');
var exec = require('child_process').exec;
var crypto = require('crypto');

var requirejs = require('requirejs');
var assert = require('assert');

console.log('Running install script');

if(process.env.NODE_ENV !== 'production')
    return;

function hash(filename) {
    var shasum = crypto.createHash('sha1');
    shasum.update(fs.readFileSync(filename));
    return shasum.digest('hex');
}

//Set file names for the optimized files
var config = {
    jsBuildFilename: hash('./public/scripts/config.js').substring(0, 8),
    cssBuildFilename: hash('./public/css/app.css').substring(0, 8)
};

fs.writeFileSync('./src/config.js', JSON.stringify(config));

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


console.log('optimizing');
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