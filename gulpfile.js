var fs = require('fs');
var gulp = require('gulp');
var requirejs = require('requirejs');
var vinylPaths = require('vinyl-paths');
var del = require('del');
var minifyCss = require('gulp-minify-css');
var runSequence = require('run-sequence');
var merge = require('merge-stream');
var crypto = require('crypto');
var exec = require('child_process').exec;
var assert = require('assert');

console.log('Running install script');


gulp.task('install', function(callback) {
    runSequence('clean:build', ['minify-js', 'minify-css', 'copy:assets'], 'config-hash', callback);
});

/** Copy the final CSS and JS to build folder with the hashed names and store the name in config.js **/
gulp.task('config-hash', function(callback) {
    //Set file names for the optimized files
    var config = {
        jsBuildFilename: hash('./build/scripts/config.js').substring(0, 8),
        cssBuildFilename: hash('./build/css/app.css').substring(0, 8)
    };

    fs.writeFile('./build/config.json', JSON.stringify(config), function(err) {
        if(err)
            callback(err);

        //Copy the build files with the hashed name
        execute('cp ./build/scripts/config.js ./build/scripts/' + config.jsBuildFilename + '.js');
        execute('cp ./build/css/app.css ./build/css/' + config.cssBuildFilename + '.css');

        callback(); //OK
    });
});

/** Minify the Javascript with requireJs optizer **/
gulp.task('minify-js', function(callback) {
    requirejs.optimize(options, function (buildResponse) {
        //console.log('Js Compressed!', buildResponse);
        callback();

    }, function(err) {
        callback(err);
        console.error('[Error on require optimization]: ', err);
    });

});

/** Minify game and landing css into build dir **/
gulp.task('minify-css', function() {
    var appStream = gulp.src('public/css/app.css')
        .pipe(minifyCss({ advanced: false, aggressiveMerging: false, restructuring: false, shorthandCompacting: false }))
        .pipe(gulp.dest('build/css'));

    var landingStream = gulp.src('public/css/landing.css')
        .pipe(minifyCss({compatibility: 'ie8'}))
        .pipe(gulp.dest('build/css'));

    return merge(appStream, landingStream);
});

/** Delete everything inside build folder **/
gulp.task('clean:build', function () {
    return gulp.src('build/*')
        .pipe(vinylPaths(del));
});

/** Copy the necessary files to prod folder **/
gulp.task('copy:assets', function() {
    var imgStream = gulp.src('public/img/**')
        .pipe(gulp.dest('build/img'));
    var fontsStream = gulp.src('public/fonts/**')
        .pipe(gulp.dest('build/fonts'));

    return merge(imgStream, fontsStream);
});

/** RequireJS Optimizer options **/
var options = {
    baseUrl: './public/scripts',
    out: './build/scripts/config.js',

    mainConfigFile: "./public/scripts/config.js",
    preserveLicenseComments: false,
    generateSourceMaps: true,
    optimize: "uglify2",

    wrap: {
        startFile: './src/startWrap.frag',
        endFile: './src/endWrap.frag'
    },

    include: ['lib/almond', 'config']
};

function hash(filename) {
    var shasum = crypto.createHash('sha1');
    shasum.update(fs.readFileSync(filename));
    return shasum.digest('hex');
}

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

