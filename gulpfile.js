var fs = require('fs');
var gulp = require('gulp');
var requirejs = require('requirejs');
var vinylPaths = require('vinyl-paths');
var del = require('del');
var minifyCss = require('gulp-minify-css');
var runSequence = require('run-sequence');
var merge = require('merge-stream');
var crypto = require('crypto');
var es = require('event-stream');
var hash = require('gulp-hash');
var extend = require('gulp-extend');
var replace = require('gulp-replace');
var rename = require("gulp-rename");

var production = process.env.NODE_ENV === 'production';
var configJsonPath = './build/config.json';

gulp.task('install', function(callback) {
    runSequence('clean:build', ['minify-js', 'minify-css', 'copy:assets'], 'hash-files', 'get-file-names', 'replace-maps-name', callback);
});

/** Delete everything inside build folder **/
gulp.task('clean:build', function () {
    return gulp.src('build/*')
        .pipe(vinylPaths(del));
});

/** RequireJS Optimizer options **/
var options = {
    baseUrl: "./public/scripts",
    out: "./build/scripts/config.js",

    mainConfigFile: "./public/scripts/config.js",
    preserveLicenseComments: false,
    generateSourceMaps: true,
    optimize: production? "uglify2" : "none",

    wrap: {
        startFile: './src/startWrap.frag',
        endFile: './src/endWrap.frag'
    },

    include: ['lib/almond', 'config']
};

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

/** Copy the necessary files to prod folder **/
gulp.task('copy:assets', function() {
    var imgStream = gulp.src('public/img/**')
        .pipe(gulp.dest('build/img'));
    var fontsStream = gulp.src('public/fonts/**')
        .pipe(gulp.dest('build/fonts'));
    var soundsStream = gulp.src('public/sounds/**')
        .pipe(gulp.dest('build/sounds'));

    return merge(imgStream, fontsStream, soundsStream);
});

/** Hash the config.js and the app.css files  **/
var hashOptions = {
    template: '<%= name %>-<%= hash %><%= ext %>'
};
gulp.task('hash-files', function(callback) {
    runSequence('hash-css', 'hash-js', callback);
});

    gulp.task('hash-css', function() {
        return addToManifest(
            gulp.src('./build/css/app.css')
                .pipe(hash(hashOptions))
                .pipe(gulp.dest('build/css'))
        );
    });

    gulp.task('hash-js', function() {
        return addToManifest(
            gulp.src('./build/scripts/config.js')
                .pipe(hash(hashOptions))
                .pipe(gulp.dest('build/scripts'))
        );
    });

/** Get the hashed file names of config.js and app.css **/
var configFile = null;
gulp.task('get-file-names', function (callback) {
    fs.readFile('./build/config.json', function(err, data) {
        if (err)
            return callback(err);

        configFile = JSON.parse(data);
        callback();
    });
});

/** RequireJs Optimizer does not support an option to hash the name of the file, so we need to hash it and then replace the name of the source maps **/
gulp.task('replace-maps-name', function(){

    var replaceStream = gulp.src('./build/scripts/' + configFile['config.js'], { base: './' })
        .pipe(replace('sourceMappingURL=config.js', 'sourceMappingURL=' + configFile['config.js']))
        .pipe(replace('sourceMappingURL=config.js.map', 'sourceMappingURL=' + configFile['config.js'] + '.map'))
        .pipe(gulp.dest('./'));

    var mapStream = gulp.src('./build/scripts/config.js.map')
        .pipe(rename('scripts/'+ configFile['config.js'] + '.map'))
        .pipe(gulp.dest('./build'));

    return merge(replaceStream, mapStream);
});

// Adds the files in `srcStream` to the manifest file, extending the manifest's current contents.
function addToManifest(srcStream) {
    return es.concat(
        gulp.src(configJsonPath),
        srcStream
            .pipe(hash.manifest(configJsonPath))
    )
        .pipe(extend(configJsonPath, false, 4))
        .pipe(gulp.dest('.'));
}