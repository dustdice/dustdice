({
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

})