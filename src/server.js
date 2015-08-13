var path = require('path');
var fs = require('fs');

var koa = require('koa');
var app = koa();
var router = require('koa-router');
var render = require('koa-swig');
var serve = require('koa-static');
var compress = require('koa-compress');

var port = process.env.PORT || 3001;
var production = process.env.NODE_ENV === 'production';
var redirectURI = process.env.REDIRECT_URI || 'http://localhost:'+port+'/game';
var chatURI = process.env.CHAT_URI || 'http://localhost:5001';
var appId = process.env.APP_ID || 1;

console.log('Running server, prod=', production);

var config = null;
if(production){
    config = JSON.parse(fs.readFileSync(__dirname + '/../build/config.json'));
    console.log('Loaded hash configuration: ', config);
}

app.poweredBy = false;

app.on('error', function(err) {
    console.error('Error: ', err, err.stack);
});

app.use(compress());
app.use(serve(production ? 'build' : 'public'));


/** Configure template engine **/
app.context.render = render({
    root: './views',
    cache: production ? 'memory' : false,
    ext: 'html'
});

/** Add anti frame header to all pages **/
app.use(function *(next) {
    this.set("Content-Security-Policy", "frame-ancestors 'none'");
    yield next;
});

app.use(router(app));

//Landing page
app.get('/', function *(next) {

    //If the logged in cookie is here redirect to the game
    if(this.cookies.get('is_logged'))
        return this.redirect('game');

    yield this.render('landing', {
        production: production,
        landing: true,
        redirectURI: redirectURI,
        appId: appId
    });
});

app.get('/faq', function *(next) {
    yield this.render('faq', {
        faq: true
    });
});

app.get('/game', function *(next) {
   yield this.render('game', {
       production: production,
       chatURI: chatURI,
       config: config
   })
});

app.listen(port, function() {
    console.log('listening on *:', port);
});