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
var chatURI = process.env.CHAT_URI || 'http://localhost:4000';
var appId = process.env.APP_ID || 1;

console.log('Running server, prod=', process.env.NODE_ENV === 'production');

var config = null;
if(production){
    config = fs.readFileSync(__dirname + '/config.js');
    config = JSON.parse(config);
}

app.poweredBy = false;

app.on('error', function(err) {
    console.error('Error: ', err, err.stack);
});

if(production) {
    app.use(compress());
    app.use(serve('build'));
} else
    app.use(serve('public'));

/** Configure template engine **/
app.context.render = render({
    root: './views',
    autoescape: true,
    cache: false, //'memory', // disable, set to false
    ext: 'html'
    //locals: {}, //Send something?
    //filters: filters,
    //tags: tags,
    //extensions: extensions
});

app.use(router(app));

//Landing page
app.get('/', function *(next) {
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

