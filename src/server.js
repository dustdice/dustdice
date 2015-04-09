var koa = require('koa');
var app = koa();
var router = require('koa-router');
var render = require('koa-swig');
var path = require('path');

var serve = require('koa-static');

var port = process.env.PORT || 3001;
var production = process.env.NODE_ENV === 'production';

app.poweredBy = false;

app.on('error', function(err) {
    console.error('Error: ', err, err.stack);
});

if(production)
    app.use(serve('build'));
else
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

/** Landing page **/
app.get('/', function *(next) {
    yield this.render('landing', {
        production: production,
        landing: true
    });
});

app.get('/faq', function *(next) {
    yield this.render('faq', {
        faq: true
    });
});

app.get('/game', function *(next) {
   yield this.render('game', {
       production: production
   })
});

app.listen(port, function() {
    console.log('listening on *:', port);
});

