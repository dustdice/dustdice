var koa = require('koa');
var app = koa();
var router = require('koa-router');
var render = require('koa-swig');
var path = require('path');



app.on('error', function(err) {
    console.error('Error: ', err, err.stack);
});


app.poweredBy = false;
app.use(require('koa-static')('public'));

var port = process.env.PORT || 3001;


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
        production: process.env.NODE_ENV === 'production',
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
       production: process.env.NODE_ENV === 'production'
   })
});

app.listen(port, function() {
    console.log('listening on *:', port);
});

